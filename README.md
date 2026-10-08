# Men Opposed to Violence Against Women Everywhere (MOVE)
## City Government of Baguio Chapter &bull; HRIS Management Information System

A full-featured, enterprise web application and local database synchronization system designed for the **Men Opposed to Violence Against Women Everywhere (MOVE)** advocacy group (City Government of Baguio Chapter).

---

## 🚀 Key Modules & System Features

### 1. 🔐 Authentication & Role-Based Login
* Modern, municipal-branded login portal.
* Preconfigured quick demo access:
  * **Administrator** (`admin` / `move2026`)
  * **Chapter Officer** (`officer.ramos` / `move2026`)
  * **Guest / Viewer** (`guest.viewer` / `guest123`)
* Session persistence via `localStorage` with active user badges and sign-out controls.

### 2. 📊 Executive Dashboard
* **4 Core KPI Metric Cards**:
  * Total Registered Members (`748` total &bull; `474` Permanent, `274` Casual).
  * Workplace Location Distribution: `Inside City Hall Building (382)` vs `Field / Remote Offices (366)`.
  * Total Activities Held (`3 Active Programs`).
  * Overall Training Attendance Rate (`94.0%` verified present).
* **Interactive Visual Analytics**:
  * Department Representation Bar Chart (Top municipal offices).
  * Demographic Age Brackets (`Under 30`, `30–40`, `41–50`, `51+`).
  * Workplace Location Meter (`City Hall Building` vs `Field / Compounds`).
* **Recent Activities Feed**: Quick table with direct 1-click shortcuts to take or review attendance.

### 3. 🏛️ Organizational Structure (Governance Hierarchy)
* **Honorary Advisory Board**:
  * City Mayor: `Hon. Benjamin B. Magalong` (Honorary Chairperson)
  * City Vice Mayor: `Hon. Faustino A. Olowan` (Vice Chairperson)
  * City HRMO Head: `Atty. Augustin P. Laban III` (Chief Adviser)
