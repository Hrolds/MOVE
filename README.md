# Men Opposed to Violence Against Women Everywhere (MOVE)
## City Government of Baguio Chapter &bull; HRIS Management Information System

A full-featured, enterprise web application and local multi-sheet Excel database synchronization system designed for the **Men Opposed to Violence Against Women Everywhere (MOVE)** advocacy group (City Government of Baguio Chapter).

---

## 🏛️ Master Excel Database Architecture (`ALL MALES MARIED WITH TRAINING.xls`)

The primary backend data store is a multi-sheet Microsoft Excel SpreadsheetML database containing **9 dedicated worksheets**:

| Worksheet | Record Count | Description & Scope |
| :--- | :---: | :--- |
| **`PRIMARY_DB`** | **747** | **Unified Master Personnel Database** combining Permanent and Casual municipal personnel into a unified 22-column schema. Powers live attendee search, filtering, and enrollment. |
| **`Officer`** | **17** | Executive leadership directories covering the **2026 Administration** (*President: Dan Ricky M. Ong*) and the **2025 Administration** (*President: Harold P. Mallorca*), under Chapter Advisers Hon. Benjamin B. Magalong and Hon. Faustino A. Olowan. |
| **`Committees`** | **15** | Roster of Standing Committee Chairs and Members (Advocacy & Education, Membership & Welfare, Operations & Logistics, Ways & Means, Monitoring & Evaluation). |
| **`Members`** | **51** | **Official MOVE Chapter Membership Registry** comprising the 32 Google Form intake survey respondents and 18 Executive Officers / Committee leaders, structured across 16 standardized columns. |
| **`Office_Summary`** | **19** | Analytical breakdown of quota distribution and participant density across municipal offices. |
| **`Selected_Participants`** | **51** | Official **50-Participant Balanced Cohort** selected across 23 municipal departments for the MOVE Anti-VAWC Capacity Building Seminar (*e.g., Michael Diazen, Donald Panelo, Daniel Lyone Soriano, etc.*). |
| **`Cert_Participation`** | **51** | **Dedicated Certificate of Participation Worksheet**: Full issuance registry with serial numbers, activity title, theme, date, venue, hours, participant names, and dual executive signatories. |
| **`Cert_Attendance_CA`** | **51** | **Dedicated Certificate of Appearance / Attendance Worksheet**: Official DTR accreditation slips with serial numbers, employee designations, purpose clause, and LGU accrediting signatories. |
| **`Cert_Appreciation`** | **6** | **Dedicated Certificate of Appreciation Worksheet**: Prestigious awards for guest speakers, trainers, facilitators, and VIPs with award titles, citation texts, dates, venues, and triple signatories. |

---

## 🔍 Understanding the Datasets: Participants vs. Members vs. PRIMARY_DB

To ensure clarity across both administrative reporting and training execution, the system distinguishes between three functional datasets:

```
                      ┌────────────────────────────────────────────────────────┐
                      │    PRIMARY_DB: Master Personnel Pool (747 Employees)   │
                      │     [Permanent: 505 Rows]  +  [Casual: 274 Rows]       │
                      │      Unified 22-Column Schema with Live Enrollment     │
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
        │ • Synced to Cert Worksheets  │                │ • 16-Column Intake Schema        │
        └──────────────────────────────┘                └──────────────────────────────────┘
```

1. **PRIMARY_DB (`747` total)**: The master municipal workforce database combining Permanent and Casual employees, used by the **50-Participant Filter Tool**, live attendance search, and the **Add Attendee from PRIMARY_DB** enrollment engine.
2. **Selected Participants (`50` trainees)**: The balanced cohort designated for official MOVE orientation and gender-sensitivity workshops. Attendance is monitored in real-time in the Activities module and synced directly into `Cert_Participation` and `Cert_Attendance_CA`.
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
  * **Option Textbox with History for Activity Type**: Autocomplete textbox backed by HTML5 `<datalist>` and persistent history (`localStorage: move_activity_types_history`). Newly added activity types are automatically memorized.
  * **Short Description / Theme**: Dedicated theme field (e.g., *"Love Served in the Kitchen"* for *"MEN IN THE KITCHEN 2"*) displayed across modals, certificates, and official documents.
  * **Double-Click & Action Button Edit**: Double-clicking any activity row or clicking the dedicated **Edit** button immediately opens the **Edit Activity / Training Details Modal** (`#modalEditActivity`).
