package com.example.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import kotlinx.coroutines.flow.Flow

@Dao
interface CampaignDao {

    @Transaction
    @Query("SELECT * FROM campaigns ORDER BY createdAt DESC")
    fun getAllCampaignsWithTasks(): Flow<List<CampaignWithTasks>>

    @Transaction
    @Query("SELECT * FROM campaigns WHERE id = :id")
    suspend fun getCampaignWithTasks(id: String): CampaignWithTasks?

    @Transaction
    @Query("SELECT * FROM campaigns WHERE id = :id")
    fun observeCampaignWithTasks(id: String): Flow<CampaignWithTasks?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCampaign(campaign: CampaignEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTasks(tasks: List<CampaignTaskEntity>)

    @Query("UPDATE campaign_tasks SET isCompleted = :completed WHERE id = :taskId")
    suspend fun updateTaskCompletion(taskId: Long, completed: Boolean)

    @Query("UPDATE campaigns SET clicks = clicks + 1 WHERE id = :id")
    suspend fun incrementClicks(id: String)

    @Query("UPDATE campaigns SET unlocks = unlocks + 1 WHERE id = :id")
    suspend fun incrementUnlocks(id: String)

    @Query("DELETE FROM campaigns WHERE id = :id")
    suspend fun deleteCampaign(id: String)

    @Query("DELETE FROM campaigns")
    suspend fun deleteAll()
}
