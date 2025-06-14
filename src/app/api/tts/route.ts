import { type NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "node-edge-tts";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { getCurrentSupabaseUser } from "~/lib/supabase-auth";

// 设置API路由配置
export const runtime = "nodejs"; // 使用Node.js运行时，因为edge-tts需要Node.js API

// 定义请求处理函数
export async function POST(request: NextRequest) {
  try {
    // 认证检查（可选，取决于是否需要认证）
    const user = await getCurrentSupabaseUser();
    if (!user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 解析请求体
    const {
      pitch = "default",
      rate = "default",
      text,
      voice = "zh-CN-XiaoyiNeural",
      volume = "default",
    }: any = await request.json();

    // 验证文本
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "文本不能为空" }, { status: 400 });
    }

    // 限制文本长度
    if (text.length > 5000) {
      return NextResponse.json({ error: "文本长度超出限制" }, { status: 400 });
    }

    // 创建EdgeTTS实例
    const tts = new EdgeTTS({
      outputFormat: "audio-24khz-48kbitrate-mono-mp3",
      pitch,
      rate,
      voice,
      volume,
    });

    // 生成语音 - 使用临时文件路径生成音频
    const tempFilePath = path.join(os.tmpdir(), `speech-${Date.now()}.mp3`);
    await tts.ttsPromise(text, tempFilePath);

    // 读取生成的音频文件
    const audioBuffer = await fs.promises.readFile(tempFilePath);

    // 删除临时文件
    fs.promises.unlink(tempFilePath).catch(console.error);

    // 返回音频数据
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="speech.mp3"`,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("TTS错误:", error);
    return NextResponse.json({ error: "生成语音失败" }, { status: 500 });
  }
}
