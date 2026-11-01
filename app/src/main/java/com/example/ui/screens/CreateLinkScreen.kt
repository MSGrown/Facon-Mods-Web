package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.CampaignWithTasks
import com.example.data.TaskType
import com.example.ui.components.DestinationInputField
import com.example.ui.components.GenerateButton
import com.example.ui.components.ResultBox
import com.example.ui.components.TaskInputFields
import com.example.ui.components.TaskSelectionGrid
import com.example.ui.theme.ContainerWhite
import com.example.ui.theme.DarkNavyText
import com.example.ui.theme.NavyMuted
import com.example.ui.theme.PageBackground

@Composable
fun CreateLinkScreen(
    selectedTasks: Set<TaskType>,
    taskUrls: Map<TaskType, String>,
    taskErrors: Map<TaskType, String>,
    destinationUrl: String,
    destinationError: String?,
    isGenerating: Boolean,
    lastGeneratedCampaign: CampaignWithTasks?,
    onToggleTask: (TaskType) -> Unit,
    onUpdateTaskUrl: (TaskType, String) -> Unit,
    onUpdateDestinationUrl: (String) -> Unit,
    onGenerate: () -> Unit,
    onOpenVisitorPage: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(PageBackground),
        contentAlignment = Alignment.TopCenter
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(horizontal = 16.dp, vertical = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Centered White Container
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .widthIn(max = 640.dp)
                    .shadow(elevation = 2.dp, shape = RoundedCornerShape(16.dp))
                    .testTag("create_link_main_container"),
                color = ContainerWhite,
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp)
                ) {
                    // Heading: "Create Your Link"
                    Text(
                        text = "Create Your Link",
                        color = DarkNavyText,
                        fontSize = 26.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = (-0.5).sp,
                        modifier = Modifier.testTag("create_your_link_heading")
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "Select tasks visitors must complete before unlocking your destination URL.",
                        color = NavyMuted,
                        fontSize = 14.sp,
                        lineHeight = 20.sp
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    // Task selection buttons
                    TaskSelectionGrid(
                        selectedTasks = selectedTasks,
                        onToggleTask = onToggleTask
                    )

                    // Separate URL input fields for selected tasks
                    if (selectedTasks.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(24.dp))
                        TaskInputFields(
                            selectedTasks = selectedTasks,
                            taskUrls = taskUrls,
                            taskErrors = taskErrors,
                            onUpdateUrl = onUpdateTaskUrl,
                            onRemoveTask = onToggleTask
                        )
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Destination URL field
                    DestinationInputField(
                        destinationUrl = destinationUrl,
                        errorMessage = destinationError,
                        onUrlChange = onUpdateDestinationUrl
                    )

                    Spacer(modifier = Modifier.height(28.dp))

                    // Large purple GENERATE! button
                    GenerateButton(
                        isGenerating = isGenerating,
                        onGenerate = onGenerate
                    )

                    // Result Box if campaign generated
                    if (lastGeneratedCampaign != null) {
                        Spacer(modifier = Modifier.height(24.dp))
                        ResultBox(
                            campaignWithTasks = lastGeneratedCampaign,
                            onOpenVisitorPage = onOpenVisitorPage
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}
