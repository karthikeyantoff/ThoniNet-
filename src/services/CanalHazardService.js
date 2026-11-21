// src/services/CanalHazardService.js
// Crowdsourced Water Hyacinth ("Payal") & Floating Debris Obstruction Engine
// Provides real-time canal hazard alerts, bypass routing, and community reporting

export const HAZARD_TYPES = {
  PAYAL_MAT: { label: 'Water Hyacinth (Payal)', icon: 'alert-triangle', severity: 'HIGH' },
  SHALLOW_SILT: { label: 'Shallow Silt Bank', icon: 'anchor', severity: 'MEDIUM' },
  SUBMERGED_LOG: { label: 'Submerged Coconut Trunk', icon: 'alert-circle', severity: 'CRITICAL' },
  BRIDGE_WORK: { label: 'Canal Bridge Maintenance', icon: 'tool', severity: 'LOW' }
};

class CanalHazardService {
  constructor() {
    this.hazards = [
      {
        id: 'HAZ_001',
        type: 'PAYAL_MAT',
        title: 'Thick Water Hyacinth Choke',
        titleMl: 'ആഫ്രിക്കൻ പായൽ തിങ്ങിനിറഞ്ഞു',
        canalReach: 'Kuppapuram - Kainakary Reach',
        lat: 9.5145,
        lng: 76.3820,
        reportedAt: '12 mins ago',
        status: 'ACTIVE_BLOCKAGE',
        recommendedAction: 'Slow to 4 knots or take Meenappally diversion'
      },
      {
        id: 'HAZ_002',
        type: 'SUBMERGED_LOG',
        title: 'Floating Log in Navigational Channel',
        titleMl: 'വെള്ളത്തിനടിയിൽ തടി തടസ്സം',
        canalReach: 'Pulinkunnu North Branch',
        lat: 9.5020,
        lng: 76.4410,
        reportedAt: '35 mins ago',
        status: 'UNRESOLVED',
        recommendedAction: 'Steer starboard of main fairway marker'
      }
    ];
  }

  getActiveHazards() {
    return [...this.hazards];
  }

  reportHazard(typeKey, customReach, coords) {
    const newHazard = {
      id: `HAZ_${Date.now().toString().slice(-4)}`,
      type: typeKey,
      title: HAZARD_TYPES[typeKey]?.label || 'Waterway Hazard',
      titleMl: 'പുതിയ ജലപാത തടസ്സം',
      canalReach: customReach || 'Current GPS Sector',
      lat: coords?.latitude || 9.5008,
      lng: coords?.longitude || 76.3453,
      reportedAt: 'Just now',
      status: 'VERIFIED_BY_SYRANG',
      recommendedAction: 'Caution advised on this canal sector'
    };
    this.hazards.unshift(newHazard);
    return newHazard;
  }
}

export default new CanalHazardService();