* **Trainer / Resource Speaker Engine**:
  * **Trainer Official Position**: Add and save the trainer's designation (*e.g., Legal Consultant, Master Trainer, CSWDO Focal Person*).
  * **Title / Honorific Selector**: Choose from standard titles (`None`, `Mr.`, `Ms.`, `Atty.`, `Dr.`, `Engr.`, `Hon.`) or select **Custom...** for bespoke prefixes.
  * **Name Ordering Formats**: Instantly toggle between **First Name First** (*e.g., Mr. Juan Dela Cruz*) and **Family Name First** (*e.g., Mr. DELA CRUZ, JUAN*).
  * **Live Formatted Preview**: Displays real-time preview badge of the speaker's formatted signature name and title.
* **Drill-Down Participant Attendance & Attendee Management Modal**:
  * **Live Real-Time Search**: Search input (`#inputAttendanceSearch`) to instantly filter attendees by name, office, or position.
  * **Per-Attendee In-Place Editor (`#modalEditAttendee`)**: Click **"Edit"** on any attendee row to update:
    * Full Name, Department / Office, and Position Title
    * Age, Gender, and Civil Status
    * Mobile Contact Number
    * Present vs Absent toggle
    * **"Remove from Training"** option with safety confirmation.
  * **Add Attendees Directly from `PRIMARY_DB` (`#modalAddFromPrimaryDb`)**:
    * Search and browse all 747 municipal personnel (Permanent and Casual).
    * Filter by office or appointment category.
    * 1-Click **"+ Add"** button to immediately enroll any employee into the training roster.
  * **1-Click Sync to Excel**: Save live attendance directly into the `Cert_Participation` sheet of `ALL MALES MARIED WITH TRAINING.xls`.
  * **Certificate Generation Shortcut**: Direct action to launch **"🎓 Generate Certificates for Present Attendees"**.

### 6. 🎓 Official Certificate Studio & Interactive Designer
* Dynamic, automated certificate generation & live WYSIWYG design studio:
  * **Attendance-Gated Issuance**: Automatically validates and issues certificates **only** to participants confirmed as `Present`.
  * **1-Click Excel Sync**: Dedicated **"Sync to Excel"** button on the studio toolbar that syncs certified participants directly into the `Cert_Participation` sheet of `ALL MALES MARIED WITH TRAINING.xls`.
  * **Signatories Database & Registry Integration**:
    * Unified modal and storage (`localStorage: move_signatories_db_v1`) to register and manage custom signatories (VIP guest speakers, department heads, partner agencies, judges).
    * Integrated with official leaders (Hon. Benjamin B. Magalong, Hon. Faustino A. Olowan, Dan Ricky M. Ong, etc.) organized in structured `<optgroup>` dropdowns.
    * 1-Click **"Save to DB"** shortcut on every signatory slot to easily save newly typed signatories for future certificates.
  * **Side-by-Side Responsive Studio Workspace**:
    * Clean two-column layout (`flex-col md:flex-row items-start w-full`):
      * **Left Column**: Sticky, scrollable **Designer Toolbox** housing tabbed toolsets (*Move*, *Images*, *Text*, *Signatures*, *Border*).
      * **Right Column**: Live **Certificate Stage Canvas**, rendering the full A4 landscape certificate (`aspect-[1.414/1]`) side-by-side with zero overlap and zero blank margins.
    * When Designer Mode is toggled off, the canvas smoothly centers across the full workspace stage.
  * **In-Place Canvas Click-to-Edit (WYSIWYG)**:
    * Click directly on any text element on the certificate canvas to focus and type in place.
  * **Comprehensive Undo & Redo History Engine (`Ctrl+Z` / `Ctrl+Y`)**:
    * 40-step history stack (`certHistoryStack`) tracking all text edits, nudge repositionings, palette tweaks, and version changes.
  * **Live Drag & Precision Repositioning**:
    * Click & drag any element directly on the canvas to freely reposition it.
  * **Digital Signature Width & Height Sizing Engine**:
    * Complete dual-axis control with dedicated **Width** (`40px`–`320px`) and **Height** (`20px`–`140px`) sliders.
  * **Batch & Single High-Resolution Printing**:
    * 1-click **"Print Single"** and **"Batch Print All Present"** applying custom templates across standardized A4 landscape pages (`page-break-after: always`).

