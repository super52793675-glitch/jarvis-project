package com.jarvis.agent

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.Locale
import java.util.concurrent.TimeUnit

private data class ChatLine(val fromJarvis: Boolean, val text: String)

class MainActivity : ComponentActivity(), TextToSpeech.OnInitListener {
    private var tts: TextToSpeech? = null
    private var ttsReady = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        tts = TextToSpeech(this, this)
        setContent {
            JarvisHome(
                onSpeak = ::speak,
                onOpenAccessibility = ::openAccessibilitySettings,
                savedEndpoint = getSharedPreferences("jarvis", MODE_PRIVATE).getString("endpoint", "") ?: "",
                onSaveEndpoint = { value -> getSharedPreferences("jarvis", MODE_PRIVATE).edit().putString("endpoint", value).apply() }
            )
        }
    }

    override fun onInit(status: Int) {
        ttsReady = status == TextToSpeech.SUCCESS
        if (ttsReady) tts?.language = Locale.getDefault()
    }

    private fun speak(text: String) {
        if (ttsReady) tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "jarvis-reply")
    }

    private fun openAccessibilitySettings() {
        startActivity(Intent(android.provider.Settings.ACTION_ACCESSIBILITY_SETTINGS))
    }

    override fun onDestroy() {
        tts?.shutdown()
        super.onDestroy()
    }
}

private val httpClient = OkHttpClient.Builder()
    .connectTimeout(15, TimeUnit.SECONDS)
    .readTimeout(30, TimeUnit.SECONDS)
    .callTimeout(35, TimeUnit.SECONDS)
    .build()

private suspend fun askJarvis(endpoint: String, token: String, text: String, history: List<ChatLine>): String = withContext(Dispatchers.IO) {
    val messages = JSONArray()
    history.takeLast(12).forEach { line ->
        messages.put(JSONObject().put("role", if (line.fromJarvis) "assistant" else "user").put("content", line.text))
    }
    val payload = JSONObject()
        .put("text", text)
        .put("language", Locale.getDefault().displayName)
        .put("history", messages)
    val base = endpoint.trim().trimEnd('/')
    val url = if (base.endsWith("/api/jarvis/chat")) base else "$base/api/jarvis/chat"
    val request = Request.Builder()
        .url(url)
        .header("X-Jarvis-Token", token.trim())
        .post(payload.toString().toRequestBody("application/json; charset=utf-8".toMediaType()))
        .build()
    httpClient.newCall(request).execute().use { response ->
        val body = response.body?.string().orEmpty()
        if (!response.isSuccessful) {
            val detail = runCatching { JSONObject(body).optString("error") }.getOrDefault("")
            throw IllegalStateException(if (response.code == 401) "访问令牌不正确，或服务器尚未配置 JARVIS_ACCESS_TOKEN。" else "AI 服务请求失败（${response.code}${if (detail.isNotBlank()) ": $detail" else ""}）。")
        }
        val reply = JSONObject(body).optString("reply")
        if (reply.isBlank()) throw IllegalStateException("AI 返回了空内容。")
        reply
    }
}

