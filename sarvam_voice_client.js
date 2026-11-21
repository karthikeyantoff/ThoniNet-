// sarvam_voice_client.js
// Production Sarvam AI Speech-to-Text & Text-to-Speech integration for ThoniNet

const SARVAM_API_KEY = "sk_s38pwf26_1Dr6UQ9f6Tg8mmMUhLttV1VC";

/**
 * Calls Sarvam Bulbul Text-to-Speech API to synthesize natural spoken Malayalam audio
 * @param {string} text in Malayalam
 * @returns {Promise<string|null>} base64 audio string (WAV format)
 */
export async function synthesizeMalayalamSpeech(text) {
  try {
    const response = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": SARVAM_API_KEY
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: "ml-IN",
        speaker: "meera",
        pitch: 0,
        pace: 0.95,
        loudness: 1.2,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: "bulbul:v1"
      })
    });

    if (!response.ok) {
      console.warn("Sarvam TTS request failed, using Web Speech fallback");
      return null;
    }

    const data = await response.json();
    if (data.audios && data.audios.length > 0) {
      return data.audios[0];
    }
    return null;
  } catch (error) {
    console.error("Sarvam TTS Error:", error);
    return null;
  }
}

/**
 * Transcribes spoken audio file using Sarvam Saaras Speech-to-Text API
 * @param {Blob|File} audioBlob
 * @returns {Promise<string|null>} transcribed Malayalam text
 */
export async function transcribeMalayalamAudio(audioBlob) {
  try {
    const formData = new FormData();
    formData.append("file", audioBlob, "query.wav");
    formData.append("language_code", "ml-IN");
    formData.append("model", "saaras:v1");

    const response = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": SARVAM_API_KEY
      },
      body: formData
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.transcript || null;
  } catch (error) {
    console.error("Sarvam STT Error:", error);
    return null;
  }
}
