package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddLink
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.FolderShared
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Link
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.RestartAlt
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.AppScreen
import com.example.ui.theme.BrandPink
import com.example.ui.theme.ContainerWhite
import com.example.ui.theme.DarkNavyText
import com.example.ui.theme.DividerColor
import com.example.ui.theme.GenerateButtonPurple
import com.example.ui.theme.NavyMuted

@Composable
fun FaconHeader(
    currentScreen: AppScreen,
    onNavigate: (AppScreen) -> Unit,
    onLoadSample: () -> Unit,
    onClearForm: () -> Unit,
    modifier: Modifier = Modifier
) {
    var menuExpanded by remember { mutableStateOf(false) }

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .shadow(elevation = 3.dp, spotColor = Color(0x20000000)),
        color = ContainerWhite
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // Brand Logo & Title on Left
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(34.dp)
                        .background(GenerateButtonPurple, RoundedCornerShape(8.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Link,
                        contentDescription = "FACONMODS Logo Badge",
                        tint = ContainerWhite,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Spacer(modifier = Modifier.width(10.dp))

                Text(
                    text = buildAnnotatedString {
                        withStyle(
                            style = SpanStyle(
                                color = DarkNavyText,
                                fontWeight = FontWeight.Black,
                                fontSize = 21.sp,
                                letterSpacing = (-0.5).sp
                            )
                        ) {
                            append("FACON")
                        }
                        withStyle(
                            style = SpanStyle(
                                color = BrandPink,
                                fontWeight = FontWeight.Black,
                                fontSize = 21.sp,
                                letterSpacing = (-0.5).sp
                            )
                        ) {
                            append("MODS")
                        }
                    },
                    modifier = Modifier.testTag("brand_logo_title")
                )
            }

            // Simple Hamburger Menu on the Right on Mobile
            Box {
                IconButton(
                    onClick = { menuExpanded = true },
                    modifier = Modifier
                        .size(48.dp)
                        .testTag("header_hamburger_menu_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Menu,
                        contentDescription = "Open Navigation Menu",
                        tint = DarkNavyText,
                        modifier = Modifier.size(26.dp)
                    )
                }

                DropdownMenu(
                    expanded = menuExpanded,
                    onDismissRequest = { menuExpanded = false },
                    modifier = Modifier
                        .background(ContainerWhite)
                        .width(220.dp)
                ) {
                    DropdownMenuItem(
                        text = {
                            Text(
                                "Create Your Link",
                                color = if (currentScreen == AppScreen.CREATE) BrandPink else DarkNavyText,
                                fontWeight = if (currentScreen == AppScreen.CREATE) FontWeight.Bold else FontWeight.Medium
                            )
                        },
                        leadingIcon = {
                            Icon(
                                Icons.Default.AddLink,
                                contentDescription = null,
                                tint = if (currentScreen == AppScreen.CREATE) BrandPink else NavyMuted
                            )
                        },
                        onClick = {
                            menuExpanded = false
                            onNavigate(AppScreen.CREATE)
                        },
                        modifier = Modifier.testTag("menu_item_create")
                    )

                    DropdownMenuItem(
                        text = {
                            Text(
                                "Visitor Unlock Page",
                                color = if (currentScreen == AppScreen.VISITOR) BrandPink else DarkNavyText,
                                fontWeight = if (currentScreen == AppScreen.VISITOR) FontWeight.Bold else FontWeight.Medium
                            )
                        },
                        leadingIcon = {
                            Icon(
                                Icons.Default.LockOpen,
                                contentDescription = null,
                                tint = if (currentScreen == AppScreen.VISITOR) BrandPink else NavyMuted
                            )
                        },
                        onClick = {
                            menuExpanded = false
                            onNavigate(AppScreen.VISITOR)
                        },
                        modifier = Modifier.testTag("menu_item_visitor")
                    )

                    DropdownMenuItem(
                        text = {
                            Text(
                                "My Campaigns",
                                color = if (currentScreen == AppScreen.CAMPAIGNS) BrandPink else DarkNavyText,
                                fontWeight = if (currentScreen == AppScreen.CAMPAIGNS) FontWeight.Bold else FontWeight.Medium
                            )
                        },
                        leadingIcon = {
                            Icon(
                                Icons.Default.FolderShared,
                                contentDescription = null,
                                tint = if (currentScreen == AppScreen.CAMPAIGNS) BrandPink else NavyMuted
                            )
                        },
                        onClick = {
                            menuExpanded = false
                            onNavigate(AppScreen.CAMPAIGNS)
                        },
                        modifier = Modifier.testTag("menu_item_campaigns")
                    )

                    DropdownMenuItem(
                        text = {
                            Text(
                                "Verification Policy",
                                color = if (currentScreen == AppScreen.POLICY) BrandPink else DarkNavyText,
                                fontWeight = if (currentScreen == AppScreen.POLICY) FontWeight.Bold else FontWeight.Medium
                            )
                        },
                        leadingIcon = {
                            Icon(
                                Icons.Default.Info,
                                contentDescription = null,
                                tint = if (currentScreen == AppScreen.POLICY) BrandPink else NavyMuted
                            )
                        },
                        onClick = {
                            menuExpanded = false
                            onNavigate(AppScreen.POLICY)
                        },
                        modifier = Modifier.testTag("menu_item_policy")
                    )

                    HorizontalDivider(color = DividerColor, modifier = Modifier.padding(vertical = 4.dp))

                    DropdownMenuItem(
                        text = {
                            Text("Fill Sample Demo", color = DarkNavyText, fontSize = 14.sp)
                        },
                        leadingIcon = {
                            Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = GenerateButtonPurple)
                        },
                        onClick = {
                            menuExpanded = false
                            onLoadSample()
                        },
                        modifier = Modifier.testTag("menu_item_sample")
                    )

                    DropdownMenuItem(
                        text = {
                            Text("Clear Form", color = DarkNavyText, fontSize = 14.sp)
                        },
                        leadingIcon = {
                            Icon(Icons.Default.RestartAlt, contentDescription = null, tint = NavyMuted)
                        },
                        onClick = {
                            menuExpanded = false
                            onClearForm()
                        },
                        modifier = Modifier.testTag("menu_item_clear")
                    )
                }
            }
        }
    }
}
