package com.example.data

import androidx.room.Embedded
import androidx.room.Relation

data class CampaignWithTasks(
    @Embedded
    val campaign: CampaignEntity,
    @Relation(
        parentColumn = "id",
        entityColumn = "campaignId"
    )
    val tasks: List<CampaignTaskEntity>
) {
    val shareableUrl: String
        get() = "https://faconmods.link/c/${campaign.id}"
}
