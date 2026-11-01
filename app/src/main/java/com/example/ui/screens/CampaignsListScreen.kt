package com.example.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.Link
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.Mouse
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.CampaignWithTasks
import com.example.ui.AppScreen
import com.example.ui.theme.BorderLightGray
import com.example.ui.theme.BrandPink
import com.example.ui.theme.ContainerWhite
import com.example.ui.theme.DarkNavyText
import com.example.ui.theme.ErrorRed
import com.example.ui.theme.GenerateButtonPurple
import com.example.ui.theme.NavyMuted
import com.example.ui.theme.PageBackground
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.TaskButtonBlue
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun CampaignsListScreen(
    campaigns: List<CampaignWithTasks>,
    onSelectCampaign: (String) -> Unit,
    onDeleteCampaign: (String) -> Unit,
    onNavigateToCreate: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val dateFormat = SimpleDateFormat("MMM dd, yyyy • HH:mm", Locale.getDefault())

    val totalClicks = campaigns.sumOf { it.campaign.clicks }
    val totalUnlocks = campaigns.sumOf { it.campaign.unlocks }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(PageBackground),
        contentAlignment = Alignment.TopCenter
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .widthIn(max = 640.dp)
                .padding(horizontal = 16.dp, vertical = 20.dp)
        ) {
            // Screen Header & Stats
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(2.dp, RoundedCornerShape(16.dp)),
                color = ContainerWhite,
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(
                                text = "My Campaigns",
                                fontSize = 22.sp,
                                fontWeight = FontWeight.Black,
                                color = DarkNavyText
                            )
                            Text(
                                text = "Saved in persistent local database",
                                fontSize = 12.sp,
                                color = NavyMuted
                            )
                        }

                        Button(
                            onClick = onNavigateToCreate,
                            shape = RoundedCornerShape(20.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = GenerateButtonPurple,
                                contentColor = ContainerWhite
                            ),
                            modifier = Modifier.testTag("new_campaign_button")
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("New Link", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Stats Cards Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        StatBadge(
                            title = "Active Links",
                            value = "${campaigns.size}",
                            color = TaskButtonBlue,
                            modifier = Modifier.weight(1f)
                        )
                        StatBadge(
                            title = "Total Clicks",
                            value = "$totalClicks",
                            color = BrandPink,
                            modifier = Modifier.weight(1f)
                        )
                        StatBadge(
                            title = "Completed",
                            value = "$totalUnlocks",
                            color = SuccessGreen,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (campaigns.isEmpty()) {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 20.dp),
                    color = ContainerWhite,
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "No Campaigns Created Yet",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = DarkNavyText
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Use the Create Your Link tool to build and lock your first link.",
                            fontSize = 13.sp,
                            color = NavyMuted,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(campaigns, key = { it.campaign.id }) { item ->
                        CampaignCard(
                            campaignWithTasks = item,
                            dateFormat = dateFormat,
                            onOpenVisitor = { onSelectCampaign(item.campaign.id) },
                            onCopyLink = {
                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                val clip = ClipData.newPlainText("FACONMODS Link", item.shareableUrl)
                                clipboard.setPrimaryClip(clip)
                                Toast.makeText(context, "Link copied!", Toast.LENGTH_SHORT).show()
                            },
                            onDelete = { onDeleteCampaign(item.campaign.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun StatBadge(
    title: String,
    value: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        color = color.copy(alpha = 0.08f),
        shape = RoundedCornerShape(10.dp)
    ) {
        Column(
            modifier = Modifier.padding(10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = value, fontSize = 18.sp, fontWeight = FontWeight.Black, color = color)
            Text(text = title, fontSize = 11.sp, color = NavyMuted)
        }
    }
}

@Composable
fun CampaignCard(
    campaignWithTasks: CampaignWithTasks,
    dateFormat: SimpleDateFormat,
    onOpenVisitor: () -> Unit,
    onCopyLink: () -> Unit,
    onDelete: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(1.dp, RoundedCornerShape(14.dp))
            .testTag("campaign_card_${campaignWithTasks.campaign.id}"),
        color = ContainerWhite,
        shape = RoundedCornerShape(14.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, BorderLightGray)
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
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(28.dp)
                            .background(TaskButtonBlue.copy(alpha = 0.1f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.Link,
                            contentDescription = null,
                            tint = TaskButtonBlue,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = campaignWithTasks.campaign.id,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 15.sp,
                        color = DarkNavyText
                    )
                }

                IconButton(
                    onClick = onDelete,
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        Icons.Default.DeleteOutline,
                        contentDescription = "Delete",
                        tint = ErrorRed,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Destination: ${campaignWithTasks.campaign.destinationUrl}",
                fontSize = 12.sp,
                color = NavyMuted,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "${campaignWithTasks.tasks.size} required tasks • Created ${dateFormat.format(Date(campaignWithTasks.campaign.createdAt))}",
                fontSize = 11.sp,
                color = NavyMuted
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = onCopyLink,
                    modifier = Modifier
                        .weight(1f)
                        .height(38.dp),
                    shape = RoundedCornerShape(19.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, TaskButtonBlue),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = TaskButtonBlue)
                ) {
                    Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Copy Link", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = onOpenVisitor,
                    modifier = Modifier
                        .weight(1f)
                        .height(38.dp),
                    shape = RoundedCornerShape(19.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = GenerateButtonPurple,
                        contentColor = ContainerWhite
                    )
                ) {
                    Icon(Icons.Default.OpenInNew, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Unlock Page", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
