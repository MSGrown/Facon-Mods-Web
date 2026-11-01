package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "campaigns")
data class CampaignEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val destinationUrl: String,
    val createdAt: Long = System.currentTimeMillis(),
    val clicks: Int = 0,
    val unlocks: Int = 0
)
