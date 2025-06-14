'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '~/ui/primitives/button';
import { Label } from '~/ui/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/ui/primitives/select';
import { Slider } from '~/ui/primitives/slider';
import { Textarea } from '~/ui/primitives/textarea';

// 定义可用的语音列表
const VOICES = [
  // 中文语音
  { label: '小怡 (女声)', value: 'zh-CN-XiaoyiNeural' },
  { label: '云希 (男声)', value: 'zh-CN-YunxiNeural' },
  { label: '云健 (男声)', value: 'zh-CN-YunjianNeural' },
  { label: '小璇 (女声)', value: 'zh-CN-XiaoxuanNeural' },
  { label: '云扬 (男声)', value: 'zh-CN-YunyangNeural' },
  { label: '小晓 (女声)', value: 'zh-CN-XiaoxiaoNeural' },
  { label: '云夏 (男声)', value: 'zh-CN-YunxiaNeural' },
  { label: '辽宁-小北 (女声)', value: 'zh-CN-liaoning-XiaobeiNeural' },
  { label: '陕西-小妮 (女声)', value: 'zh-CN-shaanxi-XiaoniNeural' },

  // 香港语音
  { label: '晓婷 (女声)', value: 'zh-HK-HiuGaaiNeural' },
  { label: '晓曼 (女声)', value: 'zh-HK-HiuMaanNeural' },
  { label: '云龙 (男声)', value: 'zh-HK-WanLungNeural' },

  // 台湾语音
  { label: '晓陈 (女声)', value: 'zh-TW-HsiaoChenNeural' },
  { label: '晓玉 (女声)', value: 'zh-TW-HsiaoYuNeural' },
  { label: '云哲 (男声)', value: 'zh-TW-YunJheNeural' },

  // 日语语音
  { label: '七海 (女声)', value: 'ja-JP-NanamiNeural' },
  { label: '圭太 (男声)', value: 'ja-JP-KeitaNeural' },

  // 韩语语音
  { label: '善熙 (女声)', value: 'ko-KR-SunHiNeural' },
  { label: '仁俊 (男声)', value: 'ko-KR-InJoonNeural' },
  { label: '炫秀 (男声-多语言)', value: 'ko-KR-HyunsuMultilingualNeural' },

  // 英语语音 - 美国
  { label: 'Aria (女声)', value: 'en-US-AriaNeural' },
  { label: 'Guy (男声)', value: 'en-US-GuyNeural' },
  { label: 'Jenny (女声)', value: 'en-US-JennyNeural' },
  { label: 'Ana (女声)', value: 'en-US-AnaNeural' },
  { label: 'Andrew (男声)', value: 'en-US-AndrewNeural' },
  { label: 'Ava (女声)', value: 'en-US-AvaNeural' },
  { label: 'Brian (男声)', value: 'en-US-BrianNeural' },
  { label: 'Christopher (男声)', value: 'en-US-ChristopherNeural' },
  { label: 'Emma (女声)', value: 'en-US-EmmaNeural' },
  { label: 'Eric (男声)', value: 'en-US-EricNeural' },
  { label: 'Michelle (女声)', value: 'en-US-MichelleNeural' },
  { label: 'Roger (男声)', value: 'en-US-RogerNeural' },
  { label: 'Steffan (男声)', value: 'en-US-SteffanNeural' },
  { label: 'Andrew (男声-多语言)', value: 'en-US-AndrewMultilingualNeural' },
  { label: 'Ava (女声-多语言)', value: 'en-US-AvaMultilingualNeural' },
  { label: 'Brian (男声-多语言)', value: 'en-US-BrianMultilingualNeural' },
  { label: 'Emma (女声-多语言)', value: 'en-US-EmmaMultilingualNeural' },

  // 英语语音 - 英国
  { label: 'Libby (女声-英国)', value: 'en-GB-LibbyNeural' },
  { label: 'Maisie (女声-英国)', value: 'en-GB-MaisieNeural' },
  { label: 'Ryan (男声-英国)', value: 'en-GB-RyanNeural' },
  { label: 'Sonia (女声-英国)', value: 'en-GB-SoniaNeural' },
  { label: 'Thomas (男声-英国)', value: 'en-GB-ThomasNeural' },

  // 英语语音 - 澳大利亚
  { label: 'Natasha (女声-澳大利亚)', value: 'en-AU-NatashaNeural' },
  { label: 'William (男声-澳大利亚)', value: 'en-AU-WilliamNeural' },

  // 英语语音 - 加拿大
  { label: 'Clara (女声-加拿大)', value: 'en-CA-ClaraNeural' },
  { label: 'Liam (男声-加拿大)', value: 'en-CA-LiamNeural' },

  // 法语语音
  { label: 'Denise (女声-法国)', value: 'fr-FR-DeniseNeural' },
  { label: 'Eloise (女声-法国)', value: 'fr-FR-EloiseNeural' },
  { label: 'Henri (男声-法国)', value: 'fr-FR-HenriNeural' },
  { label: 'Remy (男声-法国-多语言)', value: 'fr-FR-RemyMultilingualNeural' },
  { label: 'Vivienne (女声-法国-多语言)', value: 'fr-FR-VivienneMultilingualNeural' },

  // 德语语音
  { label: 'Amala (女声-德国)', value: 'de-DE-AmalaNeural' },
  { label: 'Conrad (男声-德国)', value: 'de-DE-ConradNeural' },
  { label: 'Katja (女声-德国)', value: 'de-DE-KatjaNeural' },
  { label: 'Killian (男声-德国)', value: 'de-DE-KillianNeural' },
  { label: 'Florian (男声-德国-多语言)', value: 'de-DE-FlorianMultilingualNeural' },
  { label: 'Seraphina (女声-德国-多语言)', value: 'de-DE-SeraphinaMultilingualNeural' },

  // 西班牙语语音
  { label: 'Alvaro (男声-西班牙)', value: 'es-ES-AlvaroNeural' },
  { label: 'Elvira (女声-西班牙)', value: 'es-ES-ElviraNeural' },
  { label: 'Ximena (女声-西班牙)', value: 'es-ES-XimenaNeural' },

  // 意大利语语音
  { label: 'Diego (男声-意大利)', value: 'it-IT-DiegoNeural' },
  { label: 'Elsa (女声-意大利)', value: 'it-IT-ElsaNeural' },
  { label: 'Isabella (女声-意大利)', value: 'it-IT-IsabellaNeural' },
  { label: 'Giuseppe (男声-意大利-多语言)', value: 'it-IT-GiuseppeMultilingualNeural' },

  // 俄语语音
  { label: 'Dmitry (男声-俄罗斯)', value: 'ru-RU-DmitryNeural' },
  { label: 'Svetlana (女声-俄罗斯)', value: 'ru-RU-SvetlanaNeural' },

  // 葡萄牙语语音
  { label: 'Antonio (男声-巴西)', value: 'pt-BR-AntonioNeural' },
  { label: 'Francisca (女声-巴西)', value: 'pt-BR-FranciscaNeural' },
  { label: 'Thalita (女声-巴西-多语言)', value: 'pt-BR-ThalitaMultilingualNeural' },

  // 阿拉伯语语音
  { label: 'Hamed (男声-沙特)', value: 'ar-SA-HamedNeural' },
  { label: 'Zariyah (女声-沙特)', value: 'ar-SA-ZariyahNeural' },
];

