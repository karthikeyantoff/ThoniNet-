# ⛵ ThoniNet (തോണി-നെറ്റ്): Official Problem & Solution Specification
### *Unified Inland Waterway Digital Operating System & Vernacular Mobility Network*
**Venue:** The Houseboat Hackathon 2026, Alappuzha, Kerala  
**Target Tracks:** Track 01 (Place & People), Track 02 (Voice & Language), Track 03 (Physical-World Computing)

---

## 1. Executive Summary

Alappuzha is globally renowned for its 1,100 $km^2$ of backwaters, 1,200+ commercial houseboats and shikaras, and the State Water Transport Department (SWTD) ferry network that serves as the lifeblood for 50,000+ island residents. 

While road transit in India has been modernized through platforms like Google Maps and IRCTC’s *Where Is My Train*, Kerala’s inland waterways operate in a digital dark zone:
* Commuters wait blindly at unmonitored wooden jetties in heavy monsoon rain.
* Over 400 unauthorized or uninspected tourist boats navigate without dynamic safety verification or sewage compliance.
* Small country-boat (*തോണി*) and shikara operators lose up to 50% of their income to middleman syndicates.

**ThoniNet** bridges this divide by delivering a full-stack, offline-capable digital operating system for Alappuzha waterways. It unites **statutory vessel compliance and registration** for boat owners with a **"Where Is My Boat" transit radar, safety verification scanner, and Sarvam AI Malayalam voice interface** for daily commuters and tourists.

---

## 2. The Problem Landscape (Deep Dive)

### 2.1 The Commuter Reality: The Blind Water Transit Deficit
* **The Geography of Isolation:** Polders across Kuttanad (such as Kainakary, Nedumudi, Pulinkunnu, and Kavalam) have no contiguous road networks. School students, daily wage laborers, hospital visitors, and elderly residents rely entirely on SWTD passenger ferries.
* **The Information Blackout:** Jetties have no electronic display boards. Ferries are frequently delayed by water hyacinth (*African Payal*) choked canals, low tides, or engine snags. Passengers stand for 45 to 90 minutes in torrential rains with no visibility into whether a ferry has departed, is delayed, or has been canceled.
* **The Connectivity Trap:** Deep inside Vembanad Lake and Kuttanad's sunken canals, 4G/5G mobile signals frequently drop. Existing web apps fail because they depend on persistent cloud handshakes.

### 2.2 The Tourism & Regulatory Crisis: Unregulated Waterways
* **Illegal & Flouted Registrations:** Under the Kerala Inland Vessel (KIV) Rules 2010 and Inland Vessels Act 2021, all motorized craft must maintain valid fitness certificates, master/syrang licenses, pollution control bio-toilets, and life-saving apparatus (LSA). In reality, hundreds of illegal vessels operate using counterfeit permits.
* **Ecological Degradation (Blackwater Dumping):** Without digital tracking of bio-tank discharges, rogue operators discharge untreated sewage directly into Vembanad Lake during night hours, destroying fish sanctuaries and potable water sources.
* **Safety Violations & Tourist Exploitation:** Tragic boat capsizes in Kerala's recent history have stemmed from gross passenger overloading and absent life jackets. Furthermore, tourists face arbitrary overcharging by aggressive jetty middlemen.

### 2.3 The Small Boatman's Dilemma
* Independent shikara operators and traditional canoe rowers (*വള്ളക്കാർ*) lack the English digital literacy to list their services on luxury aggregator platforms. 
* They are forced to pay 40–50% broker commissions at finishing points, suppressing local rural wages while large syndicates capture tourism revenues.

---

## 3. The Solution Architecture: ThoniNet

ThoniNet is built as a dual-sided, offline-resilient platform that links statutory regulation directly with ground-level mobility.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          THONINET CORE ENGINE                          │
├──────────────────────────────────┬─────────────────────────────────────┤
│   A. REGULATORY & OPERATOR HUB   │      B. UNIVERSAL PUBLIC TRANSIT    │
│   (For Boat Owners & Syrangs)    │      (For Commuters & Tourists)     │
└─────────────────┬────────────────┴──────────────────┬──────────────────┘
                  │                                   │
                  ▼                                   ▼
    • KIV Statutory Registration        • Real-Time Waterway Transit Radar
    • Hull, Engine & Bio-Tank Registry    ("Where Is My Train" for Ferries)
    • Dynamic QR Safety Plate Issuer    • Live GPS Distance & Stop Stepper
    • Digital Crew & Manifest Logger    • Point-and-Scan Vessel Verifier
    • One-Touch Maritime SOS Engine     • Sarvam AI Malayalam Voice Sentry
