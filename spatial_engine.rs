// Cargo.toml
/*
[package]
name = "thoninet_core"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
jni = "0.21.1"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
*/

// src/spatial_engine.rs
// Zero-allocation, high-precision Geodesic Snapping & Navigation Core for Alappuzha Waterways

use std::f64::consts::PI;

const EARTH_RADIUS_METERS: f64 = 6371000.0;
const KNOTS_TO_MS: f64 = 0.514444;

#[derive(Debug, Clone, Copy)]
pub struct GeoCoordinate {
    pub latitude: f64,
    pub longitude: f64,
}

#[derive(Debug, Clone)]
pub struct WaterwaySegment {
    pub segment_id: &'static str,
    pub start: GeoCoordinate,
    pub end: GeoCoordinate,
    pub speed_limit_knots: f64,
}

pub struct GeodesicEngine;

impl GeodesicEngine {
    #[inline(always)]
    fn to_radians(degrees: f64) -> f64 {
        degrees * PI / 180.0
    }

    /// Computes accurate Haversine surface distance in meters between two coordinates
    pub fn haversine_distance(p1: GeoCoordinate, p2: GeoCoordinate) -> f64 {
        let lat1_rad = Self::to_radians(p1.latitude);
        let lat2_rad = Self::to_radians(p2.latitude);
        let delta_lat = Self::to_radians(p2.latitude - p1.latitude);
        let delta_lon = Self::to_radians(p2.longitude - p1.longitude);

        let a = (delta_lat / 2.0).sin().powi(2)
            + lat1_rad.cos() * lat2_rad.cos() * (delta_lon / 2.0).sin().powi(2);
        let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());

        EARTH_RADIUS_METERS * c
    }

    /// Projects an arbitrary raw GPS coordinate onto the nearest waterway centerline segment
    pub fn snap_to_waterway(raw: GeoCoordinate, segments: &[WaterwaySegment]) -> (GeoCoordinate, f64, &'static str) {
        let mut min_distance = f64::MAX;
        let mut best_snapped = raw;
        let mut active_segment = "UNKNOWN_CANAL";

        for segment in segments {
            let snapped = Self::project_point_on_segment(raw, segment.start, segment.end);
            let distance = Self::haversine_distance(raw, snapped);

            if distance < min_distance {
                min_distance = distance;
                best_snapped = snapped;
                active_segment = segment.segment_id;
            }
        }

        (best_snapped, min_distance, active_segment)
    }

    /// Linear orthogonal projection of point P onto segment AB
    fn project_point_on_segment(p: GeoCoordinate, a: GeoCoordinate, b: GeoCoordinate) -> GeoCoordinate {
        let ab_x = b.longitude - a.longitude;
        let ab_y = b.latitude - a.latitude;
        let ap_x = p.longitude - a.longitude;
        let ap_y = p.latitude - a.latitude;

        let ab_squared = ab_x * ab_x + ab_y * ab_y;
        if ab_squared < 1e-12 {
            return a;
        }

        let t = ((ap_x * ab_x + ap_y * ab_y) / ab_squared).clamp(0.0, 1.0);

        GeoCoordinate {
            latitude: a.latitude + t * ab_y,
            longitude: a.longitude + t * ab_x,
        }
    }

    /// Computes accurate Estimated Time of Arrival (ETA) in seconds
    pub fn calculate_eta_seconds(distance_meters: f64, current_speed_knots: f64) -> u32 {
        let speed_ms = if current_speed_knots <= 0.5 {
            6.0 * KNOTS_TO_MS // Fallback to nominal 6 knots SWTD cruising speed
        } else {
            current_speed_knots * KNOTS_TO_MS
        };

        (distance_meters / speed_ms).round() as u32
    }
}

// JNI Bindings for Android JNI Native Bridge
#[no_mangle]
pub extern "system" fn Java_org_keralawaterways_thoninet_core_NativeSpatialEngine_nativeComputeDistance(
    _env: jni::JNIEnv,
    _class: jni::objects::JClass,
    lat1: jni::sys::jdouble,
    lon1: jni::sys::jdouble,
    lat2: jni::sys::jdouble,
    lon2: jni::sys::jdouble,
) -> jni::sys::jdouble {
    let p1 = GeoCoordinate { latitude: lat1, longitude: lon1 };
    let p2 = GeoCoordinate { latitude: lat2, longitude: lon2 };
    GeodesicEngine::haversine_distance(p1, p2)
}
