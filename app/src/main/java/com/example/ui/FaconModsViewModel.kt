package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.AppDatabase
import com.example.data.CampaignEntity
import com.example.data.CampaignTaskEntity
import com.example.data.CampaignWithTasks
import com.example.data.TaskType
import com.example.util.CampaignIdGenerator
import com.example.util.UrlValidator
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

enum class AppScreen {
    CREATE,
    VISITOR,
    CAMPAIGNS,
    POLICY
}

enum class VerificationStatus {
    PENDING,
    IN_PROGRESS,
    VERIFIED,
    ERROR
}

class FaconModsViewModel(application: Application) : AndroidViewModel(application) {

    private val dao = AppDatabase.getInstance(application).campaignDao()

    val allCampaigns: StateFlow<List<CampaignWithTasks>> = dao.getAllCampaignsWithTasks()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _currentScreen = MutableStateFlow(AppScreen.CREATE)
    val currentScreen: StateFlow<AppScreen> = _currentScreen.asStateFlow()

    // Creator Form State
    private val _selectedTasks = MutableStateFlow<Set<TaskType>>(emptySet())
    val selectedTasks: StateFlow<Set<TaskType>> = _selectedTasks.asStateFlow()

    private val _taskUrls = MutableStateFlow<Map<TaskType, String>>(emptyMap())
    val taskUrls: StateFlow<Map<TaskType, String>> = _taskUrls.asStateFlow()

    private val _taskErrors = MutableStateFlow<Map<TaskType, String>>(emptyMap())
    val taskErrors: StateFlow<Map<TaskType, String>> = _taskErrors.asStateFlow()

    private val _destinationUrl = MutableStateFlow("")
    val destinationUrl: StateFlow<String> = _destinationUrl.asStateFlow()

    private val _destinationError = MutableStateFlow<String?>(null)
    val destinationError: StateFlow<String?> = _destinationError.asStateFlow()

    private val _isGenerating = MutableStateFlow(false)
    val isGenerating: StateFlow<Boolean> = _isGenerating.asStateFlow()

    private val _lastGeneratedCampaign = MutableStateFlow<CampaignWithTasks?>(null)
    val lastGeneratedCampaign: StateFlow<CampaignWithTasks?> = _lastGeneratedCampaign.asStateFlow()

    // Visitor Screen State
    private val _currentVisitorCampaign = MutableStateFlow<CampaignWithTasks?>(null)
    val currentVisitorCampaign: StateFlow<CampaignWithTasks?> = _currentVisitorCampaign.asStateFlow()

    private val _taskVerificationStatus = MutableStateFlow<Map<Long, VerificationStatus>>(emptyMap())
    val taskVerificationStatus: StateFlow<Map<Long, VerificationStatus>> = _taskVerificationStatus.asStateFlow()

    private val _statusMessage = MutableStateFlow<String?>(null)
    val statusMessage: StateFlow<String?> = _statusMessage.asStateFlow()

    private val _showVerificationInfo = MutableStateFlow(false)
    val showVerificationInfo: StateFlow<Boolean> = _showVerificationInfo.asStateFlow()

    fun navigateTo(screen: AppScreen) {
        _currentScreen.value = screen
    }

    fun toggleTask(taskType: TaskType) {
        val current = _selectedTasks.value.toMutableSet()
        val currentUrls = _taskUrls.value.toMutableMap()
        val currentErrors = _taskErrors.value.toMutableMap()

        if (current.contains(taskType)) {
            current.remove(taskType)
            currentUrls.remove(taskType)
            currentErrors.remove(taskType)
        } else {
            current.add(taskType)
            // Pre-fill with empty string so input appears
            if (!currentUrls.containsKey(taskType)) {
                currentUrls[taskType] = ""
            }
        }

        _selectedTasks.value = current
        _taskUrls.value = currentUrls
        _taskErrors.value = currentErrors
    }

    fun updateTaskUrl(taskType: TaskType, url: String) {
        val current = _taskUrls.value.toMutableMap()
        current[taskType] = url
        _taskUrls.value = current

        // Clear error as user types
        if (_taskErrors.value.containsKey(taskType)) {
            val errors = _taskErrors.value.toMutableMap()
            errors.remove(taskType)
            _taskErrors.value = errors
        }
    }

    fun updateDestinationUrl(url: String) {
        _destinationUrl.value = url
        _destinationError.value = null
    }

    fun clearForm() {
        _selectedTasks.value = emptySet()
        _taskUrls.value = emptyMap()
        _taskErrors.value = emptyMap()
        _destinationUrl.value = ""
        _destinationError.value = null
        _lastGeneratedCampaign.value = null
    }

    fun loadSampleData() {
        val sampleTasks = setOf(
            TaskType.SUBSCRIBE,
            TaskType.LIKE_SUBSCRIBE,
            TaskType.JOIN_TELEGRAM
        )
        val sampleUrls = mapOf(
            TaskType.SUBSCRIBE to "https://www.youtube.com/@faconmods",
            TaskType.LIKE_SUBSCRIBE to "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            TaskType.JOIN_TELEGRAM to "https://t.me/faconmods"
        )
        _selectedTasks.value = sampleTasks
        _taskUrls.value = sampleUrls
        _taskErrors.value = emptyMap()
        _destinationUrl.value = "https://mediafire.com/file/faconmods_v2_pack.zip"
        _destinationError.value = null
        _statusMessage.value = "Sample data preloaded. Click GENERATE to create!"
    }

