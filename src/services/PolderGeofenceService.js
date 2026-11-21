// src/services/PolderGeofenceService.js
// Cultural Heritage Geofence & Audio Guide Engine (Place & People + Sarvam AI)
// Monitors real GNSS coordinates and triggers bilingual cultural heritage narratives

import SarvamAudioService from './SarvamAudioService';

export const HERITAGE_POLDERS = [
  {
    id: 'R_BLOCK',
    name: 'R-Block / Chithira Kayal Polder',
    nameMl: 'ആർ-ബ്ലോക്ക് / ചിത്തിര കായൽ',
    lat: 9.5333,
    lng: 76.4250,
    radiusMeters: 800,
    narrativeMl: 'നിങ്ങൾ ഇപ്പോൾ കുട്ടനാട്ടിലെ ചരിത്രപ്രസിദ്ധമായ ആർ-ബ്ലോക്കിലൂടെയാണ് കടന്നുപോകുന്നത്. സമുദ്രനിരപ്പിൽ നിന്നും രണ്ട് മീറ്റർ താഴെ കായൽ നികത്തി കൃഷി ചെയ്യുന്ന ലോകത്തിലെ തന്നെ വിസ്മയകരമായ കാർഷിക പൈതൃക മേഖലയാണിത്.',
    narrativeEn: 'You are now cruising through the historic R-Block polders of Kuttanad, farmed 2 to 3 meters below sea level under UNESCO-recognized heritage agriculture.',
    elevation: '-2.2m below sea level'
  },
  {
    id: 'KAINAKARY_CHIRA',
    name: 'Kainakary Chira Bunds',
    nameMl: 'കൈനകരി ചിറ ബണ്ടുകൾ',
    lat: 9.5215,
    lng: 76.3892,
    radiusMeters: 600,
    narrativeMl: 'കൈനകരിയുടെ ജലപാതകൾ കായൽ രാജാവ് മുരിക്കന്റെ ചരിത്രവുമായി ബന്ധപ്പെട്ടിരിക്കുന്നു. വഞ്ചിപ്പാട്ടുകളുടെയും വള്ളംകളിയുടെയും ഈറ്റില്ലമാണ് ഈ പ്രദേശം.',
    narrativeEn: 'Kainakary canal reach, birthplace of ancient boat songs (Vanchipattu) and legendary snake boat races.',
    elevation: '-1.5m below sea level'
  },
  {
    id: 'PULINKUNNU_ISLAND',
    name: 'Pulinkunnu St. Marys Heritage Reach',
    nameMl: 'പുളിങ്കുന്ന് പൈതൃക ജലപാത',
    lat: 9.4981,
    lng: 76.4385,
    radiusMeters: 700,
    narrativeMl: 'പുളിങ്കുന്ന് നദീതീരത്ത് സ്ഥിതി ചെയ്യുന്ന നൂറ്റാണ്ടുകൾ പഴക്കമുള്ള പള്ളിയും ചരിത്രപ്രസിദ്ധമായ കൊട്ടാരങ്ങളും കുട്ടനാടൻ സംസ്കാരത്തിന്റെ നേർസാക്ഷ്യമാണ്.',
    narrativeEn: 'Pulinkunnu island heritage waterfront, home to centuries-old colonial canal architecture and trading jetties.',
    elevation: '-0.8m below sea level'
  }
];

class PolderGeofenceService {
  constructor() {
    this.triggeredGeofences = new Set();
    this.onGeofenceEntered = null;
    this.isStoryPlaying = false;
  }

  setCallback(cb) {
    this.onGeofenceEntered = cb;
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  checkCoordinates(userLat, userLng) {
    if (!userLat || !userLng) return null;

    for (const polder of HERITAGE_POLDERS) {
      const distance = this.calculateDistance(userLat, userLng, polder.lat, polder.lng);
      if (distance <= polder.radiusMeters) {
        if (!this.triggeredGeofences.has(polder.id)) {
          this.triggeredGeofences.add(polder.id);
          this.playGeofenceStory(polder);
          return polder;
        }
      }
    }
    return null;
  }

  async playGeofenceStory(polder) {
    this.isStoryPlaying = true;
    if (this.onGeofenceEntered) {
      this.onGeofenceEntered(polder);
    }
    try {
      await SarvamAudioService.speakMalayalam(polder.narrativeMl);
    } catch (e) {
      console.warn('Geofence voice synthesis error:', e);
    } finally {
      this.isStoryPlaying = false;
    }
  }

  manualPlay(polderId) {
    const polder = HERITAGE_POLDERS.find((p) => p.id === polderId);
    if (polder) {
      this.playGeofenceStory(polder);
    }
  }
}

export default new PolderGeofenceService();