@Composable
private fun JarvisHome(
    onSpeak: (String) -> Unit,
    onOpenAccessibility: () -> Unit,
    savedEndpoint: String,
    onSaveEndpoint: (String) -> Unit
) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val scope = rememberCoroutineScope()
    var input by remember { mutableStateOf("") }
    var status by remember { mutableStateOf("在线 · 等待指令") }
    var endpoint by remember { mutableStateOf(savedEndpoint) }
    var accessToken by remember { mutableStateOf("") }
    var showConnectionSettings by remember { mutableStateOf(savedEndpoint.isBlank()) }
    var isSending by remember { mutableStateOf(false) }
    var voiceName by remember { mutableStateOf("系统默认声音") }
    val messages = remember { mutableStateListOf(ChatLine(true, "你好，我是 Jarvis。连接 AI 服务后，我就能与你进行真实对话。")) }
    val speechLauncher = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        val spoken = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull()
        if (!spoken.isNullOrBlank()) { input = spoken; status = "已识别语音" }
    }
    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) {
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_PROMPT, "请对 Jarvis 说话")
            }
            runCatching { speechLauncher.launch(intent) }.onFailure { status = "此设备暂不支持语音识别" }
        } else status = "需要麦克风权限才能语音输入"
    }

    MaterialTheme(colorScheme = darkColorScheme(
        primary = Color(0xFF69DFFF), background = Color(0xFF070B13), surface = Color(0xFF101827),
        onBackground = Color(0xFFEAF5FF), onSurface = Color(0xFFEAF5FF)
    )) {
        Column(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color(0xFF101E31), Color(0xFF070B13)))).padding(20.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                Column(Modifier.weight(1f)) {
                    Text("JARVIS", fontSize = 27.sp, fontWeight = FontWeight.Bold, color = Color(0xFF8DE7FF), letterSpacing = 4.sp)
                    Text("PERSONAL LIFE AGENT", fontSize = 10.sp, color = Color(0xFF8FA8C0), letterSpacing = 2.sp)
                }
                Surface(shape = RoundedCornerShape(20.dp), color = Color(0xFF123044)) {
                    Text(if (isSending) "● THINKING" else "● ACTIVE", Modifier.padding(horizontal = 12.dp, vertical = 7.dp), color = Color(0xFF72E6C0), fontSize = 11.sp)
                }
            }
            Spacer(Modifier.height(18.dp))
            Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                Box(Modifier.size(132.dp).background(Color(0x2237C8F2), CircleShape), contentAlignment = Alignment.Center) {
                    Box(Modifier.size(100.dp).background(Color(0x3337C8F2), CircleShape), contentAlignment = Alignment.Center) {
                        Text("J", color = Color(0xFF9CEBFF), fontSize = 54.sp, fontWeight = FontWeight.Light)
                    }
                }
            }
            Text(status, Modifier.fillMaxWidth().padding(top = 10.dp, bottom = 12.dp), color = Color(0xFF8FA8C0), fontSize = 12.sp)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                AssistChip(onClick = onOpenAccessibility, label = { Text("手机控制权限") })
                AssistChip(onClick = { showConnectionSettings = !showConnectionSettings }, label = { Text("AI 服务连接") })
                AssistChip(onClick = { voiceName = if (voiceName == "系统默认声音") "系统语音" else "系统默认声音" }, label = { Text("声音：$voiceName") })
            }
            if (showConnectionSettings) {
                Surface(color = Color(0xFF14263A), shape = RoundedCornerShape(14.dp), modifier = Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("连接你的 Jarvis 后端", color = Color(0xFF8DE7FF), fontWeight = FontWeight.Bold)
                        OutlinedTextField(value = endpoint, onValueChange = { endpoint = it }, modifier = Modifier.fillMaxWidth(), singleLine = true, label = { Text("服务器地址（HTTPS）") }, placeholder = { Text("https://your-domain.com") })
                        OutlinedTextField(value = accessToken, onValueChange = { accessToken = it }, modifier = Modifier.fillMaxWidth(), singleLine = true, label = { Text("访问令牌") }, placeholder = { Text("JARVIS_ACCESS_TOKEN") })
                        Text("令牌仅保留在本次运行内，不会写入手机存储。", color = Color(0xFF8FA8C0), fontSize = 10.sp)
                        Button(onClick = {
                            onSaveEndpoint(endpoint.trim())
                            showConnectionSettings = false
                            status = "服务器地址已保存；请输入令牌后即可对话"
                        }, enabled = endpoint.startsWith("https://")) { Text("保存服务器地址") }
                    }
                }
            }
            Spacer(Modifier.height(8.dp))
            LazyColumn(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(messages) { line ->
                    Surface(color = if (line.fromJarvis) Color(0xFF14263A) else Color(0xFF193D50), shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
                        Column(Modifier.padding(14.dp)) {
                            Text(if (line.fromJarvis) "JARVIS" else "YOU", color = Color(0xFF83DFF8), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            Spacer(Modifier.height(4.dp))
                            Text(line.text, color = Color(0xFFEAF5FF), fontSize = 14.sp)
                        }
                    }
                }
            }
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = input, onValueChange = { input = it }, modifier = Modifier.weight(1f), placeholder = { Text("和 Jarvis 说点什么…") }, shape = RoundedCornerShape(18.dp), singleLine = true, enabled = !isSending)
                IconButton(enabled = !isSending, onClick = {
                    if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply { putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM) }
                        runCatching { speechLauncher.launch(intent) }.onFailure { status = "语音识别暂不可用" }
                    } else permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                }) { Icon(Icons.Default.Mic, contentDescription = "语音输入", tint = Color(0xFF8DE7FF)) }
                IconButton(enabled = !isSending, onClick = {
                    val text = input.trim()
                    if (text.isNotEmpty()) {
                        if (!endpoint.startsWith("https://") || accessToken.isBlank()) {
                            status = "请先打开「AI 服务连接」并填写服务器地址与访问令牌"
                            showConnectionSettings = true
                        } else {
                            val prior = messages.toList()
                            messages.add(ChatLine(false, text))
                            input = ""
                            isSending = true
                            status = "正在连接 Grok…"
                            scope.launch {
                                try {
                                    val reply = askJarvis(endpoint, accessToken, text, prior)
                                    messages.add(ChatLine(true, reply))
                                    status = "AI 已连接 · 等待指令"
                                    onSpeak(reply)
                                } catch (error: Exception) {
                                    val message = error.message ?: "连接失败，请检查网络和服务器设置。"
                                    messages.add(ChatLine(true, "暂时无法连接 AI：$message"))
                                    status = "连接失败"
                                } finally {
                                    isSending = false
                                }
                            }
                        }
                    }
                }) { Icon(Icons.Default.Send, contentDescription = "发送", tint = Color(0xFF8DE7FF)) }
            }
            Text("AI 对话通过你的 HTTPS 后端进行；API 密钥保存在服务器端。手机操作仍需你主动授权。", Modifier.padding(top = 8.dp), color = Color(0xFF71879D), fontSize = 10.sp)
        }
    }
}
