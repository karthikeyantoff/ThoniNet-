# ⛵ ThoniWatch (തോണി വാച്ച്) — App Design Plan
### *Where Is My Train for Alappuzha Waterways | Mobile UI/UX & Architecture Blueprint*

---

## 1. Design Philosophy: "Where Is My Train" Meets Kerala Backwaters
* **Visual Language:** Kerala Marine Theme (Deep Backwater Teal `#042f2e`, Warm Warning Amber `#f59e0b`, Emerald Safe Green `#10b981`, and Slate Dark `#090d16`).
* **Core Rule:** **Zero English / Tech Friction**. An elderly passenger in Kuttanad or a tourist with luggage can see where their boat is in **under 3 seconds**.
* **Offline-First:** No spinning loaders or network timeout dialogs. The entire waterway map, schedule matrix, and distance math live in local memory.

---

## 2. Information Architecture (3 Simple Views)

```
┌────────────────────────────────────────────────────────┐
│                   THONIWATCH (APP SHELL)               │
├─────────────────────────┬──────────────────────────────┤
│  TAB 1: LIVE RADAR      │  TAB 2: VERNACULAR VOICE     │  TAB 3: TIMETABLE & MAP
│  (The Main Screen)      │  (Sarvam AI Assistant)       │  (Offline Station Grid)
└─────────────────────────┴──────────────────────────────┘
```

---

## 3. Screen-by-Screen Detailed Layout

### Screen 1: The Live Ferry Radar (Hero Screen)
*Inspired by the iconic "Where Is My Train" live tracking screen.*

```
┌────────────────────────────────────────────────────────┐
│ [≡] തോണി വാച്ച് (ThoniWatch)         [● 100% OFFLINE]  │
├────────────────────────────────────────────────────────┤
│ 📍 Your Nearest Jetty: കൈനകരി ചിറ (Kainakary Chira)  │
├────────────────────────────────────────────────────────┤
│  ⛵ വേമ്പനാട് എക്സ്പ്രസ്സ് (Vembanad Express)            │
│  Route: ആലപ്പുഴ ➔ കോട്ടയം കോടിമത                        │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │   06 മിനിറ്റ്                                  │   │
│   │   MINUTES AWAY (2.1 km down canal)             │   │
│   │   Status: ഓൺ ടൈം (On Time) • Speed: 6 Knots    │   │
│   └────────────────────────────────────────────────┘   │
│                                                        │
│  LIVE CANAL PROGRESSION (Vertical Stepper):            │
│   ● [10:00 AM] ആലപ്പുഴ മെയിൻ ജെട്ടി (Departed)         │
│   │                                                    │
│   ● [10:25 AM] കുപ്പപ്പുറം (Passed)                     │
│   │                                                    │
│   🟡 [10:48 AM] ⛵ കൈനകരി ➔ ആർ-ബ്ലോക്ക് (ഇപ്പോൾ കനാലിൽ) │
│   │                                                    │
│   ○ [11:10 AM] പുളിങ്കുന്ന് ജെട്ടി (Next Stop)         │
│   │                                                    │
│   ○ [11:45 AM] ചമ്പക്കുളം അങ്ങാടി                     │
│   │                                                    │
│   ○ [12:30 PM] കോട്ടയം കോടിമത                         │
└────────────────────────────────────────────────────────┘
```

---

### Screen 2: Sarvam Malayalam Voice Assistant (Accessible Sentry)
*For elderly commuters, people with wet hands, or tourists with language barriers.*

* **Hero Element:** One massive, glowing Emerald Green microphone button.
* **Micro-Copy:** *"മൈക്രോഫോൺ അമർത്തി സംസാരിക്കുക"* (Press & Speak in Malayalam).
* **Sample Audio Prompts:**
  * *"അടുത്ത ബോട്ട് എപ്പോഴാ വരുന്നത്?"* (When is the next boat arriving?)
  * *"കോട്ടയത്തേക്കുള്ള അവസാന ബോട്ട് പോയോ?"* (Did the last boat to Kottayam leave?)
  * *"നെടുമുടിക്ക് ടിക്കറ്റ് ചാർജ്ജ് എത്രയാ?"* (What is the fare to Nedumudi?)
* **Audio Response Banner:** Large Malayalam text accompanied by immediate native spoken playback (Sarvam Bulbul TTS).

---

### Screen 3: Offline Waterway Vector Map & Schedule
* **Interactive Leaflet / Mapbox Canal View:**
  * Visualizes the **Alappuzha–Kottayam Water Highway** with water nodes.
  * Real-time GPS snapping: plots your current location relative to the canal line.
  * Canal hazard overlay: flags water hyacinth (*ആഫ്രിക്കൻ പായൽ*) choke points or bridge clearance warnings.
* **Timetable Search:** Select Departure Jetty $\rightarrow$ Destination Jetty $\rightarrow$ Instant offline list of all daily SWTD ferry departures and fares.

---

## 4. Design Tokens & Visual Specs

| Token | Value | Purpose |
| :--- | :--- | :--- |
| **Primary Marine** | `#042f2e` / `#064e3b` | Header, Brand, Waterway theme |
| **Accent Amber** | `#f59e0b` / `#fbbf24` | Live active boat marker & countdown numbers |
| **Background** | `#090d16` (Deep Slate) | High contrast, battery saving on OLED phones |
| **Card Surface** | `#111827` / `#1e293b` | Elevation and legible content containers |
| **Text Primary** | `#f9fafb` | Malayalam Unicode readability |
| **Font Family** | `Manjari`, `Inter`, `sans-serif` | Clean, native Malayalam font rendering |

---

## 5. Technical Data Flow (100% On-Device)

```
[ Phone GPS (Satellite) ]
         │
         ▼
[ Haversine Distance Calc ] ➔ Calculates distance to all 9 SWTD jetties
         │
         ▼
[ Snap to Nearest Water Vector ] ➔ alappuzha_waterways_offline.json
         │
         ▼
[ Interpolate Ferry Speed (6 knots / ~11 km/h) ]
         │
         ▼
[ Render Live Stepper + ETA Countdown in Minutes ]
```
