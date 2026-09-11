export interface VoiceOptions {
  language: string;
  speed?: 'slow' | 'normal' | 'fast';
}

export interface VoiceProvider {
  generateSpeech(text: string, options: VoiceOptions): Promise<{ audioBase64?: string; isMock: boolean }>;
}

// Configured ElevenLabs Voice IDs per Indian language
const VOICE_MAP: Record<string, string> = {
  en: process.env.JAGO_EN_VOICE_ID || '21m00Tcm4TlvDq8ikWAM', // Rachel / Adam
  hi: process.env.JAGO_HI_VOICE_ID || 'AZnzlk1XvdvUeBnXmlld', // Domi / Multilingual
  ta: process.env.JAGO_TA_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL', // Bella / Multilingual
  te: process.env.JAGO_TE_VOICE_ID || 'MF3mGyEYCl7XYWbV9V6O', // Elli / Multilingual
  mr: process.env.JAGO_MR_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb', // Josh / Multilingual
  bn: process.env.JAGO_BN_VOICE_ID || 'pNInz6obpgDQGcFmaJgB', // Adam / Multilingual
  ml: process.env.JAGO_ML_VOICE_ID || 'pNInz6obpgDQGcFmaJgB', // Multilingual
  kn: process.env.JAGO_KN_VOICE_ID || 'cgSgspJ2msm6clMCkdW9', // Jeremy / Multilingual
};

export class ElevenLabsVoiceProvider implements VoiceProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
  }

  async generateSpeech(text: string, options: VoiceOptions): Promise<{ audioBase64?: string; isMock: boolean }> {
    if (!this.apiKey || this.apiKey.startsWith('your_')) {
      console.warn('ElevenLabs API Key missing. Falling back to Mock/Browser Voice Provider.');
      return new MockVoiceProvider().generateSpeech(text, options);
    }

    const voiceId = VOICE_MAP[options.language] || VOICE_MAP['en'];
    const stability = options.speed === 'slow' ? 0.75 : 0.5;
    const similarityBoost = 0.75;
    const style = 0.0;
    const useSpeakerBoost = true;

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2', // Native support for EN, HI, TA, TE, MR, BN, KN
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: useSpeakerBoost,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs status ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(arrayBuffer).toString('base64');
      return {
        audioBase64: `data:audio/mpeg;base64,${base64Audio}`,
        isMock: false,
      };
    } catch (err: any) {
      console.error('ElevenLabs TTS Error:', err.message || err);
      // Seamless fallback to Mock Provider if ElevenLabs fails
      return new MockVoiceProvider().generateSpeech(text, options);
    }
  }
}

export class MockVoiceProvider implements VoiceProvider {
  async generateSpeech(text: string, options: VoiceOptions): Promise<{ audioBase64?: string; isMock: boolean }> {
    return {
      audioBase64: undefined, // Client uses browser SpeechSynthesis API fallback
      isMock: true,
    };
  }
}

export class VoiceAssistantService {
  private provider: VoiceProvider;

  constructor() {
    if (process.env.ELEVENLABS_API_KEY) {
      this.provider = new ElevenLabsVoiceProvider();
    } else {
      this.provider = new MockVoiceProvider();
    }
  }

  async speak(text: string, language: string = 'en', speed: 'slow' | 'normal' | 'fast' = 'slow') {
    return await this.provider.generateSpeech(text, { language, speed });
  }
}

export const voiceAssistantService = new VoiceAssistantService();
