package org.keralawaterways.thoninet.ui

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import org.keralawaterways.thoninet.data.*

// ==========================================
// COLOR TOKENS (Strict Anti-Slop / High-Legibility)
// ==========================================
val DarkCanvas = Color(0xFF0B0F17)
val SurfaceCard = Color(0xFF131926)
val BorderSubtle = Color(0xFF1E293B)
val MarineTeal = Color(0xFF0D9488)
val MarineTealContainer = Color(0x1A0D9488)
val AmberWarning = Color(0xFFD97706)
val RedDistress = Color(0xFFEF4444)
val TextPrimary = Color(0xFFF8FAFC)
val TextSecondary = Color(0xFF94A3B8)

enum class AppSurfaceMode { PUBLIC_TRANSIT, OWNER_REGISTRATION, OWNER_COCKPIT }

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ThoniNetApp(
    userCoordinates: Coordinates?,
    nearestJettyInfo: Pair<Jetty, Double>?,
    onBroadcastDistress: () -> Unit
) {
    var activeMode by remember { mutableStateOf(AppSurfaceMode.PUBLIC_TRANSIT) }
    var registeredVessel by remember { mutableStateOf<VesselRegistration?>(null) }

    // Scaffold with STRICT Edge-to-Edge WindowInsets protection (No breaking notification bar)
    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkCanvas),
        contentWindowInsets = WindowInsets.statusBars.union(WindowInsets.navigationBars),
        topBar = {
            ThoniNetTopAppBar(
                activeMode = activeMode,
                onModeSelected = { activeMode = it }
            )
        },
        containerColor = DarkCanvas
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Persistent Hardware GPS Sentry Banner
                HardwareGpsSentryBanner(
                    coordinates = userCoordinates,
                    nearestJettyInfo = nearestJettyInfo
                )

                // Surface Crossfade Transition
                AnimatedContent(
                    targetState = activeMode,
                    transitionSpec = { fadeIn() togetherWith fadeOut() },
                    label = "SurfaceModeAnimation"
                ) { mode ->
                    when (mode) {
                        AppSurfaceMode.PUBLIC_TRANSIT -> PublicTransitSurface(nearestJettyInfo)
                        AppSurfaceMode.OWNER_REGISTRATION -> OwnerRegistrationSurface(
                            onRegistrationSuccess = {
                                registeredVessel = it
                                activeMode = AppSurfaceMode.OWNER_COCKPIT
                            }
                        )
                        AppSurfaceMode.OWNER_COCKPIT -> OwnerCockpitSurface(
                            vessel = registeredVessel,
                            onBroadcastDistress = onBroadcastDistress
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ThoniNetTopAppBar(
    activeMode: AppSurfaceMode,
    onModeSelected: (AppSurfaceMode) -> Unit
) {
    Surface(
        color = Color(0xFF0F172A),
        border = BorderStroke(1.dp, BorderSubtle),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "THONINET",
                    color = TextPrimary,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = "Kerala Inland Vessel Safety Network",
                    color = TextSecondary,
                    fontSize = 10.sp
                )
            }

            // Mode Toggle Bar
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(BorderSubtle)
                    .padding(2.dp)
            ) {
                ModeToggleButton(
                    label = "Public",
                    selected = activeMode == AppSurfaceMode.PUBLIC_TRANSIT,
                    onClick = { onModeSelected(AppSurfaceMode.PUBLIC_TRANSIT) }
                )
                ModeToggleButton(
                    label = "Owner Portal",
                    selected = activeMode == AppSurfaceMode.OWNER_REGISTRATION || activeMode == AppSurfaceMode.OWNER_COCKPIT,
                    onClick = { onModeSelected(AppSurfaceMode.OWNER_REGISTRATION) }
                )
            }
        }
    }
}