* **Executive Committee Officers**:
  * Chapter President: `Engr. Alberto B. Ramos` (City Engineering Office)
  * Vice President: `Arch. Danilo S. Perez` (City Buildings and Architecture Office)
  * Secretary General: `Jonathan R. Cruz` (City Mayor's Office)
  * Treasurer: `Michael T. Rivera` (City Treasury Office)
  * Auditor: `Edwin L. Fernandez` (City Accounting Office)
  * Public Relations Officer: `Mark Anthony G. Dizon` (City Tourism Office)
* **Functional Standing Committees**:
  * Committee on Advocacy & Gender Education (Chair: CEPMO)
  * Committee on Membership & Welfare (Chair: CSWDO)
  * Committee on Operations & Logistics (Chair: GSO)
* **Departmental Coordinators Directory**:
  * Dedicated focal persons across all 23 Baguio City Hall departments and attached offices with contact information and position details.
  * Searchable and printable.

### 4. 👥 List of Members (Integrated with Official Google Form Schema)
* Comprehensive registry preloaded with all 748 Baguio City employees.
* Integrated with the 27 fields from the official **MOVE Membership Intake Google Form**:
  * Full Name (Last, First, Middle)
  * Department / Division (23 Baguio City offices)
  * Position / Designation
  * Appointment (`Permanent` / `Casual`)
  * Age, Gender, and Civil Status
  * **Inside City Hall?** (`YES` / `NO` interactive badge)
  * Contact Number
  * Current Residential Address (Purok, Barangay, City, Province)
  * Preferred Mailing Address
  * History of Gender-Related Trainings Attended
* **Search & Filters**:
  * Live search by name, position, or phone number.
  * Filter by Department (dropdown of 23 offices).
  * Filter by Location (`Inside City Hall Only` vs `Field / Remote`).
  * Filter by Appointment (`Permanent Only` vs `Casual Only`).
* **Member Profile Dossier Modal**:
  * Detailed bio-data view with 1-click **"Print Member Dossier"**.
* **Exports**: 1-click export to Excel (`.xlsx`) and CSV.

### 5. 📅 Activities & Interactive Attendance Modal
* **Master Activities Table**:
  * Columns: `#`, `Date`, `Type of Activity`, `Title`, `Purpose of Training`, `Trainer / Speaker`, `Duration`, `Participants (Present / Total)`, `Action`.
* **Drill-Down Participant Attendance Modal**:
  * Opens upon clicking any activity row.
  * Live Attendance Rate Counter (`47 / 50 Present - 94.0%`).
  * Filter by attendance status (`All`, `Present Only`, `Absent Only`).
  * Batch controls: `Mark All Present`, `Reset`.
  * Participant table with interactive **`Is Present? (✓ YES / ✗ NO)`** toggles.
  * Direct action button: **"🎓 Generate Certificates for Present Attendees"**.
  * Export official attendance sheets to Excel / Print.

### 6. 🎓 Official Certificate Studio
* Dynamic, automated certificate generation engine:
  * **Attendance-Gated Issuance**: Automatically issues certificates **only** to participants verified as `Present`.
  * **3 Certificate Types**:
    1. *Certificate of Participation* (for trainees/attendees).
    2. *Certificate of Appreciation* (for resource speakers/trainers).
    3. *Certificate of Membership* (for inducted MOVE members).
  * **Design & Typography**:
    * Executive landscape A4 frame with ornate gold/emerald classical border.
    * Official Baguio City Seal and MOVE National Emblem.
    * Cinzel / Trajan serif and Playfair Display typography.
    * Official Signatories: MOVE Chapter President & City Mayor.
    * Dynamic Verification QR Code and unique serial numbering (`MOVE-2026-ACT-XXXX`).
  * **Batch Printing Engine**:
    * 1-click **"Batch Print All Present"** compiling all certificates into a single print document, 1 certificate per landscape page (`page-break-after: always`), hiding all web UI!

### 7. ⚙️ 50-Participant Balancing & Roster Engine
* Integrated participant filtering tool:
  * Age sliders (30–40)
  * Trainings slider (< 25)
  * Department quota cap (4 per office)
  * Double-click alphabetical auto-arrange (A → Z, Z → A)
  * 3-Way badge selector (`Final Roster`, `Both 4/7`, `Candidate Pool`)
  * **"Bulk Enroll Roster into Activity"** action button.

### 8. ⚡ Local Database Synchronization (`sync_server.py`)
* Background HTTP daemon on port `8765`.
* Directly writes participant rosters, summaries, and updates into `ALL MALES MARIED WITH TRAINING.xls` without modifying source employee sheets.

---

## 📁 Repository Structure

```text
├── index.html                  # Full MOVE System Single-Page Enterprise Application
├── sync_server.py              # Local Python Database Sync Engine (Port 8765)
├── Start_HRIS_System.bat       # 1-Click Launcher (Starts Server & Launches Web App)
├── ALL MALES MARIED WITH TRAINING.xls  # Master Multi-Sheet Excel Database
│   ├── Sheet                   # 474 Permanent Employees Directory
│   ├── Casual                  # 274 Casual & Temporary Employees Directory
│   ├── Selected_Participants   # Final 50-Participant Balanced Roster
│   └── Office_Summary          # Department Allocation Breakdown
├── CASUAL, TEM.xls             # Source Casual & Temporary Employees Dataset
└── README.md                   # System Documentation
```

---

## 💻 Quick Start

1. Double-click **`Start_HRIS_System.bat`** to start the sync server and launch the application in your browser.
2. Alternatively, start manually:
   ```bash
   python sync_server.py
   ```
   and open `index.html` in your web browser.
3. Sign in using the demo buttons:
   * **Administrator**: `admin` / `move2026`
   * **Officer**: `officer.ramos` / `move2026`
   * **Guest**: `guest.viewer` / `guest123`
