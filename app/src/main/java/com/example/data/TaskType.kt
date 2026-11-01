package com.example.data

enum class PlatformCategory {
    YOUTUBE,
    INSTAGRAM,
    FACEBOOK,
    TWITTER,
    TELEGRAM,
    DISCORD
}

enum class TaskType(
    val buttonLabel: String,
    val actionTitle: String,
    val description: String,
    val inputLabel: String,
    val placeholderUrl: String,
    val platform: PlatformCategory,
    val expectedDomains: List<String>
) {
    SUBSCRIBE(
        buttonLabel = "+ Subscribe",
        actionTitle = "Subscribe to Channel",
        description = "Subscribe to our YouTube channel to support new content.",
        inputLabel = "YouTube Channel URL to Subscribe",
        placeholderUrl = "https://www.youtube.com/@faconmods",
        platform = PlatformCategory.YOUTUBE,
        expectedDomains = listOf("youtube.com", "youtu.be")
    ),
    SECOND_SUBSCRIBE(
        buttonLabel = "+ 2nd subscribe",
        actionTitle = "Subscribe to 2nd Channel",
        description = "Subscribe to our secondary backup YouTube channel.",
        inputLabel = "2nd YouTube Channel URL",
        placeholderUrl = "https://www.youtube.com/@faconmods2",
        platform = PlatformCategory.YOUTUBE,
        expectedDomains = listOf("youtube.com", "youtu.be")
    ),
    LIKE_SUBSCRIBE(
        buttonLabel = "+ Like & subscribe",
        actionTitle = "Like Video & Subscribe",
        description = "Hit Like on the video and subscribe to the channel.",
        inputLabel = "YouTube Video URL (Like & Subscribe)",
        placeholderUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        platform = PlatformCategory.YOUTUBE,
        expectedDomains = listOf("youtube.com", "youtu.be")
    ),
    SUB_BELL(
        buttonLabel = "+ Sub & hit bell",
        actionTitle = "Subscribe & Turn on Bell",
        description = "Subscribe and ring the notification bell for all updates.",
        inputLabel = "YouTube Channel URL (Sub & Bell)",
        placeholderUrl = "https://www.youtube.com/@faconmods",
        platform = PlatformCategory.YOUTUBE,
        expectedDomains = listOf("youtube.com", "youtu.be")
    ),
    LIKE_COMMENT(
        buttonLabel = "+ Like & com",
        actionTitle = "Like & Comment on Video",
        description = "Drop a like and leave a comment on this video.",
        inputLabel = "YouTube Video URL (Like & Comment)",
        placeholderUrl = "https://www.youtube.com/watch?v=example",
        platform = PlatformCategory.YOUTUBE,
        expectedDomains = listOf("youtube.com", "youtu.be")
    ),
    LIKE_VIDEO(
        buttonLabel = "+ Like video",
        actionTitle = "Like YouTube Video",
        description = "Give a thumbs up to this YouTube video.",
        inputLabel = "YouTube Video URL to Like",
        placeholderUrl = "https://www.youtube.com/watch?v=example",
        platform = PlatformCategory.YOUTUBE,
        expectedDomains = listOf("youtube.com", "youtu.be")
    ),
    FOLLOW_INSTAGRAM(
        buttonLabel = "+ Follow instagram",
        actionTitle = "Follow on Instagram",
        description = "Follow our official Instagram account for teasers and updates.",
        inputLabel = "Instagram Profile URL to Follow",
        placeholderUrl = "https://www.instagram.com/faconmods",
        platform = PlatformCategory.INSTAGRAM,
        expectedDomains = listOf("instagram.com", "instagr.am")
    ),
    FOLLOW_FACEBOOK(
        buttonLabel = "+ Follow facebook",
        actionTitle = "Follow on Facebook",
        description = "Follow our Facebook page to join our community.",
        inputLabel = "Facebook Page/Profile URL to Follow",
        placeholderUrl = "https://www.facebook.com/faconmods",
        platform = PlatformCategory.FACEBOOK,
        expectedDomains = listOf("facebook.com", "fb.me", "fb.com")
    ),
    FOLLOW_TWITTER(
        buttonLabel = "+ Follow twitter",
        actionTitle = "Follow on Twitter/X",
        description = "Follow our X (Twitter) profile for news and announcements.",
        inputLabel = "Twitter/X Profile URL to Follow",
        placeholderUrl = "https://x.com/faconmods",
        platform = PlatformCategory.TWITTER,
        expectedDomains = listOf("twitter.com", "x.com")
    ),
    JOIN_TELEGRAM(
        buttonLabel = "+ Join telegram",
        actionTitle = "Join Telegram Channel",
        description = "Join our Telegram community for instant download alerts.",
        inputLabel = "Telegram Channel/Group Invite URL",
        placeholderUrl = "https://t.me/faconmods",
        platform = PlatformCategory.TELEGRAM,
        expectedDomains = listOf("t.me", "telegram.me")
    ),
    JOIN_DISCORD(
        buttonLabel = "+ Join discord",
        actionTitle = "Join Discord Server",
        description = "Join our Discord server to chat with creators and members.",
        inputLabel = "Discord Server Invite URL",
        placeholderUrl = "https://discord.gg/example",
        platform = PlatformCategory.DISCORD,
        expectedDomains = listOf("discord.gg", "discord.com")
    );

    companion object {
        fun fromString(value: String): TaskType? {
            return entries.find { it.name == value }
        }
    }
}
