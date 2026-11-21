package org.keralawaterways.thoninet.data

import android.content.Context
import android.location.Location
import android.os.Looper
import com.google.android.gms.location.*
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import java.util.UUID

// ==========================================
// DOMAIN MODELS (STRICT DOMAIN TYPING)
// ==========================================

enum class VesselClassification(val label: String) {
    PUBLIC_SWTD_FERRY("Public SWTD Passenger Ferry"),
    COMMERCIAL_HOUSEBOAT("Commercial Houseboat"),
    MOTORIZED_SHIKARA("Motorized Shikara"),
    SPEEDBOAT_WATER_TAXI("Speedboat / Water Taxi"),
    TRADITIONAL_CANOE("Traditional Country Craft (Vallam)")
}

enum class VesselStatus {
    ON_DUTY,
    MOORED,
    MAINTENANCE,
    DISTRESS_SOS
}

data class Coordinates(val latitude: Double, val longitude: Double)

data class Jetty(
    val id: String,
    val nameEn: String,
    val nameMl: String,
    val location: Coordinates,
    val isTerminal: Boolean = false
)

data class VesselRegistration(
    val id: String = UUID.randomUUID().toString(),
    val kivRegistrationCode: String,
    val vesselName: String,
    val classification: VesselClassification,
    val maxPassengerCapacity: Int,
    val lifeJacketCount: Int,
    val syrangLicenseNumber: String,
    val pcbBioTankCertificate: String,
    val documentImageUri: String?,
    val registrationTimestamp: Long = System.currentTimeMillis()
)

data class ActiveVesselTelemetry(
    val vesselId: String,
    val vesselName: String,
    val currentPosition: Coordinates,
    val speedKnots: Double,
    val headingDegrees: Float,
    val activePassengers: Int,
    val maxCapacity: Int,
    val status: VesselStatus,
    val nearestJetty: Jetty,
    val distanceToNextJettyMeters: Double,
    val etaSeconds: Long
)

// ==========================================
// PRODUCTION HARDWARE LOCATION MANAGER (KOTLIN FLOW)
// Respects Android 14+ foreground location requirements
// ==========================================

class WaterwayLocationManager(context: Context) {
    private val fusedLocationClient: FusedLocationProviderClient =
        LocationServices.getFusedLocationProviderClient(context)

    private val locationRequest = LocationRequest.Builder(
        Priority.PRIORITY_HIGH_ACCURACY, 3000L
    ).apply {
        setMinUpdateIntervalMillis(1500L)
        setMinUpdateDistanceMeters(2.0f) // Geofenced updates
        setWaitForAccurateLocation(true)
    }.build()

    fun observeRawLocationUpdates(): Flow<Location> = callbackFlow {
        val callback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                result.lastLocation?.let { trySend(it) }
            }
        }

        try {
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                callback,
                Looper.getMainLooper()
            )
        } catch (e: SecurityException) {
            close(e)
        }

        awaitClose {
            fusedLocationClient.removeLocationUpdates(callback)
        }
    }
}

// ==========================================
// SECTOR MASTER WATERWAY REPOSITORY
// High-efficiency in-memory spatial graph
// ==========================================

object WaterwayRepository {
    val ALAPPUZHA_JETTIES = listOf(
        Jetty("ALP_MAIN", "Alappuzha Main SWTD Terminal", "ആലപ്പുഴ മെയിൻ ടെർമിനൽ", Coordinates(9.5008, 76.3453), true),
        Jetty("KUP", "Kuppapuram Waypoint", "കുപ്പപ്പുറം ജെട്ടി", Coordinates(9.5100, 76.3750)),
        Jetty("KAI", "Kainakary Chira Station", "കൈനകരി ചിറ ജെട്ടി", Coordinates(9.5215, 76.3892)),
        Jetty("R_BLK", "R-Block / Chithira Polder", "ആർ-ബ്ലോക്ക് ജെട്ടി", Coordinates(9.5333, 76.4250)),
        Jetty("PUL", "Pulinkunnu Central Terminal", "പുളിങ്കുന്ന് ജെട്ടി", Coordinates(9.4981, 76.4385)),
        Jetty("NED", "Nedumudi Bridge Terminal", "നെടുമുടി ജെട്ടി", Coordinates(9.4389, 76.4021)),
        Jetty("KOD", "Kottayam Kodimatha Port", "കോട്ടയം കോടിമത ടെർമിനൽ", Coordinates(9.5592, 76.5061), true)
    )

    fun findNearestJetty(current: Coordinates): Pair<Jetty, Double> {
        var minDistance = Double.MAX_VALUE
        var nearest = ALAPPUZHA_JETTIES.first()

        for (jetty in ALAPPUZHA_JETTIES) {
            val dist = computeDistanceMeters(current, jetty.location)
            if (dist < minDistance) {
                minDistance = dist
                nearest = jetty
            }
        }
        return Pair(nearest, minDistance)
    }

    // Pure Kotlin Haversine baseline matching Rust SIMD core
    fun computeDistanceMeters(p1: Coordinates, p2: Coordinates): Double {
        val r = 6371000.0 // Earth radius in meters
        val lat1 = Math.toRadians(p1.latitude)
        val lat2 = Math.toRadians(p2.latitude)
        val dLat = Math.toRadians(p2.latitude - p1.latitude)
        val dLon = Math.toRadians(p2.longitude - p1.longitude)

        val a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2)
        val c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return r * c
    }
}