@Composable
private fun ModeToggleButton(label: String, selected: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(if (selected) MarineTeal else Color.Transparent)
            .clickable(onClick = onClick)
            .padding(horizontal = 10.dp, vertical = 6.dp)
    ) {
        Text(
            text = label,
            color = if (selected) Color.White else TextSecondary,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
private fun HardwareGpsSentryBanner(
    coordinates: Coordinates?,
    nearestJettyInfo: Pair<Jetty, Double>?
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(SurfaceCard)
            .border(BorderStroke(1.dp, BorderSubtle))
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(if (coordinates != null) Color(0xFF10B981) else AmberWarning)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = if (coordinates != null)
                    "GPS ${"%.4f".format(coordinates.latitude)}°N, ${"%.4f".format(coordinates.longitude)}°E"
                else "Acquiring GNSS Lock...",
                color = TextSecondary,
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace
            )
        }
        Text(
            text = nearestJettyInfo?.let { "${it.first.nameEn} (${"%.1f".format(it.second / 1000.0)} km)" } ?: "Syncing...",
            color = Color(0xFF38BDF8),
            fontSize = 10.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
private fun PublicTransitSurface(nearestJettyInfo: Pair<Jetty, Double>?) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            // Live Transit Radar Card
            Surface(
                color = SurfaceCard,
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, BorderSubtle),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "SWTD SERVICE 01 • VEMBANAD EXPRESS",
                            color = MarineTeal,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "SCHEDULE COMPLIANT",
                            color = Color(0xFF10B981),
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier
                                .background(Color(0x1A10B981), RoundedCornerShape(4.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "Alappuzha Main Terminal ➔ Kottayam Kodimatha",
                        color = TextPrimary,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(14.dp))
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text(
                            text = "06",
                            color = AmberWarning,
                            fontSize = 42.sp,
                            fontWeight = FontWeight.ExtraBold,
                            fontFamily = FontFamily.Monospace,
                            lineHeight = 42.sp
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "MINUTES ESTIMATED TIME OF ARRIVAL",
                                color = TextSecondary,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Next Waypoint: Kainakary Chira Station",
                                color = TextPrimary,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(18.dp))
                    HorizontalDivider(color = BorderSubtle)
                    Spacer(modifier = Modifier.height(14.dp))

                    // Linear Waypoint Stepper
                    WaterwayStationStep("Alappuzha Main SWTD Terminal", "09:30 AM", true)
                    StationConnector()
                    WaterwayStationStep("Kuppapuram Waypoint", "09:55 AM", true)
                    StationConnector()
                    WaterwayStationStep("Kainakary Chira Station (Approaching)", "10:14 AM", false, true)
                    StationConnector()
                    WaterwayStationStep("Pulinkunnu Central Terminal", "10:35 AM", false)
                    StationConnector()
                    WaterwayStationStep("Kottayam Kodimatha Terminal", "11:45 AM", false)
                }
            }
        }
    }
}

@Composable
private fun WaterwayStationStep(name: String, time: String, completed: Boolean, active: Boolean = false) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(10.dp)
                .clip(RoundedCornerShape(5.dp))
                .background(
                    if (active) MarineTeal else if (completed) Color(0xFF334155) else BorderSubtle
                )
        )
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = time,
            color = if (active) MarineTeal else TextSecondary,
            fontSize = 11.sp,
            fontFamily = FontFamily.Monospace,
            modifier = Modifier.width(64.dp)
        )
        Text(
            text = name,
            color = if (active) TextPrimary else TextSecondary,
            fontSize = 12.sp,
            fontWeight = if (active) FontWeight.Bold else FontWeight.Normal
        )
    }
}

@Composable
private fun StationConnector() {
    Box(
        modifier = Modifier
            .padding(start = 4.dp, top = 2.dp, bottom = 2.dp)
            .width(2.dp)
            .height(16.dp)
            .background(Color(0xFF1E293B))
    )
}

@Composable
private fun OwnerRegistrationSurface(onRegistrationSuccess: (VesselRegistration) -> Unit) {
    var kivCode by remember { mutableStateOf("") }
    var vesselName by remember { mutableStateOf("") }
    var capacity by remember { mutableStateOf("12") }
    var lifeJackets by remember { mutableStateOf("14") }
    var syrangLicense by remember { mutableStateOf("") }
    var pcbCode by remember { mutableStateOf("") }
    var imageUri by remember { mutableStateOf<Uri?>(null) }

    val imagePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? -> imageUri = uri }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text(
                text = "Statutory KIV Vessel Registration",
                color = TextPrimary,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Inland Vessels Act 2021 / Port of Alappuzha Digital Compliance",
                color = TextSecondary,
                fontSize = 11.sp
            )
        }

        item {
            RegistrationInputField(
                label = "KIV Registration Code",
                value = kivCode,
                onValueChange = { kivCode = it },
                placeholder = "e.g. KIV/ALP/SH/1029/2026"
            )
        }

        item {
            RegistrationInputField(
                label = "Vessel Name",
                value = vesselName,
                onValueChange = { vesselName = it },
                placeholder = "e.g. Vembanad Shikara 01"
            )
        }

        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Box(modifier = Modifier.weight(1f)) {
                    RegistrationInputField(
                        label = "Max Passenger Limit",
                        value = capacity,
                        onValueChange = { capacity = it },
                        keyboardType = KeyboardType.Number
                    )
                }
                Box(modifier = Modifier.weight(1f)) {
                    RegistrationInputField(
                        label = "Certified Life Jackets",
                        value = lifeJackets,
                        onValueChange = { lifeJackets = it },
                        keyboardType = KeyboardType.Number
                    )
                }
            }
        }

        item {
            RegistrationInputField(
                label = "Master / Syrang License No.",
                value = syrangLicense,
                onValueChange = { syrangLicense = it },
                placeholder = "e.g. SYR-KIV-8902"
            )
        }

        item {
            RegistrationInputField(
                label = "Pollution Control Board Bio-Tank Token",
                value = pcbCode,
                onValueChange = { pcbCode = it },
                placeholder = "e.g. PCB/ALP/BT-2026-99"
            )
        }

        item {
            Button(
                onClick = { imagePicker.launch("image/*") },
                colors = ButtonDefaults.buttonColors(containerColor = BorderSubtle),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = if (imageUri != null) "Vessel Image Attached (Replace)" else "Attach Hull / Inspection Photo",
                    color = Color(0xFF38BDF8),
                    fontSize = 12.sp
                )
            }
            imageUri?.let {
                Spacer(modifier = Modifier.height(8.dp))
                AsyncImage(
                    model = it,
                    contentDescription = "Vessel Preview",
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(140.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .border(1.dp, BorderSubtle, RoundedCornerShape(8.dp)),
                    contentScale = ContentScale.Crop
                )
            }
        }

        item {
            Spacer(modifier = Modifier.height(6.dp))
            Button(
                onClick = {
                    if (kivCode.isNotBlank() && vesselName.isNotBlank()) {
                        val reg = VesselRegistration(
                            kivRegistrationCode = kivCode,
                            vesselName = vesselName,
                            classification = VesselClassification.MOTORIZED_SHIKARA,
                            maxPassengerCapacity = capacity.toIntOrNull() ?: 12,
                            lifeJacketCount = lifeJackets.toIntOrNull() ?: 14,
                            syrangLicenseNumber = syrangLicense,
                            pcbBioTankCertificate = pcbCode,
                            documentImageUri = imageUri?.toString()
                        )
                        onRegistrationSuccess(reg)
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = MarineTeal),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "EXECUTE STATUTORY REGISTRATION",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    letterSpacing = 0.5.sp
                )
            }
        }
    }
}