```

---

## 4. Key Platform Pillars

### Pillar 1: Dedicated Statutory Vessel Registration & Operator Cockpit
* **Comprehensive Vessel Registry:** 
  * Captures official KIV Registration numbers, hull construction type (wood/steel/FRP), engine horsepower, and vessel classification (*Houseboat, Shikara, Public Ferry, Speedboat, Canoe*).
  * Enforces mandatory safety quotas: certified passenger limits, life-jacket serial counts, and Pollution Control Board (PCB) bio-toilet clearance tokens.
* **Native Document & Hull Image Upload:**
  * Uses on-device camera/image pickers to capture visual proof of seaworthiness certificates and driver Syrang credentials.
* **Dynamic QR Code Plate Generation:**
  * Upon registration, the vessel is issued an encrypted digital token rendered as an official QR badge affixed to the boat gangway.
* **Operator Cockpit:**
  * Allows Syrangs to toggle real-time operational status (`ON DUTY` vs. `MOORED`), update passenger load counters, and trigger immediate maritime distress (SOS) signals broadcasting precise coordinates to coastal authorities.

### Pillar 2: The "Where Is My Boat" Public Transit Radar
* **Offline Master Waterway Matrix:**
  * Embeds high-precision vector lines of National Waterways (NW-3, NW-8, NW-9) and SWTD ferry corridors (Alappuzha Main – Kuppapuram – Kainakary – R-Block – Pulinkunnu – Nedumudi – Kottayam Kodimatha).
* **Hardware GPS Coordinate Snapping:**
  * Operates on direct satellite GPS data without requiring active cellular internet.
  * Continuously executes the Haversine formula on-device to compute geodesic distances to all regional jetties, calculating real-time ETAs based on current vessel knots.
* **Linear Canal Stepper:**
  * A clear visual progression bar detailing departed stops, active canal transit legs, approaching jetties, and downstream terminal points.

### Pillar 3: Consumer Safety & Anti-Scam Verification
* **Gangway QR Verification:**
  * Any passenger or tourist can point their smartphone camera at the boat's QR code.
  * The app parses the registration, confirming whether the boat is **Government Certified, Inspected, and Insured**, displaying the certified passenger capacity and master Syrang name to prevent overloading.
* **Transparent Tariff Directory:**
  * Displays government-approved hourly rates for shikara and country boat hire, eliminating broker extortion.

### Pillar 4: Sarvam AI Vernacular Voice Pipeline (Track 02 Integration)
* **Zero-Typing Accessibility:** Built for senior citizens, rural commuters with wet hands, and non-English speakers.
* **Sarvam Saaras STT:** Transcribes spoken colloquial Malayalam queries (*"അടുത്ത കോട്ടയം ബോട്ട് എപ്പോഴാ?"*).
* **Grounding Engine:** Contextualizes inquiries against local schedules, water status, and GPS coordinates.
* **Sarvam Bulbul TTS:** Synthesizes clear, native Malayalam spoken audio announcements delivered through device speakers.

---

## 5. Technical Specifications & Stack

| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Mobile Client** | React Native (Expo) | Cross-platform standalone `.apk` bundling without requiring heavy Android Studio IDE overhead. |
| **Edge Compute** | Raspberry Pi 5 / Node.js | Serves as an autonomous, battery-backed jetty beacon broadcasting local captive portal Wi-Fi. |
| **Location Services** | `expo-location` (High Accuracy) | Direct satellite GPS telemetry without reliance on third-party map APIs. |
| **Media Pipeline** | `expo-image-picker` / Base64 Storage | Zero-dependency on-device vessel and certificate photo ingestion. |
| **Voice Engine** | Sarvam AI (Saaras STT + Bulbul TTS) | Native Indian language voice models trained on nuanced regional accents and vocabulary. |
| **Geospatial Engine** | GeoJSON / Leaflet Vector Topology | Lightweight, offline-embeddable waterway routing lines under 2 MB. |
| **Design Language** | Anti-Slop Architectural System | Zero emojis; deep obsidian `#0B0F17` surface, backwater teal `#0D9488` accents, high-contrast monospace typography. |

---

## 6. Social, Economic & Environmental Impact

1. **Humanitarian & Commuter Impact:**
   * Eliminates the 4-hour delay cycle and blind waiting times for over 50,000 backwater commuters across Alappuzha and Kottayam districts.
2. **Economic Empowerment for Local Boatmen:**
   * Shifts power from large tourist syndicates directly to independent country boat and shikara operators, increasing daily earnings by up to 40% through direct bookings.
3. **Environmental Preservation of Vembanad Lake:**
   * Digital bio-tank compliance tracking curtails illegal night sewage dumping, protecting a fragile Ramsar wetland site.
4. **Disaster Readiness & Maritime Safety:**
   * Instant passenger manifest and GPS broadcasting accelerates rescue response times during monsoon flash floods, bund breaches, and squalls from hours to minutes.
