package com.example.data

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "campaign_tasks",
    foreignKeys = [
        ForeignKey(
            entity = CampaignEntity::class,
            parentColumns = ["id"],
            childColumns = ["campaignId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["campaignId"])]
)
data class CampaignTaskEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val campaignId: String,
    val taskType: String,
    val taskUrl: String,
    val sortOrder: Int = 0,
    val isCompleted: Boolean = false
) {
    fun getResolvedTaskType(): TaskType? = TaskType.fromString(taskType)
}