@Composable
private fun RegistrationInputField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String = "",
    keyboardType: KeyboardType = KeyboardType.Text
) {
    Column {
        Text(text = label, color = TextSecondary, fontSize = 11.sp, fontWeight = FontWeight.Medium)
        Spacer(modifier = Modifier.height(4.dp))
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            placeholder = { Text(placeholder, color = Color(0xFF475569), fontSize = 12.sp) },
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = DarkCanvas,
                unfocusedContainerColor = DarkCanvas,
                focusedBorderColor = MarineTeal,
                unfocusedBorderColor = BorderSubtle,
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary
            ),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
private fun OwnerCockpitSurface(
    vessel: VesselRegistration?,
    onBroadcastDistress: () -> Unit
) {
    var isOnDuty by remember { mutableStateOf(true) }
    var activePassengers by remember { mutableStateOf(8) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Surface(
            color = SurfaceCard,
            shape = RoundedCornerShape(12.dp),
            border = BorderStroke(1.dp, BorderSubtle),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "OPERATOR COCKPIT",
                    color = MarineTeal,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = vessel?.vesselName ?: "Vembanad Shikara 01",
                    color = TextPrimary,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "KIV Identifier: ${vessel?.kivRegistrationCode ?: "KIV/ALP/SH/1029/2026"}",
                    color = TextSecondary,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )

                Spacer(modifier = Modifier.height(16.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    // Duty Toggle
                    Surface(
                        color = DarkCanvas,
                        shape = RoundedCornerShape(8.dp),
                        border = BorderStroke(1.dp, BorderSubtle),
                        modifier = Modifier.weight(1f)
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("STATUS", color = TextSecondary, fontSize = 9.sp, fontFamily = FontFamily.Monospace)
                            Spacer(modifier = Modifier.height(6.dp))
                            Button(
                                onClick = { isOnDuty = !isOnDuty },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (isOnDuty) MarineTeal else AmberWarning
                                ),
                                shape = RoundedCornerShape(6.dp),
                                modifier = Modifier.fillMaxWidth(),
                                contentPadding = PaddingValues(0.dp)
                            ) {
                                Text(
                                    text = if (isOnDuty) "ON DUTY" else "MOORED",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    // Manifest Counter
                    Surface(
                        color = DarkCanvas,
                        shape = RoundedCornerShape(8.dp),
                        border = BorderStroke(1.dp, BorderSubtle),
                        modifier = Modifier.weight(1f)
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("PASSENGERS", color = TextSecondary, fontSize = 9.sp, fontFamily = FontFamily.Monospace)
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                IconButton(
                                    onClick = { if (activePassengers > 0) activePassengers-- },
                                    modifier = Modifier.size(28.dp).background(BorderSubtle, RoundedCornerShape(4.dp))
                                ) {
                                    Text("-", color = Color.White, fontWeight = FontWeight.Bold)
                                }
                                Text(
                                    text = "%02d".format(activePassengers),
                                    color = TextPrimary,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                                IconButton(
                                    onClick = { if (activePassengers < (vessel?.maxPassengerCapacity ?: 12)) activePassengers++ },
                                    modifier = Modifier.size(28.dp).background(BorderSubtle, RoundedCornerShape(4.dp))
                                ) {
                                    Text("+", color = Color.White, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = onBroadcastDistress,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0x26EF4444)),
                    border = BorderStroke(1.dp, Color(0x66EF4444)),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "BROADCAST MARITIME DISTRESS (SOS)",
                        color = RedDistress,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        letterSpacing = 0.5.sp
                    )
                }
            }
        }
    }
}
