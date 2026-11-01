package com.example.ui.screens

import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material.icons.filled.HourglassTop
import androidx.compose.material.icons.filled.Launch
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.OpenInBrowser
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.CampaignWithTasks
import com.example.ui.VerificationStatus
import com.example.ui.components.PlatformIconBadge
import com.example.ui.theme.BorderLightGray
import com.example.ui.theme.BrandPink
import com.example.ui.theme.CardBorder
import com.example.ui.theme.ContainerWhite
import com.example.ui.theme.DarkNavyText
import com.example.ui.theme.GenerateButtonPurple
import com.example.ui.theme.LockedGray
import com.example.ui.theme.NavyMuted
import com.example.ui.theme.PageBackground
import com.example.ui.theme.SelectedRedPink
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.SuccessGreenLight
import com.example.ui.theme.TaskButtonBlue

@Composable
fun VisitorUnlockScreen(
    campaignWithTasks: CampaignWithTasks?,
    allCampaigns: List<CampaignWithTasks>,
    taskStatuses: Map<Long, VerificationStatus>,
    onSelectCampaign: (String) -> Unit,
    onVerifyTask: (Long) -> Unit,
    onResetTask: (Long) -> Unit,
    onUnlockDestination: (String, (String) -> Unit) -> Unit,
    onOpenPolicy: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
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
            if (campaignWithTasks == null) {
                // Empty state: Select or create a campaign to test
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .widthIn(max = 640.dp)
                        .shadow(2.dp, RoundedCornerShape(16.dp)),
                    color = ContainerWhite,
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .background(PageBackground, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.Lock,
                                contentDescription = null,
                                tint = TaskButtonBlue,
                                modifier = Modifier.size(32.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            text = "No Campaign Selected",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = DarkNavyText
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = if (allCampaigns.isEmpty())
                                "Create a campaign on the 'Create Your Link' tab first to test the locked visitor page."
                            else
                                "Choose one of your saved campaigns below to test the visitor experience:",
                            color = NavyMuted,
                            fontSize = 14.sp,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )

                        if (allCampaigns.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(20.dp))
                            Column(
                                modifier = Modifier.fillMaxWidth(),
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                allCampaigns.forEach { item ->
                                    Surface(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(12.dp))
                                            .border(1.dp, BorderLightGray, RoundedCornerShape(12.dp)),
                                        color = PageBackground,
                                        onClick = { onSelectCampaign(item.campaign.id) }
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(14.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Column(modifier = Modifier.weight(1f)) {
                                                Text(
                                                    text = "Campaign: ${item.campaign.id}",
                                                    fontWeight = FontWeight.Bold,
                                                    color = DarkNavyText,
                                                    fontSize = 14.sp
                                                )
                                                Text(
                                                    text = "${item.tasks.size} tasks • Dest: ${item.campaign.destinationUrl}",
                                                    color = NavyMuted,
                                                    fontSize = 12.sp,
                                                    maxLines = 1,
                                                    overflow = TextOverflow.Ellipsis
                                                )
                                            }
                                            Icon(
                                                Icons.Default.Launch,
                                                contentDescription = "Open",
                                                tint = TaskButtonBlue,
                                                modifier = Modifier.size(18.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                // Campaign is loaded! Render the public locked-link page
                val tasks = campaignWithTasks.tasks
                val completedCount = tasks.count {
                    taskStatuses[it.id] == VerificationStatus.VERIFIED || it.isCompleted
                }
                val totalTasks = tasks.size
                val isAllCompleted = totalTasks > 0 && completedCount == totalTasks
                val progress = if (totalTasks > 0) completedCount.toFloat() / totalTasks.toFloat() else 0f

                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .widthIn(max = 640.dp)
                        .shadow(3.dp, RoundedCornerShape(16.dp))
                        .testTag("visitor_locked_page_container"),
                    color = ContainerWhite,
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp)
                    ) {
                        // Header with status
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = "Unlock Your Link",
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.Black,
                                    color = DarkNavyText
                                )
                                Text(
                                    text = "Campaign ID: ${campaignWithTasks.campaign.id}",
                                    fontSize = 12.sp,
                                    color = NavyMuted
                                )
                            }

                            // Verification Policy Information Button
                            IconButton(
                                onClick = onOpenPolicy,
                                modifier = Modifier.testTag("open_policy_info_button")
                            ) {
                                Icon(
                                    Icons.Default.Security,
                                    contentDescription = "Verification Policy & Privacy",
                                    tint = TaskButtonBlue
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = "Complete the required steps below to unlock the destination file/link.",
                            fontSize = 13.sp,
                            color = NavyMuted,
                            lineHeight = 18.sp
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Progress Section
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Tasks: $completedCount / $totalTasks completed",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isAllCompleted) SuccessGreen else DarkNavyText
                            )
                            Text(
                                text = "${(progress * 100).toInt()}%",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isAllCompleted) SuccessGreen else TaskButtonBlue
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        LinearProgressIndicator(
                            progress = { progress },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(8.dp)
                                .clip(RoundedCornerShape(4.dp)),
                            color = if (isAllCompleted) SuccessGreen else TaskButtonBlue,
                            trackColor = PageBackground
                        )

                        Spacer(modifier = Modifier.height(24.dp))

                        // Task List
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            verticalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            tasks.forEachIndexed { index, task ->
                                val taskType = task.getResolvedTaskType()
                                val status = taskStatuses[task.id] ?: if (task.isCompleted) VerificationStatus.VERIFIED else VerificationStatus.PENDING
                                val isDone = status == VerificationStatus.VERIFIED
                                val isVerifying = status == VerificationStatus.IN_PROGRESS

                                Surface(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .testTag("visitor_task_item_${task.id}"),
                                    color = if (isDone) SuccessGreenLight.copy(alpha = 0.5f) else PageBackground,
                                    shape = RoundedCornerShape(14.dp),
                                    border = androidx.compose.foundation.BorderStroke(
                                        width = 1.dp,
                                        color = if (isDone) SuccessGreen.copy(alpha = 0.4f) else BorderLightGray
                                    )
                                ) {
                                    Column(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(16.dp)
                                    ) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Row(
                                                verticalAlignment = Alignment.CenterVertically,
                                                modifier = Modifier.weight(1f)
                                            ) {
                                                if (taskType != null) {
                                                    PlatformIconBadge(taskType.platform)
                                                }

                                                Spacer(modifier = Modifier.width(10.dp))

                                                Column {
                                                    Text(
                                                        text = "Step ${index + 1}: ${taskType?.actionTitle ?: task.taskType}",
                                                        fontWeight = FontWeight.Bold,
                                                        fontSize = 14.sp,
                                                        color = DarkNavyText
                                                    )
                                                    Text(
                                                        text = taskType?.description ?: "Complete this requirement",
                                                        fontSize = 12.sp,
                                                        color = NavyMuted
                                                    )
                                                }
                                            }

                                            // Status Badge
                                            if (isDone) {
                                                Box(
                                                    modifier = Modifier
                                                        .size(28.dp)
                                                        .background(SuccessGreen, CircleShape),
                                                    contentAlignment = Alignment.Center
                                                ) {
                                                    Icon(
                                                        Icons.Default.Check,
                                                        contentDescription = "Verified",
                                                        tint = ContainerWhite,
                                                        modifier = Modifier.size(18.dp)
                                                    )
                                                }
                                            }
                                        }

                                        Spacer(modifier = Modifier.height(14.dp))

                                        // Action button: Clear platform action label or clean completed state
                                        val actionLabel = when (taskType) {
                                            com.example.data.TaskType.SUBSCRIBE -> "Subscribe to Channel"
                                            com.example.data.TaskType.SECOND_SUBSCRIBE -> "Subscribe to 2nd Channel"
                                            com.example.data.TaskType.LIKE_SUBSCRIBE -> "Like & Subscribe"
                                            com.example.data.TaskType.SUB_BELL -> "Subscribe & Turn on Bell"
                                            com.example.data.TaskType.LIKE_COMMENT -> "Like & Comment"
                                            com.example.data.TaskType.LIKE_VIDEO -> "Like Video"
                                            com.example.data.TaskType.FOLLOW_INSTAGRAM -> "Follow Instagram"
                                            com.example.data.TaskType.FOLLOW_FACEBOOK -> "Follow Facebook"
                                            com.example.data.TaskType.FOLLOW_TWITTER -> "Follow on X"
                                            com.example.data.TaskType.JOIN_TELEGRAM -> "Join Telegram"
                                            com.example.data.TaskType.JOIN_DISCORD -> "Join Discord"
                                            null -> "Complete Task"
                                        }

                                        Button(
                                            onClick = {
                                                if (!isDone) {
                                                    try {
                                                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(task.taskUrl))
                                                        context.startActivity(intent)
                                                    } catch (_: Exception) {
                                                        Toast.makeText(context, "Could not open URL: ${task.taskUrl}", Toast.LENGTH_SHORT).show()
                                                    }
                                                    onVerifyTask(task.id)
                                                }
                                            },
                                            enabled = !isDone,
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .height(46.dp)
                                                .testTag("action_task_button_${task.id}"),
                                            shape = RoundedCornerShape(23.dp),
                                            colors = ButtonDefaults.buttonColors(
                                                containerColor = if (isDone) SuccessGreen else TaskButtonBlue,
                                                disabledContainerColor = if (isDone) SuccessGreen else TaskButtonBlue.copy(alpha = 0.5f),
                                                contentColor = ContainerWhite,
                                                disabledContentColor = ContainerWhite
                                            )
                                        ) {
                                            if (isDone) {
                                                Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp))
                                                Spacer(modifier = Modifier.width(6.dp))
                                                Text("COMPLETED", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                            } else {
                                                Icon(
                                                    Icons.Default.OpenInBrowser,
                                                    contentDescription = null,
                                                    modifier = Modifier.size(16.dp)
                                                )
                                                Spacer(modifier = Modifier.width(8.dp))
                                                Text(actionLabel, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(28.dp))

                        // Destination Card (Locked / Unlocked)
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("destination_lock_card"),
                            color = if (isAllCompleted) SuccessGreenLight else PageBackground,
                            shape = RoundedCornerShape(16.dp),
                            border = androidx.compose.foundation.BorderStroke(
                                width = 1.5.dp,
                                color = if (isAllCompleted) SuccessGreen else LockedGray.copy(alpha = 0.5f)
                            )
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(20.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(54.dp)
                                        .background(
                                            if (isAllCompleted) SuccessGreen else LockedGray.copy(alpha = 0.2f),
                                            CircleShape
                                        ),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = if (isAllCompleted) Icons.Default.LockOpen else Icons.Default.Lock,
                                        contentDescription = if (isAllCompleted) "Unlocked" else "Locked",
                                        tint = if (isAllCompleted) ContainerWhite else LockedGray,
                                        modifier = Modifier.size(28.dp)
                                    )
                                }

                                Spacer(modifier = Modifier.height(12.dp))

                                Text(
                                    text = if (isAllCompleted) "DESTINATION UNLOCKED!" else "DESTINATION IS LOCKED",
                                    fontWeight = FontWeight.Black,
                                    fontSize = 17.sp,
                                    color = if (isAllCompleted) SuccessGreen else DarkNavyText
                                )

                                Spacer(modifier = Modifier.height(6.dp))

                                Text(
                                    text = if (isAllCompleted)
                                        "All steps completed and verified! Click the button below to proceed to your file."
                                    else
                                        "Destination URL is locked. Visit and verify each required task above to unlock.",
                                    fontSize = 13.sp,
                                    color = NavyMuted,
                                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                    lineHeight = 18.sp
                                )

                                Spacer(modifier = Modifier.height(18.dp))

                                // Final Unlock / Proceed Button
                                Button(
                                    onClick = {
                                        if (isAllCompleted) {
                                            onUnlockDestination(campaignWithTasks.campaign.id) { finalUrl ->
                                                try {
                                                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(finalUrl))
                                                    context.startActivity(intent)
                                                } catch (_: Exception) {
                                                    Toast.makeText(context, "Redirecting to: $finalUrl", Toast.LENGTH_LONG).show()
                                                }
                                            }
                                        }
                                    },
                                    enabled = isAllCompleted,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(52.dp)
                                        .testTag("unlock_and_proceed_button"),
                                    shape = RoundedCornerShape(26.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (isAllCompleted) SuccessGreen else LockedGray,
                                        contentColor = ContainerWhite,
                                        disabledContainerColor = LockedGray.copy(alpha = 0.3f),
                                        disabledContentColor = LockedGray
                                    )
                                ) {
                                    Icon(
                                        imageVector = if (isAllCompleted) Icons.Default.LockOpen else Icons.Default.Lock,
                                        contentDescription = null,
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = if (isAllCompleted) "UNLOCK & PROCEED" else "LOCKED (${totalTasks - completedCount} REMAINING)",
                                        fontWeight = FontWeight.Black,
                                        fontSize = 14.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}
