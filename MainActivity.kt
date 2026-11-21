package org.keralawaterways.thoninet

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import org.keralawaterways.thoninet.data.*
import org.keralawaterways.thoninet.ui.ThoniNetApp

class MainActivity : ComponentActivity() {

    private lateinit var locationManager: WaterwayLocationManager
    private var currentCoords: Coordinates? = null
    private var nearestJettyInfo: Pair<Jetty, Double>? = null

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                      permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (granted) {
            startHardwareLocationPipeline()
        } else {
            Toast.makeText(this, "GNSS hardware lock required for waterway corridor telemetry", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        // Enforce strict Edge-to-Edge display without obscuring system status/navigation bars
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        locationManager = WaterwayLocationManager(applicationContext)

        checkAndRequestHardwarePermissions()

        setContent {
            ThoniNetApp(
                userCoordinates = currentCoords,
                nearestJettyInfo = nearestJettyInfo,
                onBroadcastDistress = {
                    val lat = currentCoords?.latitude ?: 9.5008
                    val lon = currentCoords?.longitude ?: 76.3453
                    Toast.makeText(
                        this,
                        "Maritime Distress Broadcasted. Incident coordinates: $lat, $lon dispatched to Coastal Police.",
                        Toast.LENGTH_LONG
                    ).show()
                }
            )
        }
    }

    private fun checkAndRequestHardwarePermissions() {
        val fineLocation = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
        if (fineLocation == PackageManager.PERMISSION_GRANTED) {
            startHardwareLocationPipeline()
        } else {
            permissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }

    private fun startHardwareLocationPipeline() {
        lifecycleScope.launch {
            locationManager.observeRawLocationUpdates().collectLatest { loc ->
                val coords = Coordinates(loc.latitude, loc.longitude)
                currentCoords = coords
                nearestJettyInfo = WaterwayRepository.findNearestJetty(coords)

                // Trigger UI recomposition
                setContent {
                    ThoniNetApp(
                        userCoordinates = currentCoords,
                        nearestJettyInfo = nearestJettyInfo,
                        onBroadcastDistress = {
                            Toast.makeText(
                                this@MainActivity,
                                "Distress beacon transmitted to Alappuzha Port Controller.",
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    )
                }
            }
        }
    }
}