export default function TTSPage() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('zh-CN-XiaoyiNeural');
  const [rate, setRate] = useState(0); // -100 to 100
  const [pitch, setPitch] = useState(0); // -100 to 100
  const [volume, setVolume] = useState(0); // -100 to 100
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<null | string>(null);

  // 将滑块值转换为TTS参数格式
  const formatParam = (value: number, type: 'pitch' | 'rate' | 'volume') => {
    if (value === 0) return 'default';
    const sign = value > 0 ? '+' : '';

    if (type === 'pitch') {
      // 音调范围 -50% 到 +50%
      return `${sign}${value}%`;
    } if (type === 'rate') {
      // 语速范围 -50% 到 +50%
      return `${sign}${value}%`;
    }
    // 音量范围 -50% 到 +50%
    return `${sign}${value}%`;
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('请输入要转换的文本');
      return;
    }

    try {
      setIsGenerating(true);

      // 释放之前的URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      const response = await fetch('/api/tts', {
        body: JSON.stringify({
          pitch: formatParam(pitch, 'pitch'),
          rate: formatParam(rate, 'rate'),
          text,
          voice,
          volume: formatParam(volume, 'volume'),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (!response.ok) {
        const error: any = await response.json();
        throw new Error(error.error || '生成失败，请稍后再试');
      }

      // 获取音频数据并创建Blob URL
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      // 播放音频
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    } catch (error) {
      console.error('TTS生成错误:', error);
      toast.error(error instanceof Error ? error.message : '生成失败，请稍后再试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <h1 className="mb-6 text-3xl font-bold">文字转语音</h1>

      <div className="space-y-6">
        <div>
          <Label htmlFor="text">输入文本</Label>
          <Textarea
            className="mt-2 h-32"
            id="text"
            onChange={(e) => setText(e.target.value)}
            placeholder="请输入要转换为语音的文本内容..."
            value={text}
          />
        </div>

        <div>
          <Label htmlFor="voice">选择语音</Label>
          <Select onValueChange={setVoice} value={voice}>
            <SelectTrigger className="mt-2" id="voice">
              <SelectValue placeholder="选择语音" />
            </SelectTrigger>
            <SelectContent>
              {VOICES.map((v) => (
                <SelectItem key={v.value} value={v.value}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>语速: {rate}%</Label>
          <Slider
            className="mt-2"
            max={50}
            min={-50}
            onValueChange={(values) => setRate(values[0])}
            step={1}
            value={[rate]}
          />
        </div>

        <div>
          <Label>音调: {pitch}%</Label>
          <Slider
            className="mt-2"
            max={50}
            min={-50}
            onValueChange={(values) => setPitch(values[0])}
            step={1}
            value={[pitch]}
          />
        </div>

        <div>
          <Label>音量: {volume}%</Label>
          <Slider
            className="mt-2"
            max={50}
            min={-50}
            onValueChange={(values) => setVolume(values[0])}
            step={1}
            value={[volume]}
          />
        </div>

        <Button
          className="w-full"
          disabled={isGenerating || !text.trim()}
          onClick={handleGenerate}
        >
          {isGenerating ? '生成中...' : '生成语音'}
        </Button>

        {audioUrl && (
          <div className="mt-6">
            <Label>预览</Label>
            <audio className="mt-2 w-full" controls crossOrigin="anonymous" ref={audioRef}>
              <track kind="captions" label="中文字幕" src="" srcLang="zh" />
              <source src={audioUrl} type="audio/mpeg" />
              您的浏览器不支持音频播放
            </audio>
            <div className="mt-2">
              <Button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = audioUrl;
                  a.download = 'speech.mp3';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                variant="outline"
              >
                下载语音
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}