package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Link
import androidx.compose.material.icons.filled.PlayCircle
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Tag
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.PlatformCategory
import com.example.data.TaskType
import com.example.ui.theme.BorderLightGray
import com.example.ui.theme.BrandPink
import com.example.ui.theme.ContainerWhite
import com.example.ui.theme.DarkNavyText
import com.example.ui.theme.ErrorRed
import com.example.ui.theme.ErrorRedLight
import com.example.ui.theme.InputBorderFocus
import com.example.ui.theme.NavyMuted
import com.example.ui.theme.SelectedRedPink

@Composable
fun TaskInputFields(
    selectedTasks: Set<TaskType>,
    taskUrls: Map<TaskType, String>,
    taskErrors: Map<TaskType, String>,
    onUpdateUrl: (TaskType, String) -> Unit,
    onRemoveTask: (TaskType) -> Unit,
    modifier: Modifier = Modifier
) {
    val focusManager = LocalFocusManager.current

    AnimatedVisibility(
        visible = selectedTasks.isNotEmpty(),
        enter = fadeIn() + expandVertically(),
        exit = fadeOut() + shrinkVertically(),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            selectedTasks.forEach { task ->
                val currentUrl = taskUrls[task] ?: ""
                val errorMessage = taskErrors[task]
                val hasError = errorMessage != null

                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("task_input_container_${task.name.lowercase()}"),
                    color = ContainerWhite,
                    shape = RoundedCornerShape(14.dp),
                    border = androidx.compose.foundation.BorderStroke(
                        width = 1.dp,
                        color = if (hasError) ErrorRed else BorderLightGray
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp)
                    ) {
                        // Title row with icon and remove button
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.weight(1f)
                            ) {
                                PlatformIconBadge(task.platform)

                                Spacer(modifier = Modifier.width(8.dp))

                                Column {
                                    Text(
                                        text = task.inputLabel,
                                        color = DarkNavyText,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp
                                    )
                                    Text(
                                        text = task.description,
                                        color = NavyMuted,
                                        fontSize = 12.sp
                                    )
                                }
                            }

                            // Deselect / Remove button
                            IconButton(
                                onClick = { onRemoveTask(task) },
                                modifier = Modifier
                                    .size(32.dp)
                                    .testTag("remove_task_${task.name.lowercase()}")
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "Remove ${task.buttonLabel}",
                                    tint = NavyMuted,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // URL Input field
                        OutlinedTextField(
                            value = currentUrl,
                            onValueChange = { onUpdateUrl(task, it) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("task_url_input_${task.name.lowercase()}"),
                            placeholder = {
                                Text(
                                    text = task.placeholderUrl,
                                    color = NavyMuted.copy(alpha = 0.6f),
                                    fontSize = 13.sp
                                )
                            },
                            singleLine = true,
                            isError = hasError,
                            shape = RoundedCornerShape(10.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = ContainerWhite,
                                unfocusedContainerColor = ContainerWhite,
                                focusedBorderColor = InputBorderFocus,
                                unfocusedBorderColor = BorderLightGray,
                                errorBorderColor = ErrorRed,
                                focusedTextColor = DarkNavyText,
                                unfocusedTextColor = DarkNavyText
                            ),
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.Link,
                                    contentDescription = null,
                                    tint = if (hasError) ErrorRed else NavyMuted,
                                    modifier = Modifier.size(18.dp)
                                )
                            },
                            trailingIcon = {
                                if (currentUrl.isNotEmpty()) {
                                    IconButton(
                                        onClick = { onUpdateUrl(task, "") },
                                        modifier = Modifier.size(24.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Close,
                                            contentDescription = "Clear text",
                                            tint = NavyMuted,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }
                            },
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Uri,
                                imeAction = ImeAction.Done
                            ),
                            keyboardActions = KeyboardActions(
                                onDone = { focusManager.clearFocus() }
                            )
                        )

                        if (hasError) {
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(start = 4.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ErrorOutline,
                                    contentDescription = null,
                                    tint = ErrorRed,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = errorMessage ?: "",
                                    color = ErrorRed,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PlatformIconBadge(platform: PlatformCategory) {
    val (bgColor, iconVector) = when (platform) {
        PlatformCategory.YOUTUBE -> SelectedRedPink to Icons.Default.PlayCircle
        PlatformCategory.INSTAGRAM -> BrandPink to Icons.Default.Tag
        PlatformCategory.FACEBOOK -> Color(0xFF1877F2) to Icons.Default.Share
        PlatformCategory.TWITTER -> Color(0xFF1DA1F2) to Icons.Default.Tag
        PlatformCategory.TELEGRAM -> Color(0xFF0088CC) to Icons.Default.Send
        PlatformCategory.DISCORD -> Color(0xFF5865F2) to Icons.Default.Tag
    }

    Box(
        modifier = Modifier
            .size(30.dp)
            .background(bgColor.copy(alpha = 0.12f), CircleShape),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = iconVector,
            contentDescription = platform.name,
            tint = bgColor,
            modifier = Modifier.size(18.dp)
        )
    }
}
