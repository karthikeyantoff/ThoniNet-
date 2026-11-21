// src/services/SarvamAudioService.js
// Production Sarvam AI Audio Engine (Real Audio Recording, Real Wave Upload, Real TTS Audio Playback)
import { Audio } from 'expo-av';

const SARVAM_API_KEY = "sk_s38pwf26_1Dr6UQ9f6Tg8mmMUhLttV1VC";

class SarvamAudioService {
  constructor() {
    this.recording = null;
    this.sound = null;
    this.isRecording = false;
  }

  async requestPermissions() {
    try {
      const response = await Audio.requestPermissionsAsync();
      return response.status === 'granted';
    } catch (e) {
      console.error("Audio permission error:", e);
      return false;
    }
  }

  async startRecording() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error("Microphone permission denied");
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.recording = recording;
      this.isRecording = true;
      return true;
    } catch (err) {
      console.error("Failed to start recording:", err);
      this.isRecording = false;
      return false;
    }
  }

  async stopAndTranscribe() {
    try {
      if (!this.recording) return null;

      this.isRecording = false;
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;

      if (!uri) return null;

      // Real FormData binary upload to Sarvam Saaras STT
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'audio/m4a',
        name: 'query.m4a',
      });
      formData.append('language_code', 'ml-IN');
      formData.append('model', 'saaras:v1');

      const response = await fetch('https://api.sarvam.ai/speech-to-text', {
        method: 'POST',
        headers: {
          'api-subscription-key': SARVAM_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn("Sarvam STT Server response:", response.status, errText);
        return null;
      }

      const json = await response.json();
      return json.transcript || null;
    } catch (err) {
      console.error("Transcription error:", err);
      return null;
    }
  }

  async speakMalayalam(text) {
    try {
      if (!text || text.trim().length === 0) return;

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

      if (!response.ok) return;

      const data = await response.json();
      if (data.audios && data.audios.length > 0) {
        const base64Wav = data.audios[0];
        const audioUri = `data:audio/wav;base64,${base64Wav}`;

        if (this.sound) {
          await this.sound.unloadAsync();
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );
        this.sound = sound;
        await sound.playAsync();
      }
    } catch (e) {
      console.error("Sarvam TTS play error:", e);
    }
  }
}

export default new SarvamAudioService();
