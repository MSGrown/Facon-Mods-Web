package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val FaconModsColorScheme = lightColorScheme(
    primary = GenerateButtonPurple,
    onPrimary = ContainerWhite,
    secondary = BrandPink,
    onSecondary = ContainerWhite,
    tertiary = TaskButtonBlue,
    onTertiary = ContainerWhite,
    background = PageBackground,
    onBackground = DarkNavyText,
    surface = ContainerWhite,
    onSurface = DarkNavyText,
    surfaceVariant = PageBackground,
    onSurfaceVariant = NavyMuted,
    outline = BorderLightGray,
    error = ErrorRed,
    onError = ContainerWhite
)

@Composable
fun FaconModsTheme(
    content: @Composable () -> Unit
) {
    // Keep strictly light theme with exact Blogger / Sub4Unlock colors
    MaterialTheme(
        colorScheme = FaconModsColorScheme,
        typography = Typography,
        content = content
    )
}
