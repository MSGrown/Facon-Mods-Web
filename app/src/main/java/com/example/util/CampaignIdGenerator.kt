package com.example.util

import java.security.SecureRandom

object CampaignIdGenerator {
    private const val ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
    private val random = SecureRandom()

    fun generate(length: Int = 6): String {
        val sb = StringBuilder(length)
        for (i in 0 until length) {
            val idx = random.nextInt(ALPHABET.length)
            sb.append(ALPHABET[idx])
        }
        return "FM-${sb}"
    }
}
