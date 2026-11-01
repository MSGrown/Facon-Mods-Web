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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PrivacyTip
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.BorderLightGray
import com.example.ui.theme.BrandPink
import com.example.ui.theme.ContainerWhite
import com.example.ui.theme.DarkNavyText
import com.example.ui.theme.GenerateButtonPurple
import com.example.ui.theme.NavyMuted
import com.example.ui.theme.PageBackground
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.TaskButtonBlue

@Composable
fun PolicyScreen(
    onBack: () -> Unit,
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
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .widthIn(max = 640.dp)
                    .shadow(2.dp, RoundedCornerShape(16.dp))
                    .testTag("policy_screen_container"),
                color = ContainerWhite,
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = onBack) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = DarkNavyText)
                        }
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Verification & Privacy",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black,
                            color = DarkNavyText
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    PolicyCard(
                        icon = Icons.Default.PrivacyTip,
                        iconTint = SuccessGreen,
                        title = "Zero Password Guarantee",
                        description = "FACONMODS never asks for, captures, or transmits social media credentials, passwords, or session tokens. We strictly protect user privacy and account security."
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    PolicyCard(
                        icon = Icons.Default.Security,
                        iconTint = TaskButtonBlue,
                        title = "Legitimate Verification & API Limits",
                        description = "Major platforms (YouTube, Instagram, Facebook, X, Telegram, Discord) prohibit third-party public tools from reading private user subscriptions without explicit OAuth user tokens. In accordance with platform developer terms, our verification system requires visiting the destination URL, dwell interaction check, and explicit user confirmation rather than automated credential interception."
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    PolicyCard(
                        icon = Icons.Default.Lock,
                        iconTint = BrandPink,
                        title = "Anti-Malware & Safe Redirects",
                        description = "All creator destination links and task URLs are strictly validated for standard https:// protocols. Unsafe protocols (javascript:, data:, file:) and malformed URIs are blocked to ensure visitor safety."
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    PolicyCard(
                        icon = Icons.Default.CheckCircle,
                        iconTint = GenerateButtonPurple,
                        title = "Persistent Offline & Cloud Readiness",
                        description = "Campaigns are stored securely in local SQLite (Room) with full schema support. Unique campaign IDs guarantee shareable references that survive app refreshes."
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    Button(
                        onClick = onBack,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        shape = RoundedCornerShape(24.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = TaskButtonBlue,
                            contentColor = ContainerWhite
                        )
                    ) {
                        Text("BACK TO GENERATOR", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

@Composable
fun PolicyCard(
    icon: ImageVector,
    iconTint: androidx.compose.ui.graphics.Color,
    title: String,
    description: String
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = PageBackground,
        shape = RoundedCornerShape(12.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, BorderLightGray)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.Top
        ) {
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .background(iconTint.copy(alpha = 0.12f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(18.dp))
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = DarkNavyText
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = description,
                    fontSize = 12.sp,
                    color = NavyMuted,
                    lineHeight = 17.sp
                )
            }
        }
    }
}
