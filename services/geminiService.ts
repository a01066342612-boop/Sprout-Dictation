import { GoogleGenAI, Modality, Type } from "@google/genai";

// Audio Context Helper (Singleton pattern to reuse context)
let audioContext: AudioContext | null = null;
// Cache for decoded AudioBuffers to make replay instant
const audioCache = new Map<string, AudioBuffer>();
// Track current source to allow stopping interruption
let currentSource: AudioBufferSourceNode | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    // 24kHz is the sample rate for Gemini TTS
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000,
    });
  }
  return audioContext;
};

// Base64 decoding helper
const decodeBase64 = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Audio decoding helper for raw PCM
const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> => {
  // The TTS API returns raw PCM 16-bit integer data.
  // We need to convert this to Float32 for the AudioContext.
  
  // Ensure we are reading the buffer correctly as Int16.
  // data.buffer might be shared, so we must respect byteOffset and byteLength.
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Convert Int16 (-32768 to 32767) to Float32 (-1.0 to 1.0)
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

export const stopAudio = (): void => {
  if (currentSource) {
    try {
      currentSource.stop();
    } catch (error) {
      // Ignore errors if already stopped
    }
    currentSource = null;
  }
};

export const playTextToSpeech = async (text: string): Promise<void> => {
  // Stop any previous audio immediately
  stopAudio();

  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    let audioBuffer: AudioBuffer;

    // 1. Check Cache
    if (audioCache.has(text)) {
      audioBuffer = audioCache.get(text)!;
    } else {
      // 2. Fetch from API if not in cache
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found");
      }

      const ai = new GoogleGenAI({ apiKey });

      // Using the TTS model
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `천천히 또박또박 읽어주세요: "${text}"` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // Female voice, good for teacher persona
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        throw new Error("No audio data received");
      }

      // Convert base64 to bytes
      const bytes = decodeBase64(base64Audio);

      // Decode raw PCM data (24kHz, 1 channel)
      audioBuffer = await decodeAudioData(bytes, ctx, 24000, 1);
      
      // Save to cache
      audioCache.set(text, audioBuffer);
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    
    source.onended = () => {
      if (currentSource === source) {
        currentSource = null;
      }
    };
    
    currentSource = source;
    source.start();

  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};

export const generateDictationQuestions = async (type: 'word' | 'sentence', count: number, existingItems: string[] = []): Promise<string[]> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");

    const ai = new GoogleGenAI({ apiKey });
    
    // Create context string for existing items to avoid duplicates
    // Using a list format to explicitly tell Gemini what to avoid
    const exclusionContext = existingItems.length > 0 
      ? `\n\n[현재 목록 - 제외할 것들]\n${existingItems.join(', ')}\n\n주의: 위 목록에 이미 있는 단어나 문장과 똑같거나 너무 비슷한 내용은 피해서, 완전히 새로운 내용으로 만들어줘.`
      : '';

    const prompt = type === 'word' 
      ? `초등학교 1학년 수준의 받아쓰기용 단어를 ${count}개 만들어줘. 쉬운 단어로 선택해.${exclusionContext}` 
      : `초등학교 1학년 수준의 받아쓰기용 짧은 문장을 ${count}개 만들어줘. 맞춤법과 띄어쓰기가 교육적인 내용으로.${exclusionContext}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Generation Error:", error);
    throw error;
  }
};
