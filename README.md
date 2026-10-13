# Men Opposed to Violence Against Women Everywhere (MOVE)
## City Government of Baguio Chapter &bull; HRIS Management Information System

A full-featured, enterprise web application and local multi-sheet Excel database synchronization system designed for the **Men Opposed to Violence Against Women Everywhere (MOVE)** advocacy group (City Government of Baguio Chapter).

---

## 🏛️ Master Excel Database Architecture (`ALL MALES MARIED WITH TRAINING.xls`)

The primary backend data store is a multi-sheet Microsoft Excel SpreadsheetML database containing **7 dedicated worksheets**:

| Worksheet | Record Count | Description & Scope |
| :--- | :---: | :--- |
| **`Sheet`** | **506** | Master roster of Permanent male City Government of Baguio personnel extracted from the municipal HRIS database. |
| **`Casual`** | **275** | Master roster of Casual and Temporary male City Government of Baguio personnel. |
| **`Officer`** | **17** | Executive leadership directories covering the **2026 Administration** (*President: Dan Ricky M. Ong*) and the **2025 Administration** (*President: Harold P. Mallorca*), under Chapter Advisers Hon. Benjamin B. Magalong and Hon. Faustino A. Olowan. |
| **`Committees`** | **15** | Roster of Standing Committee Chairs and Members (Advocacy & Education, Membership & Welfare, Operations & Logistics, Ways & Means, Monitoring & Evaluation). |
| **`Selected_Participants`** | **51** | Official **50-Participant Balanced Cohort** selected across 23 municipal departments for the MOVE Anti-VAWC Capacity Building Seminar (*e.g., Michael Diazen, Donald Panelo, Daniel Lyone Soriano, etc.*). |
| **`Office_Summary`** | **19** | Analytical breakdown of quota distribution and participant density across municipal offices. |
| **`Members`** | **51** | **Official MOVE Chapter Membership Registry** comprising the 32 Google Form intake survey respondents and 18 Executive Officers / Committee leaders, structured across 16 standardized columns. |

---

## 🔍 Understanding the Datasets: Participants vs. Members vs. Personnel Pool

To ensure clarity across both administrative reporting and training execution, the system distinguishes between three functional datasets:

```
                      ┌────────────────────────────────────────────────────────┐
                      │    City Hall Personnel Pool (748 Male Employees)      │
                      │       [Sheet: 506 Permanent]  +  [Casual: 275]         │
                      └──────────────────────────┬─────────────────────────────┘
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        ▼                                                 ▼
        ┌──────────────────────────────┐                ┌──────────────────────────────────┐
        │   Selected_Participants      │                │             Members              │
        │      (50 Trainees)           │                │    (50 Official Chapter Cadre)   │
        ├──────────────────────────────┤                ├──────────────────────────────────┤
        │ • Balanced across 23 offices │                │ • 32 Google Form Submissions     │
        │ • Age bracket: 30–40 preferred│               │ • 18 Executive Officers & Chairs │
        │ • Designated for Seminar     │                │ • Full Dossiers & Contacts       │
        │ • Attendance tracked in Acts │                │ • Inducted Advocacy Leaders      │
        └──────────────────────────────┘                └──────────────────────────────────┘
```