### 7. 📜 Certificate of Appearance (CA) Studio & DTR Accreditation Engine
* Modeled directly after the City Government of Baguio official template **`CA MOVE TEMPLATE.docx`**:
  * **Dual Presentation Modes**:
    * **Consolidated Official Roster Table Mode**: Official A4 portrait sheet certifying attendance with dynamic participants table (`No.`, `Full Name`, `Position Title`, `Office`, `Role`).
    * **Individual Employee Certification Mode**: Single-employee A4 portrait certificate with navigation between participants and **Batch Print All** capability.
  * **1-Click Excel Sync**: Dedicated **"Sync CA to Excel"** action that updates the `Cert_Attendance_CA` sheet in `ALL MALES MARIED WITH TRAINING.xls`.
  * **Live Customizer Sidebar**:
    * Activity Title, Theme / Short Description (*"Love Served in the Kitchen"*), Date, Venue, Purpose clause, and Issuance line.
    * Official Signatory (*Hon. Benjamin B. Magalong, City Mayor & LCAT-VAWC Chairperson*).
    * Digital signature toggle with width slider.
    * Municipal and Chapter Seals toggle (*City Hall Seal* & *MOVE Baguio Seal*).
    * Control initials at bottom-left (`/drmo/ctb`).
    * Live Attendees Filter & Checklist (*Search, Present-only filter, Select/Clear All*).
  * **High-Fidelity A4 Portrait Stage**:
    * Scaled live document canvas with zoom presets (75%, 100%, 120%).
  * **A4 Portrait Printing Engine**:
    * Dedicated `@media print` rules (`body.printing-ca`) rendering exact 210mm x 297mm pages with clean page breaks.
  * **Direct Word Export (.docx)**:
    * Backend endpoint `POST /api/export-ca-docx` in `sync_server.py` that parses `CA MOVE TEMPLATE.docx`, populates dynamic XML text and formatted Word tables, and streams the `.docx` download.
    * Pure client-side HTML-Word document download fallback if running serverless.

### 8. 🏅 Dedicated Certificate of Appreciation Studio (Honors & VIP Awards)
* Independent navigation panel dedicated to executive commendations, guest speakers, facilitators, donors, and leadership awards:
  * **1-Click Excel Sync**: Direct **"Sync to Excel"** button on the appreciation ribbon that updates the `Cert_Appreciation` worksheet with full recipient citations, positions, dates, and signatories.
  * **Document Versions & Presets Manager (Word Docs Style)**:
    * **Resource Speaker / Keynote Lecturer Preset**: Specialized citation praising invaluable time, exemplary expertise, and profound insights.
    * **Event Facilitator & Moderator Preset**: Citation honoring outstanding workshop moderation, energetic facilitation, and service.
    * **Partner Agency & Stakeholder Preset**: Citation recognizing institutional collaboration, resources, and enduring advocacy partnership.
    * **Outstanding MOVE Officer Award Preset**: Commendation celebrating exemplary leadership, selfless devotion, and executive service.
    * **Generous Donor & Program Sponsor Preset**: Recognition of sponsorship and program patronage.
    * **Named Version Snapshots**: Save, name, load, and manage custom snapshot versions (`localStorage: move_appreciation_versions_v1`).
  * **Dynamic Recipient & Citation Editor**:
    * Honorific, Full Name (with 1-click UPPERCASE formatting), Position, and Agency/Office fields.
    * Live placeholder tags support: `{name}`, `{position}`, `{office}`, `{activity}`, `{date}`, `{venue}`.
  * **Unified Signatory Database Integration**:
    * Single Centered VIP, Dual Left/Right, or Triple Signatory layouts.
    * Quick-pick dropdowns connected to the shared Signatories Database with instant photo signature rendering.
  * **A4 Landscape Live Canvas & Direct Inline Editing**:
    * Elegant double gold & midnight navy framing with corner baroque flourishes and official gold medallion ribbon.
    * Real-time click-and-type editing directly on the certificate canvas.
  * **Export to Word (.docx) & High-Resolution Print**:
    * Native Microsoft Word document download with landscape orientation and styled tables.
    * Print / PDF export with isolated `@media print` CSS (`body.printing-appreciation`).

