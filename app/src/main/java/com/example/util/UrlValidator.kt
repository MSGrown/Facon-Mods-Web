package com.example.util

import com.example.data.TaskType
import java.net.URI

object UrlValidator {

    sealed class ValidationResult {
        object Valid : ValidationResult()
        data class Invalid(val errorMessage: String) : ValidationResult()
    }

    fun validateDestinationUrl(url: String): ValidationResult {
        val trimmed = url.trim()
        if (trimmed.isEmpty()) {
            return ValidationResult.Invalid("Destination URL cannot be empty. Enter a file or target URL.")
        }

        if (trimmed.startsWith("javascript:", ignoreCase = true) ||
            trimmed.startsWith("data:", ignoreCase = true) ||
            trimmed.startsWith("file:", ignoreCase = true)
        ) {
            return ValidationResult.Invalid("Malicious or unsupported protocol detected.")
        }

        val formattedUrl = if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            "https://$trimmed"
        } else {
            trimmed
        }

        return try {
            val uri = URI(formattedUrl)
            val host = uri.host
            if (host.isNullOrBlank() || !host.contains(".")) {
                ValidationResult.Invalid("Please enter a valid web URL with a domain (e.g., https://example.com/file.zip)")
            } else {
                ValidationResult.Valid
            }
        } catch (_: Exception) {
            ValidationResult.Invalid("Invalid URL syntax. Please check the address format.")
        }
    }

    fun validateTaskUrl(taskType: TaskType, url: String): ValidationResult {
        val trimmed = url.trim()
        if (trimmed.isEmpty()) {
            return ValidationResult.Invalid("${taskType.buttonLabel.removePrefix("+ ")}: URL is required")
        }

        val formattedUrl = if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            "https://$trimmed"
        } else {
            trimmed
        }

        return try {
            val uri = URI(formattedUrl)
            val host = uri.host?.lowercase() ?: ""
            if (host.isEmpty() || !host.contains(".")) {
                return ValidationResult.Invalid("Please enter a valid URL (e.g. ${taskType.placeholderUrl})")
            }

            val matchedDomain = taskType.expectedDomains.any { domain ->
                host == domain || host.endsWith(".$domain")
            }

            if (!matchedDomain) {
                val expected = taskType.expectedDomains.joinToString(" or ")
                ValidationResult.Invalid("Must be a $expected link (e.g., ${taskType.placeholderUrl})")
            } else {
                ValidationResult.Valid
            }
        } catch (_: Exception) {
            ValidationResult.Invalid("Invalid URL syntax for ${taskType.buttonLabel}")
        }
    }

    fun normalizeUrl(url: String): String {
        val trimmed = url.trim()
        return if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            "https://$trimmed"
        } else {
            trimmed
        }
    }
}