1. **City Hall Personnel Pool (`748` total)**: The municipal workforce database used by the **50-Participant Filter Tool** to balance departmental quotas and select eligible candidates.
2. **Selected Participants (`50` trainees)**: The balanced cohort designated for the official MOVE orientation and gender-sensitivity workshops. Attendance is monitored in real-time in the Activities module.
3. **MOVE Registered Members (`50` members)**: The official chapter registry populated from the [MOVE Membership Google Form Intake](https://docs.google.com/forms/d/e/1FAIpQLSegiSdCCz_Xj77_kZ76XJaiL_penKL7m662DfgiMTJD6zLMag/viewform?pli=1) and executive leadership rosters, containing verified contact numbers, residential addresses, and training histories.

---

## 🚀 Key Modules & System Features

### 1. 🔐 Authentication & Role-Based Access Control
* Municipal-branded login portal styled in MOVE Midnight Navy (`#091b38`) and Safety Gold (`#f97316`).
* Official insignia integration: **MOVE Baguio Chapter Emblem** and **City Government of Baguio Seal**.
* Preconfigured quick demo logins:
  * **Administrator**: `admin` / `move2026`
  * **Chapter Officer**: `officer.ramos` / `move2026`
  * **Guest / Viewer**: `guest.viewer` / `guest123`
* Session persistence via `localStorage` with real-time user indicator cards.

### 2. 📊 Executive Dashboard
* **4 Core KPI Metric Cards**:
  * Total Registered Members with live breakdown.
  * Workplace Location Distribution: *Inside City Hall Building* vs. *Field Offices / Compounds*.
  * Total Activities Held (*3 Active Programs*).
  * Overall Training Attendance Rate (*94.0% verified present*).
* **Interactive Visual Analytics**:
  * Department Representation Distribution (Top municipal offices).
  * Demographic Age Brackets (`Under 30`, `30–40`, `41–50`, `51 & Above`).
  * Workplace Location Status Meter.
* **Recent Activities Feed**: Quick shortcuts to immediately launch attendance or certificate issuing modals.

### 3. 🏛️ Organizational Structure & Timeline
* **Chapter Governance Hierarchy**:
  * **Honorary Advisory Board**:
    * City Mayor: **Hon. Benjamin B. Magalong** (*Adviser*)
    * City Vice Mayor: **Hon. Faustino A. Olowan** (*Adviser*)
  * **2026 Executive Officers**:
    * President: **Dan Ricky M. Ong** (*SP*)
    * Vice President (External): **Florentino N. Dela Cruz Jr.** (*CMO-LIBRARY*)
    * Secretary: **Ruperto D. Guadaña Jr.** (*SP*)
    * Treasurer: **Rhey J. Delmendo** (*TOURISM*)
    * Auditor: **Regino G. Ragudo** (*CMO*)
    * Public Information Officer: **Avelino G. Cabading Jr.** (*SP*)
  * **2025 Executive Officers (Past Term)**:
    * President: **Harold P. Mallorca** (*CBAO*)
    * Vice President: **Judah F. Sumcad** (*CBAO*)
    * Secretary: **Rommel M. Valdez** (*CMO*)
    * Treasurer: **Joseph Mary S. Itliong** (*CHRMO*)
    * Auditor: **Jayson R. Martin** (*CMO*)
    * Public Information Officer: **Noriel Anthony S. Buenavista** (*CMO*)
  * **Standing Committees**:
    * Advocacy & Education (Chair: **Wilbert Laguinday**)
    * Membership & Welfare (Chair: **Isaac S. Basali**)
    * Logistics & Operations (Chair: **Dexter A. See**)
    * Ways & Means (Chair: **James C. Cosep**)
    * Monitoring & Evaluation (Chair: **Allan Faustino**)
* **Multi-View Modes**:
  * **Timeline View**: Historical administration progression.
  * **Hierarchy Tree View**: Classical organizational tree with pan and zoom controls.
  * **Committees Directory**: Dedicated committee rosters with departmental representation.

### 4. 👥 List of Members & Registry Switcher
* **Database Source Switcher**:
  * **`MOVE Registered Members & Officers (50)`** *(Default)*: Verified chapter roster with official role badges (*President*, *Secretary*, *Committee Chair*, *Member (Cadre)*), direct contact numbers, and building location badges.
  * **`City Hall Personnel Pool (748)`**: Full municipal workforce database for candidate evaluation.
* **Google Form Intake Schema (16 Columns)**:
  * Full Name (Last, First, Middle)
  * Age, Sex, and Civil Status
  * Office / Department & Official Position Title
  * **Inside City Hall?** (`YES` / `NO` location status)
  * Residential Address & Preferred Mailing Address
  * Mobile Contact Number & Verified Email
  * Gender-Related Trainings / Seminars Attended & Conducting Agency
  * MOVE Chapter Role & Appointment Status
* **Member Dossier Modal**:
  * Detailed bio-data view with 1-click **"Print Member Dossier"**.
* **Exports**: 1-click export to Excel (`.xlsx`) and CSV.

### 5. 📅 Activities & Interactive Attendance Modal
* **Master Activities Table**:
  * Tracks `#`, `Date`, `Type of Activity`, `Title`, `Purpose`, `Trainer / Speaker`, `Duration`, and `Attendance Ratio`.
  * **Double-Click Edit**: Double-clicking any activity row in the Activities Table or Dashboard immediately opens the **Edit Activity / Training Details Modal** (`#modalEditActivity`).
  * **Action Button**: Dedicated **Edit** button (`<button>Edit</button>`) next to `Attendance →` for single-click access.
* **Drill-Down Participant Attendance Modal**:
  * Interactive modal displaying complete participant roster.
  * Real-time attendance rate calculation.
  * Filter by attendance state (`All`, `Present Only`, `Absent Only`).
  * One-click attendance toggles (`✓ YES / ✗ NO`).
  * **Header Editing**: Double-clicking the attendance modal header or clicking **"Edit Training"** opens the Edit modal and updates attendance headers, dashboard, and certificate dropdowns in real time upon saving.
  * Direct action shortcut: **"🎓 Generate Certificates for Present Attendees"**.

### 6. 🎓 Official Certificate Studio & Interactive Designer
* Dynamic, automated certificate generation & live WYSIWYG design studio:
  * **Attendance-Gated Issuance**: Automatically validates and issues certificates **only** to participants confirmed as `Present`.
  * **Side-by-Side Responsive Studio Workspace**:
    * Clean two-column layout (`flex-col md:flex-row items-start w-full`):
      * **Left Column**: Sticky, scrollable **Designer Toolbox** (`w-full md:w-80 lg:w-96`, `sticky top-4 max-h-[calc(100vh-120px)] overflow-y-auto`) housing tabbed toolsets (*Move*, *Images*, *Text*, *Signatures*, *Border*).
      * **Right Column**: Live **Certificate Stage Canvas** (`flex-1 min-w-0`), rendering the full A4 landscape certificate (`aspect-[1.414/1]`) side-by-side with zero overlap and zero blank margins.
    * When Designer Mode is toggled off, the canvas smoothly centers across the full workspace stage.
  * **In-Place Canvas Click-to-Edit (WYSIWYG)**:
    * Click directly on any text element on the certificate canvas to focus and type in place:
      * **Header Block**: Republic text, City Hall name, MOVE chapter name, and subtitle.
      * **Award Title & Lead-in**: Main title (`CERTIFICATE OF PARTICIPATION`, etc.) and intro text.
      * **Recipient Section**: Full attendee name and municipal office/position subtitle.
      * **Citation Paragraph**: Lead statement, event title, and comprehensive details template (`{date}`, `{venue}`, `{duration}`).
      * **Signatories Block**: Signatory names, titles, and offices.
    * Polished typography interaction:
      * **Hover Outline**: Subtle dashed orange box (`1.5px dashed #f97316`) on hover signaling editability without cluttering unselected elements.
      * **Focus Ring**: Crisp active focus border (`2px solid #ea580c`) with white focus background and cursor retention.
      * **Keyboard Controls**: Pressing <kbd>Enter</kbd> commits single-line text; <kbd>Escape</kbd> clears focus.
  * **Comprehensive Undo & Redo History Engine (`Ctrl+Z` / `Ctrl+Y`)**:
    * 40-step history stack (`certHistoryStack`) tracking all text edits, nudge repositionings, palette tweaks, and version changes.
    * Dedicated **Undo** (<i class="fa-solid fa-rotate-left"></i>) and **Redo** (<i class="fa-solid fa-rotate-right"></i>) toolbar buttons with live enabled/disabled visual states.
    * Keyboard shortcuts: <kbd>Ctrl</kbd> + <kbd>Z</kbd> for undo and <kbd>Ctrl</kbd> + <kbd>Y</kbd> (or <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd>) for redo.
  * **Live Drag & Precision Repositioning**:
    * Click & drag any element directly on the canvas to freely reposition it.
    * Precision Nudge D-Pad controls (Up, Down, Left, Right) with numeric X/Y pixel offsets.
  * **Digital Signature Width & Height Sizing Engine**:
    * **Independent Dimensions**: Complete dual-axis control with dedicated **Width** (`40px`–`320px`) and **Height** (`20px`–`140px`) sliders.
    * **Top Toolbar Controls**: Quick-adjust **W** and **H** sliders directly above the preview canvas in the Tier 4 toolbar.
    * **Per-Signatory Sliders**: Individual Width & Height cards for **Signatory 1**, **Signatory 2**, and **Signatory 3**.
    * **Signature Fit Mode Toggle**:
      * **Free Stretch (`Fill`)** *(Default)*: Stretches the handwritten signature graphic directly to the exact width and height pixel boundaries to span neatly across the signature line.
      * **Proportional (`Contain`)**: Constrains scaling to the image's natural aspect ratio.
    * **Unconstrained CSS Styling**: Uses `max-width: none !important; max-height: none !important;` to bypass Tailwind preflight capping and ensure exact rendered dimensions.
  * **Image & Logo Attachments**:
    * Upload/replace custom logos for **Left Seal** (City Hall), **Right Emblem** (MOVE Baguio), and **Event Logo** (*Men in the Kitchen 2*) with live size sliders.
    * **Center Background Watermark**: Opacity slider, scale slider, and **Layering Selector** (**Behind Text** `z-0` vs **In Front of Text** `z-20`).
    * Upload **Digital Signature PNGs** for Signatory 1 (President), Signatory 2 (Mayor), and Signatory 3 (Vice Mayor).
    * Official embossed **Gold Seal / Ribbon Stamp** with bottom-center, bottom-left, or bottom-right placement.
  * **Custom Framing, Presets & Theming**:
    * Master border styling (Double, Solid, Ridge, Groove) and color pickers.
    * **Whole-Certificate Preset Borders**: One-click border overlays around the entire certificate perimeter.
    * Background tones (Clean White, Royal Ivory, Baguio Pine Tint, Pearl Grey, Amber Parchment).
    * Corner emblems (Medallion Rosette, Star, Clean).
  * **Template Version Management**:
    * **Save Version**: Save modifications directly to the current working template.
    * **Save As New Version**: Name and save independent custom presets (*e.g., "Anti-VAWC Seminar 2026", "Men in the Kitchen 2", "Leadership Summit v2"*).
    * Persistent browser storage via `localStorage` (`move_cert_templates_v5`).
  * **Batch & Single High-Resolution Printing**:
    * 1-click **"Print Single"** and **"Batch Print All Present"** applying custom templates across standardized A4 landscape pages (`page-break-after: always`).

### 7. ⚙️ 50-Participant Balancing & Roster Engine
* Multi-parameter algorithmic filter tool:
  * Age range filter (default: 30–40).
  * Training count ceiling (default: < 25 previous seminars).
  * Department cap constraint (default: max 4 per office).
  * Casual / Temporary personnel inclusion toggle.
  * Alphabetical sorting (A → Z, Z → A).
  * Direct enrollment action: **"Bulk Enroll Roster into Activity"**.

### 8. ⚡ Local Database Synchronization (`sync_server.py`)
* Lightweight Python HTTP sync server running on port `8765`.
* Reads and writes directly to `ALL MALES MARIED WITH TRAINING.xls` without modifying source employee sheets.
* Endpoint: `POST /api/save-sheet` with payload validation and automatic XML SpreadsheetML generation.

---

## 📁 Repository Structure

```text
├── index.html                                 # Clean Main Application HTML5 Layout & Views
├── css/
│   └── styles.css                             # Centralized Styles, Typography, Print & Certificate Canvas Rules
├── js/
│   ├── data.js                                # Master SpreadsheetML Initial Data (Officers, Committees, Roster, Sheets)
│   ├── app.js                                 # Application State, Auth, Dashboard, Org Hierarchy, Roster Balancing & Activities
│   └── certificates.js                        # Dedicated Certificate Studio Engine, WYSIWYG Editor, Signatures & Batch Print
├── sync_server.py                             # Local Python Database Sync Engine (Port 8765)
├── Start_HRIS_System.bat                      # 1-Click Launcher (Starts Server & Launches Web App)
├── ALL MALES MARIED WITH TRAINING.xls         # Master 7-Sheet Excel Database
│   ├── Sheet                                  # 506 Permanent Employees Directory
│   ├── Casual                                 # 275 Casual & Temporary Employees Directory
│   ├── Officer                                # 17 Chapter Executive Officers (2025 & 2026 Terms)
│   ├── Committees                             # 15 Standing Committee Leaders
│   ├── Selected_Participants                  # 51 Verified 50-Participant Balanced Training Roster
│   ├── Office_Summary                         # 19 Department Allocation Summary
│   └── Members                                # 51 Official MOVE Chapter Membership Registry
├── CASUAL, TEM.xls                            # Source Casual & Temporary Employees Dataset
├── MEMO TO MOVE (Men In The Kitchen) 2026.docx # Official Administrative Memorandum Document
├── MOVE BAGUIO LOGO.png                       # Official Chapter Emblem
├── CITY HALL LOGO.png                         # Official Baguio City Hall Seal
├── MEN IN THE KITCHEN 2 LOGO.png              # Official Advocacy & Culinary Event Emblem
├── signature (15).png                         # High-Resolution Official E-Signature PNG
└── README.md                                  # Comprehensive System Documentation
```

---

## 💻 Quick Start Guide

1. **Launch the System**:
   * Double-click **`Start_HRIS_System.bat`**. This launches the background sync server on port `8765` and opens `index.html` in your default web browser.
2. **Manual Startup**:
   ```bash
   python sync_server.py
   ```
   Then open `index.html` in Google Chrome, Microsoft Edge, or Mozilla Firefox.
3. **Sign In**:
   * Click **Admin** (`admin` / `move2026`), **Officer** (`officer.ramos` / `move2026`), or **Guest** (`guest.viewer` / `guest123`) to explore the system.