### 9. ⚙️ 50-Participant Balancing & Roster Engine
* Multi-parameter algorithmic filter tool:
  * Age range filter (default: 30–40).
  * Training count ceiling (default: < 25 previous seminars).
  * Department cap constraint (default: max 4 per office).
  * Casual / Temporary personnel inclusion toggle.
  * Alphabetical sorting (A → Z, Z → A).
  * Direct enrollment action: **"Bulk Enroll Roster into Activity"**.

### 10. ⚡ Local Database Synchronization (`sync_server.py`)
* Lightweight Python HTTP sync server running on port `8765`.
* Reads and writes directly to `ALL MALES MARIED WITH TRAINING.xls` without modifying source employee sheets.
* Validated with Python's `xml.etree.ElementTree` parser for XML conformance.
* Endpoints:
  * `GET /api/status`: Real-time health check and database worksheets inspector.
  * `POST /api/save-sheet`: Saves participant cohorts, office distribution summaries, and certificate sheets (`PRIMARY_DB`, `Cert_Participation`, `Cert_Attendance_CA`, `Cert_Appreciation`).
  * `POST /api/export-ca-docx`: Generates and exports official customized Word documents from `CA MOVE TEMPLATE.docx`.

---

## 📁 Repository Structure

```text
├── index.html                                 # Main Application HTML5 Layout, Modals & Navigation
├── css/
│   └── styles.css                             # Centralized Styles, A4 Portrait/Landscape Print & Canvas Rules
├── js/
│   ├── data.js                                # Master SpreadsheetML Initial Data (Officers, Committees, Roster, Sheets)
│   ├── app.js                                 # Application State, Auth, Dashboard, Org Hierarchy, Roster Balancing & Activities
│   ├── certificates.js                        # Dedicated Certificate Studio Engine, WYSIWYG Editor, Signatures & Batch Print
│   ├── appreciation.js                        # Certificate of Appreciation Studio Engine, Presets & Docx Exporter
│   └── appearance.js                          # Certificate of Appearance Engine, A4 Portrait Preview & DOCX Exporter
├── sync_server.py                             # Local Python Database Sync & CA DOCX Export Engine (Port 8765)
├── restore_and_build.py                       # Automated Excel Master Database Assembler & XML Conformance Verifier
├── Start_HRIS_System.bat                      # 1-Click Launcher (Starts Server & Launches Web App)
├── CA MOVE TEMPLATE.docx                      # Official Certificate of Appearance Master Word Template
├── ALL MALES MARIED WITH TRAINING.xls         # Master 9-Sheet Excel Database
│   ├── PRIMARY_DB                             # 747 Unified Permanent & Casual Personnel Master Roster
│   ├── Officer                                # 17 Chapter Executive Officers (2025 & 2026 Terms)
│   ├── Committees                             # 15 Standing Committee Leaders
│   ├── Members                                # 51 Official MOVE Chapter Membership Registry
│   ├── Office_Summary                         # 19 Department Allocation Summary
│   ├── Selected_Participants                  # 51 Verified 50-Participant Balanced Training Roster
│   ├── Cert_Participation                     # Verified Certificate of Participation Roster & Serial Numbers
│   ├── Cert_Attendance_CA                     # Official DTR Appearance Accreditation Slips Roster
│   └── Cert_Appreciation                      # Prestigious Appreciation & Honor Awards Register
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