    fun generateLink() {
        viewModelScope.launch {
            // 1. Validate destination URL
            val destValidation = UrlValidator.validateDestinationUrl(_destinationUrl.value)
            if (destValidation is UrlValidator.ValidationResult.Invalid) {
                _destinationError.value = destValidation.errorMessage
                _statusMessage.value = "Please fix the destination URL"
                return@launch
            }

            // 2. Validate tasks
            if (_selectedTasks.value.isEmpty()) {
                _statusMessage.value = "Please select at least one task above before generating!"
                return@launch
            }

            val errors = mutableMapOf<TaskType, String>()
            for (task in _selectedTasks.value) {
                val url = _taskUrls.value[task] ?: ""
                val validation = UrlValidator.validateTaskUrl(task, url)
                if (validation is UrlValidator.ValidationResult.Invalid) {
                    errors[task] = validation.errorMessage
                }
            }

            if (errors.isNotEmpty()) {
                _taskErrors.value = errors
                _statusMessage.value = "Please fill in all selected task URLs correctly"
                return@launch
            }

            // All validations passed!
            _isGenerating.value = true
            val campaignId = CampaignIdGenerator.generate()
            val normalizedDestination = UrlValidator.normalizeUrl(_destinationUrl.value)

            val campaignEntity = CampaignEntity(
                id = campaignId,
                title = "FACONMODS Locked Link #$campaignId",
                destinationUrl = normalizedDestination,
                createdAt = System.currentTimeMillis()
            )

            val taskEntities = _selectedTasks.value.mapIndexed { index, taskType ->
                val rawUrl = _taskUrls.value[taskType] ?: ""
                CampaignTaskEntity(
                    campaignId = campaignId,
                    taskType = taskType.name,
                    taskUrl = UrlValidator.normalizeUrl(rawUrl),
                    sortOrder = index,
                    isCompleted = false
                )
            }

            dao.insertCampaign(campaignEntity)
            dao.insertTasks(taskEntities)

            val saved = dao.getCampaignWithTasks(campaignId)
            _lastGeneratedCampaign.value = saved
            _isGenerating.value = false
            _statusMessage.value = "Campaign $campaignId created successfully!"
        }
    }

    fun openCampaignForVisitor(campaignId: String) {
        viewModelScope.launch {
            val campaignWithTasks = dao.getCampaignWithTasks(campaignId)
            if (campaignWithTasks != null) {
                dao.incrementClicks(campaignId)
                _currentVisitorCampaign.value = campaignWithTasks

                // Initialize verification statuses
                val initialMap = campaignWithTasks.tasks.associate {
                    it.id to if (it.isCompleted) VerificationStatus.VERIFIED else VerificationStatus.PENDING
                }
                _taskVerificationStatus.value = initialMap
                _currentScreen.value = AppScreen.VISITOR
            } else {
                _statusMessage.value = "Campaign not found"
            }
        }
    }

    fun startTaskVerification(taskId: Long) {
        viewModelScope.launch {
            val currentMap = _taskVerificationStatus.value.toMutableMap()
            currentMap[taskId] = VerificationStatus.IN_PROGRESS
            _taskVerificationStatus.value = currentMap

            // Silent 10-second background dwell check
            delay(10000)

            // Mark as verified in DB and local state
            dao.updateTaskCompletion(taskId, true)
            currentMap[taskId] = VerificationStatus.VERIFIED
            _taskVerificationStatus.value = currentMap

            // Reload visitor campaign state to check if all tasks completed
            val currentC = _currentVisitorCampaign.value
            if (currentC != null) {
                val updated = dao.getCampaignWithTasks(currentC.campaign.id)
                _currentVisitorCampaign.value = updated
            }
        }
    }

    fun resetTaskVerification(taskId: Long) {
        viewModelScope.launch {
            dao.updateTaskCompletion(taskId, false)
            val currentMap = _taskVerificationStatus.value.toMutableMap()
            currentMap[taskId] = VerificationStatus.PENDING
            _taskVerificationStatus.value = currentMap

            val currentC = _currentVisitorCampaign.value
            if (currentC != null) {
                val updated = dao.getCampaignWithTasks(currentC.campaign.id)
                _currentVisitorCampaign.value = updated
            }
        }
    }

    fun unlockDestination(campaignId: String, onUrlReady: (String) -> Unit) {
        viewModelScope.launch {
            val campaign = dao.getCampaignWithTasks(campaignId)
            if (campaign != null) {
                dao.incrementUnlocks(campaignId)
                onUrlReady(campaign.campaign.destinationUrl)
            }
        }
    }

    fun deleteCampaign(campaignId: String) {
        viewModelScope.launch {
            dao.deleteCampaign(campaignId)
            if (_lastGeneratedCampaign.value?.campaign?.id == campaignId) {
                _lastGeneratedCampaign.value = null
            }
            if (_currentVisitorCampaign.value?.campaign?.id == campaignId) {
                _currentVisitorCampaign.value = null
                _currentScreen.value = AppScreen.CAMPAIGNS
            }
            _statusMessage.value = "Campaign removed."
        }
    }

    fun toggleVerificationInfo(show: Boolean) {
        _showVerificationInfo.value = show
    }

    fun clearStatusMessage() {
        _statusMessage.value = null
    }
}
