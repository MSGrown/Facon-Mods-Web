package com.example

import com.example.data.TaskType
import com.example.util.CampaignIdGenerator
import com.example.util.UrlValidator
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ExampleUnitTest {

    @Test
    fun testCampaignIdGeneration() {
        val id1 = CampaignIdGenerator.generate()
        val id2 = CampaignIdGenerator.generate()

        assertTrue(id1.startsWith("FM-"))
        assertEquals(9, id1.length) // FM- + 6 characters
        assertTrue(id1 != id2)
    }

    @Test
    fun testDestinationUrlValidation() {
        // Valid URLs
        assertTrue(UrlValidator.validateDestinationUrl("https://example.com/file.zip") is UrlValidator.ValidationResult.Valid)
        assertTrue(UrlValidator.validateDestinationUrl("http://mediafire.com/download/file") is UrlValidator.ValidationResult.Valid)

        // Invalid empty
        val emptyResult = UrlValidator.validateDestinationUrl("   ")
        assertTrue(emptyResult is UrlValidator.ValidationResult.Invalid)

        // Invalid malicious scheme
        val jsResult = UrlValidator.validateDestinationUrl("javascript:alert(1)")
        assertTrue(jsResult is UrlValidator.ValidationResult.Invalid)

        val dataResult = UrlValidator.validateDestinationUrl("data:text/html,<html>")
        assertTrue(dataResult is UrlValidator.ValidationResult.Invalid)
    }

    @Test
    fun testTaskUrlValidation() {
        // YouTube channel task
        val validYt = UrlValidator.validateTaskUrl(TaskType.SUBSCRIBE, "https://www.youtube.com/@faconmods")
        assertTrue(validYt is UrlValidator.ValidationResult.Valid)

        val invalidYt = UrlValidator.validateTaskUrl(TaskType.SUBSCRIBE, "https://notyoutube.com/@faconmods")
        assertTrue(invalidYt is UrlValidator.ValidationResult.Invalid)

        // Telegram task
        val validTg = UrlValidator.validateTaskUrl(TaskType.JOIN_TELEGRAM, "https://t.me/faconmods")
        assertTrue(validTg is UrlValidator.ValidationResult.Valid)

        // Discord task
        val validDc = UrlValidator.validateTaskUrl(TaskType.JOIN_DISCORD, "https://discord.gg/abc1234")
        assertTrue(validDc is UrlValidator.ValidationResult.Valid)
    }

    @Test
    fun testTaskTypeCount() {
        assertEquals(11, TaskType.entries.size)
    }
}
