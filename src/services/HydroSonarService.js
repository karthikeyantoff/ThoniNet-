// src/services/HydroSonarService.js
// Physical-World Computing: Acoustic Depth Echo Sounder & Canal Clearance Gauge
// Monitors waterway draft depth, bridge air clearances, and low-tide silt ground warnings

export const CANAL_WATER_SEGMENTS = [
  { id: 'NW3_ALP_KUP', reach: 'Alappuzha - Kuppapuram Canal', baseDraft: 2.8, bridgeClearance: 4.5, siltRisk: 'LOW' },
  { id: 'NW3_KUP_KAI', reach: 'Kuppapuram - Kainakary Chira', baseDraft: 2.2, bridgeClearance: 3.8, siltRisk: 'MODERATE' },
  { id: 'NW3_KAI_RBL', reach: 'Kainakary - R-Block Kayal', baseDraft: 3.6, bridgeClearance: 5.2, siltRisk: 'LOW' },
  { id: 'NW3_RBL_PUL', reach: 'R-Block - Pulinkunnu Inland Reach', baseDraft: 1.9, bridgeClearance: 3.2, siltRisk: 'HIGH' },
  { id: 'NW3_PUL_NED', reach: 'Pulinkunnu - Nedumudi Bridge Reach', baseDraft: 2.4, bridgeClearance: 3.0, siltRisk: 'HIGH' }
];

class HydroSonarService {
  constructor() {
    this.currentTideLevel = 0.4; // +0.4m above mean sea level (Alappuzha tidal baseline)
  }

  calculateClearance(segmentId, userVesselHeight = 2.1, vesselDraft = 1.1) {
    const segment = CANAL_WATER_SEGMENTS.find(s => s.id === segmentId) || CANAL_WATER_SEGMENTS[0];
    
    // Dynamic draft under hull taking tidal fluctuation into account
    const effectiveWaterDepth = segment.baseDraft + this.currentTideLevel;
    const underKeelClearance = effectiveWaterDepth - vesselDraft;

    // Air draft under low-slung canal bridges
    const effectiveBridgeClearance = segment.bridgeClearance - this.currentTideLevel;
    const bridgeOverheadMargin = effectiveBridgeClearance - userVesselHeight;

    let draftStatus = "SAFE"; // SAFE | CAUTION | DANGER
    if (underKeelClearance < 0.6) {
      draftStatus = "DANGER";
    } else if (underKeelClearance < 1.0) {
      draftStatus = "CAUTION";
    }

    let bridgeStatus = "CLEAR";
    if (bridgeOverheadMargin < 0.5) {
      bridgeStatus = "COLLISION_RISK";
    } else if (bridgeOverheadMargin < 1.0) {
      bridgeStatus = "LOW_OVERHEAD";
    }

    return {
      segment: segment.reach,
      waterDepth: effectiveWaterDepth.toFixed(1),
      underKeelMargin: underKeelClearance.toFixed(1),
      draftStatus,
      overheadMargin: bridgeOverheadMargin.toFixed(1),
      bridgeStatus,
      siltRisk: segment.siltRisk,
      tideStatus: this.currentTideLevel >= 0 ? `High Tide (+${this.currentTideLevel}m)` : `Low Tide (${this.currentTideLevel}m)`
    };
  }
}

export default new HydroSonarService();
