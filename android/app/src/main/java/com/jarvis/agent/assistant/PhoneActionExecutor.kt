package com.jarvis.agent.assistant

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings

/** Safe, explicit Android action surface for the Jarvis agent. */
class PhoneActionExecutor(private val context: Context) {
    data class Result(val success: Boolean, val message: String)

    private val appPackages = mapOf(
        "youtube" to "com.google.android.youtube",
        "whatsapp" to "com.whatsapp",
        "instagram" to "com.instagram.android",
        "spotify" to "com.spotify.music",
        "gmail" to "com.google.android.gm",
        "google maps" to "com.google.android.apps.maps",
        "微信" to "com.tencent.mm"
    )

    fun openApp(app: String): Result {
        val key = app.trim().lowercase()
        val packageName = appPackages[key]
            ?: return Result(false, "暂不支持直接启动 $app；可以先添加经过验证的应用映射。")
        val launch = context.packageManager.getLaunchIntentForPackage(packageName)
            ?: return Result(false, "设备上没有安装 $app。")
        launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        return runCatching { context.startActivity(launch); Result(true, "已打开 $app。") }
            .getOrElse { Result(false, "无法打开 $app：${it.localizedMessage ?: "未知错误"}") }
    }

    fun openWifiSettings(): Result = openSettings(Intent(Settings.ACTION_WIFI_SETTINGS), "Wi-Fi 设置")
    fun openAccessibilitySettings(): Result = openSettings(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS), "无障碍设置")

    fun searchWeb(query: String): Result {
        if (query.isBlank()) return Result(false, "搜索内容不能为空。")
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com/search?q=${Uri.encode(query)}"))
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        return runCatching { context.startActivity(intent); Result(true, "已打开搜索结果。") }
            .getOrElse { Result(false, "无法打开浏览器。") }
    }

    private fun openSettings(intent: Intent, label: String): Result =
        runCatching { intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK); context.startActivity(intent); Result(true, "已打开$label。") }
            .getOrElse { Result(false, "无法打开$label。") }
}
