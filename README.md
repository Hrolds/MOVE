# Men Opposed to Violence Against Women Everywhere (MOVE)
## City Government of Baguio Chapter &bull; HRIS Management Information System

A modern, full-featured web application and local **SQLite database** system designed for the **Men Opposed to Violence Against Women Everywhere (MOVE)** advocacy group (City Government of Baguio Chapter).

---

## 🏛️ System Architecture

The system is built on a clean, decoupled architecture:

```text
┌────────────────────────────────────────────────────────┐
│     Municipal Employees Search Pool (748 Employees)    │
│            [Permanent: 505] + [Casual: 243]            │
│        (Standalone table ready for external API)       │
└──────────────────────────┬─────────────────────────────┘
                           │ 1-Click Copy to MOVE
                           ▼
┌────────────────────────────────────────────────────────┐
│     Dedicated MOVE Chapter Table (move_roster)         │
│     • Full Name, Position, Gender, Civil Status, Office │
│     • Selective Status Flags:                          │
│       - is_member      (Official Cadre)                │
│       - is_officer     (Executive Board)               │
│       - is_committee   (Standing Committees)           │
│       - is_participant (Designated Training Trainees)  │
└──────────────────────────┬─────────────────────────────┘
                           │ Enrolls into Activity
                           ▼
┌────────────────────────────────────────────────────────┐
│          Activities & Live Attendance Checklist        │
│          • Event details & simple target notes         │
│          • Attendees Tab vs. Facilitators Sub-Tab      │
│          • Live check-in toggle: PRESENT vs ABSENT     │
└──────────────────────────┬─────────────────────────────┘
                           │ Gating Rule: WHERE is_present = 1
                           ▼
┌────────────────────────────────────────────────────────┐
│          ONE Unified Certificate Studio                │
│          • 1. Certificate of Participation (A4 Full)   │
│          • 2. Certificate of Appearance (A5 Dual/Single)│
│          • 3. Certificate of Appreciation (A4 Full)    │
│          • Live Canvas Inline Editing (Click-to-Type)  │
│          • Signatory Chooser & Detail Visibility Checks│
│          • Dual Mode (2 A5 slips Top & Bottom on A4)   │
│          • Typography Scaling & E-Signature Controls   │
│          • High-Resolution Single & Batch A4/A5 Print  │
└────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Architecture (`data/move_hris.db`)

The primary data store is a lightweight, zero-configuration **SQLite database**:

| Table | Description | Key Fields |
| :--- | :--- | :--- |
| **`move_roster`** | **Official MOVE Chapter Directory**: Contains members, officers, committee heads, and participants with interactive selective status flags. | `id`, `full_name`, `position`, `gender`, `civil_status`, `office`, `contact_number`, `role_title`, `is_member`, `is_officer`, `is_committee`, `is_participant` |
| **`municipal_employees_search_pool`** | **Municipal Workforce Search Pool**: 748 Permanent and Casual employees stored in an isolated table. Ready to be queried or synchronized with an external HRIS API. | `id`, `employee_number`, `full_name`, `position`, `gender`, `civil_status`, `office`, `employment_type` |
| **`activities`** | **Training Seminars & Events**: Activity title, theme, date, duration, venue, trainer, and target participants notes. | `id`, `title`, `theme`, `activity_date`, `venue`, `duration_hours`, `trainer_name`, `trainer_position`, `target_notes` |
| **`activity_attendees`** | **Attendance Roster**: Links attendees to an activity with the strict `is_present` gate. | `id`, `activity_id`, `move_roster_id`, `full_name`, `position`, `gender`, `civil_status`, `office`, `contact_number`, `is_present`, `check_in_time`, `notes` |
| **`activity_facilitators`** | **Event Facilitators & Speakers**: Resource speakers, trainers, and committee facilitators assigned to an activity. | `id`, `activity_id`, `move_roster_id`, `full_name`, `role_title`, `position`, `gender`, `civil_status`, `office`, `contact_number`, `is_present`, `check_in_time`, `notes` |
| **`certificate_settings`** | **Global Certificate Customization**: Persistent headers, titles, presentation intro lines, and dynamic citation texts. | `id`, `header_line_1`, `header_line_2`, `header_line_3`, `participation_title`, `participation_intro`, `appreciation_title`, `appreciation_intro`, `appearance_title`, `appearance_intro`, `participation_citation`, `appearance_citation` |
| **`signatories`** | **Executive Signatories**: Official leadership and custom signatories with digital signatures (`signature (15).png`, `GANGA.png`). | `id`, `name`, `title`, `office`, `signature_image`, `is_default` |
| **`issued_certificates`** | **Registry of Issued Certificates**: Serial numbers, issuance timestamps, and certificate types. | `id`, `activity_id`, `attendee_id`, `certificate_type`, `serial_number`, `issued_at` |

---

## 🚀 Key Modules & Features

### 1. 👥 Dedicated MOVE Roster & Selective Status Flags
* Direct visual table with interactive status pill buttons:
  * `[✓ Member]` (Emerald)
  * `[★ Officer]` (Amber)
  * `[◈ Committee]` (Purple)
  * `[● Participant]` (Cyan)
* Click any badge to toggle that person's status in real time.
* **Quick Add Member**: Modal for manual entry with validation.
* **Search Pool (748)**: Search permanent and casual municipal staff and copy them into MOVE with 1 click.

### 2. 📅 Activities & Simple Target Notes
* Create and edit capacity-building events and seminars.
* **Full In-Place & Modal Editing**: Click **"Edit"** on any activity card, or click the title, venue, or trainer text to open the **Edit Activity Details Modal** (`#modalEditActivity`).
* Modify **Venue, Event Date, Activity Title, Theme / Description, Duration, Trainer Name, Trainer Position**, and **Target Notes**.
* Simple text field for target participants (e.g. *"50 target participants from various municipal departments"*).
* Delete activities with full attendee cascade removal safety.

### 3. 📝 Live Attendance Checklist & Certificate Gating
* Live summary metric cards: **Total Enrolled**, **🟢 Present (Certified)**, and **🔴 Absent**.
* **Quick Edit Activity Shortcut**: Click **"Edit Details"** on the attendance header to immediately adjust the venue, date, or event details.
* Click `PRESENT` or `ABSENT` to update attendance in real time.
* **Strict Gating Mechanism**: Only participants marked as `Present` appear in the Certificate Studio. Absent attendees are strictly locked out from certificate issuance.
* **Bulk Enrollment**: 1-click button to enroll all MOVE participants into the selected activity.
* **Batch Attendance**: 1-click button to mark all enrolled attendees as present.
* **Enroll Attendee with Live Search Box & Duplicate Detection**:
  * Type in the instant search box to filter across all MOVE chapter members (by name, office, or position) with auto-complete, 1-key `Enter` selection, and cross-lookup into the 748 Municipal Employee Pool.
  * **Intelligent Duplicate Prevention**: Live check detects if a candidate is already enrolled in the activity's attendance checklist.
  * Clearly tags enrolled members as `⚠️ [ALREADY ENROLLED]` directly within the Quick Select dropdown and search results.
  * If selected or typed into the Full Name field, displays an immediate high-visibility duplicate alert banner showing their current attendance status (`Present` / `Absent`) and automatically disables the **Enroll Attendee** button.
  * Pre-submission validation blocks duplicate entries and SQLite enforces a `UNIQUE(activity_id, UPPER(TRIM(full_name)))` constraint to guarantee zero duplicate enrollments.
* **Event Facilitators & Trainers Tab**:
  * **Dedicated Event Sub-Tabs**: Clean sub-tabs right on the activity card separating **`Attendees (Participants)`** from **`Facilitators (Trainers / Speakers)`**.
  * **`+ Add Facilitator` Button**: Positioned in the action toolbar and on the facilitators table. Opens a dedicated modal supporting quick select from MOVE roster or City Pool, custom role/designation (Resource Speaker, Master Trainer, Lead Facilitator, Moderator, etc.), position, office/agency, sex, civil status, and instant duplicate detection.
  * **Facilitators Checklist**: Dedicated table with live search, presence verification toggle (`PRESENT` / `ABSENT`), and 1-click **"Cert"** button to jump straight to the Certificate Studio to issue a Certificate of Appreciation for that facilitator.
  * **Certificate Studio Integration**: Certificate Studio allows switching between **Attendees** and **Facilitators** recipient pools with 1-click, enabling generation and batch-printing of Appreciation and Appearance certificates for facilitators.

---

### 4. 🎓 ONE Unified Certificate Studio

Replaced 3 separate studios with a single, unified studio featuring a **Template Switcher**:
1. **Certificate of Participation**: A4 Landscape with Baguio Gold double frame, chapter seal, City Hall seal, dynamic gender-aware `{his/her}` citation, and dual executive signatures.
2. **Certificate of Appearance (CA / DTR Slip)**: Official attendance slip certifying presence for Civil Service DTR non-entry accreditation. Sized as **A5 Landscape (`210mm × 148.5mm`)** with Single or Dual-slip printing on A4 paper.
3. **Certificate of Appreciation**: Prestigious honors certificate with Navy/Gold double border for VIPs, guest speakers, trainers, and partner agencies.

---

### 5. 🖨️ A5 Landscape on A4 Paper Printing (Single Mode vs. Dual Mode)

Designed specifically for the **Certificate of Appearance (CA)**:
* **A5 Landscape Dimensions**: Exact standard `210mm × 148.5mm`.
* **Standard A4 Sheet (`210mm × 297mm`)**: An A4 Portrait sheet cleanly holds two A5 Landscape slips stacked vertically Top & Bottom.
* **Interactive Mode Switcher on Stage Toolbar**:
  * **Single Mode (1 A5)**: Formats and prints 1 A5 slip centered per sheet.
  * **Dual Mode: Top & Bottom (2 on A4)**: Formats and prints 2 A5 landscape slips stacked vertically on a single A4 sheet with an optional center cut guide (`148.5mm`), cutting paper and printing costs by 50%.
* **Dual Mode Distribution Strategies**:
  * **Pair Mode (`pair`)**: Slip #1 (Top) = Recipient $N$, Slip #2 (Bottom) = Recipient $N+1$. Automatically pairs consecutive attendees during single preview and batch printing.
  * **Duplicate Mode (`duplicate`)**: Slip #1 (Top) = Recipient $N$, Slip #2 (Bottom) = Duplicate Copy of Recipient $N$. Generates two official copies of the same person on one sheet.
* **Live Dual Preview**: Stage displays both Slip #1 (`#certStageCanvas`) and Slip #2 (`#certStageCanvasBottom`) with recipient badges and a dashed cut line indicator before printing.

---

### 6. ✍️ Full Live Canvas Inline Editing (Click-to-Edit & Auto-Save)

Every critical element across all 3 certificate templates can be clicked and edited directly on the canvas without leaving the studio:
* **Headers & Subtitles**:
  * Line 1: `"Republic of the Philippines • City Government of Baguio"`
  * Line 2: `"Men Opposed to Violence Against Women Everywhere (MOVE)"`
  * Line 3: `"Baguio City, Philippines"`
* **Certificate Titles**:
  * Click to edit `"CERTIFICATE OF PARTICIPATION"`, `"CERTIFICATE OF APPEARANCE"`, or `"CERTIFICATE OF APPRECIATION"`.
* **Presentation & Intro Lines**:
  * Participation/Appreciation: `"is presented to"`
  * Appearance: `"This is to certify that"`
* **Recipient Record Fields (Certificate of Appearance)**:
  * **Full Name** (e.g. `CRISTOBAL T. BULACAN`): Click to type; automatically capitalizes and commits to SQLite.
  * **Position / Role Assignment** (e.g. `Assistant P.R.O. / Facilitator`): Click to edit position.
  * **Office / Department** (e.g. `Health Services Office (HSO)`): Click to edit office.
  * **Verification / Accreditation Statement**: Click to customize the reason phrase (e.g. `"rendered invaluable service as Resource Speaker / Facilitator in"` or `"attended and actively participated in"`).
* **Activity & Event Information**:
  * Title, Theme, Date, and Venue are all directly contenteditable on the preview canvas with immediate database synchronization.
* **Non-Destructive Auto-Save**: Changes trigger an immediate debounced save to the SQLite database on blur, displaying an inline `"✓ Saved to Database"` badge.

---

### 7. 🖋️ Executive Signatory Chooser & Detail Visibility Controls

Comprehensive signatory customization available via both the **Quick Bar** above the canvas and the **Executive Signatories** sidebar:
* **Choose Who Signs (Signatory 1 & Signatory 2)**:
  * Select from **Official Signatories** (with e-signature graphic support: Mayor Magalong, President Ganga).
  * Select any **MOVE Chapter Officer** or **MOVE Roster Member** from the directory.
  * Type custom **Printed Name**, **Position / Role Title**, and **Office / Department** with 1-click **`[ 💾 Save ]`** to SQLite.
* **Choose Which Signatory Layout Appears**:
  * **👥 Dual Signatories**: Signatory 1 (Left) & Signatory 2 (Right) side-by-side.
  * **👤 Single: Signatory 2 — Right-Aligned** (e.g. City Mayor on bottom-right).
  * **👤 Single: Signatory 2 — Centered**.
  * **👤 Single: Signatory 1 — Right-Aligned** (e.g. Chapter President on bottom-right).
  * **👤 Single: Signatory 1 — Centered**.
* **Choose What Details Appear on the Signatory Block**:
  * `[✓] Full Name`: Show or hide the printed name.
  * `[✓] Position Title`: Show or hide the role/position title.
  * `[ ] Office / Agency`: Optionally display the signatory's office underneath.
  * `[✓] Signature Line`: Show or hide the horizontal rule above the name.
  * `[✓] E-Sig Graphic`: Show or hide the electronic signature image.

---

### 8. 🎚️ Typography, E-Signature & Layout Sizing Controls

* **Body & Citation Text Size**:
  * Slider ranging from **`8px` to `26px`** with dedicated `A-` and `A+` nudge buttons.
  * 1-Click Presets: `Small (11px)`, `Normal (12px)`, `Medium (14px)`, `Large (16px)`, `XL (18px)`.
* **On-Canvas Quick Hover Toolbar**:
  * Hovering over the body block reveals:
    * **Position**: `↑` and `↓` vertical nudgers (-80px to +80px) with `✕` reset.
    * **Body Font**: `A-` and `A+` buttons with live pixel readout.
    * **Name Font**: `A-` and `A+` buttons with live pixel readout.
    * **Edit Details**: Direct shortcut button opening the full attendee/facilitator modal.
* **Stage Quick Bar Above Canvas**:
  * Instant **Body: `[A-] 12px [A+]`** and **Name: `[A-] 26px [A+]`** buttons accessible without hovering.
* **Adjustable E-Signature Sizing & Scaling**:
  * Scale e-signatures from 20px to 96px in real time (default: 44px).
  * Quick size presets: `Small (32px)`, `Medium (44px)`, `Large (56px)`, `XL (72px)`.
  * Independent height controls for Signatory 1 and Signatory 2 (*"Tune Separately"*).
  * Vertical baseline nudger (`↑` / `↓`) to fine-tune signature overlap onto lines.
* **Adjustable Watermark Position & Opacity**:
  * Shift watermark vertically (-150px to +150px) to prevent clashing with text.
  * Resize watermark dimensions from 180px to 480px.
  * Select from MOVE Chapter Seal, City Hall Seal, Men in the Kitchen 2 Logo, or Breathe Baguio Logo with 4% to 30% opacity.
* **Persistent Preferences**: All font sizes, layout offsets, and signatory preferences persist in `localStorage` across refreshes.

---

## 🔌 REST API Reference (Port 8765)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/status` | Server and SQLite database health check |
| `GET` | `/api/move-roster` | List MOVE members (`status=all\|member\|officer\|committee\|participant`, `q=search`) |
| `POST` | `/api/move-roster` | Add a new person directly into MOVE roster |
| `PUT` | `/api/move-roster/{id}/status` | Toggle status flag (`field`: `is_member`\|`is_officer`\|`is_committee`\|`is_participant`, `value`: `0`\|`1`) |
| `GET` | `/api/municipal-pool` | Search workforce pool (`q=search`, `office=office`, `limit=limit`) |
| `POST` | `/api/municipal-pool/copy-to-move` | Copy employee from search pool to `move_roster` |
| `GET` | `/api/activities` | List all activities with attendee and attendance counts |
| `POST` | `/api/activities` | Create a new activity |
| `PUT` | `/api/activities/{id}` | Update activity details (title, theme, date, duration, venue, trainer, target notes) |
| `DELETE` | `/api/activities/{id}` | Delete an activity and all its enrolled attendees |
| `GET` | `/api/activities/{id}/attendees` | Get attendee list and attendance status for an activity |
| `POST` | `/api/activities/{id}/attendees` | Enroll a single attendee into an activity |
| `PUT` | `/api/activities/{id}/attendees/{att_id}` | Update attendee details (position title, office, name, gender, civil status, contact, notes) |
| `PUT` | `/api/activities/{id}/attendees/{att_id}/present` | Toggle attendance (`is_present`: `0`\|`1`) |
| `PUT` | `/api/activities/{id}/batch-attendance` | Batch update attendance (`set_present`: `true`\|`false`) |
| `DELETE` | `/api/activities/{id}/attendees/{att_id}` | Remove an attendee from an activity |
| `GET` | `/api/activities/{id}/facilitators` | List event facilitators & resource speakers |
| `POST` | `/api/activities/{id}/facilitators` | Assign facilitator with duplicate prevention |
| `PUT` | `/api/activities/{id}/facilitators/{fac_id}` | Update facilitator details (position, role title, office, name, gender, civil status, contact, notes) |
| `PUT` | `/api/activities/{id}/facilitators/{fac_id}/present` | Verify facilitator attendance (`is_present`: `0`\|`1`) |
| `DELETE` | `/api/activities/{id}/facilitators/{fac_id}` | Remove a facilitator from an activity |
| `GET` | `/api/activities/{id}/eligible-certificates` | Gated list of eligible attendees and facilitators (`is_present = 1`) |
| `GET` | `/api/certificate-settings` | Get persistent certificate headers, titles, intros, and citation clauses |
| `PUT` | `/api/certificate-settings` | Update certificate headers, titles, intros, and citations in SQLite |
| `POST` | `/api/certificate-settings/reset` | Reset certificate headers, titles, intros, and citations to official defaults |
| `GET` | `/api/signatories` | Get list of available executive signatories |
| `PUT` | `/api/signatories/{id}` | Update signatory position title, name, or office in SQLite |

---

### 🎓 Role-Based Certificate Matrix

| Recipient Role | Eligible Certificates | Ineligible Certificates | Gating Condition |
| :--- | :--- | :--- | :--- |
| **Attendees (Participants)** | • **Certificate of Participation** (A4 Landscape)<br>• **Certificate of Appearance (CA)** (A5 Dual/Single) | • Certificate of Appreciation *(Hidden)* | Strictly gated: `is_present = 1` in Attendance Checklist |
| **Facilitators (Speakers / Trainers)** | • **Certificate of Appreciation** (A4 VIP Honors)<br>• **Certificate of Appearance (CA)** (A5 Dual/Single) | • Certificate of Participation *(Hidden)* | Strictly gated: `is_present = 1` in Facilitator Checklist |

---

## 📁 Repository Structure

```text
├── backend/
│   ├── database.py         # SQLite connection & schema models
│   ├── import_excel.py     # Data migration script
│   └── server.py           # Clean REST API server (Port 8765)
├── data/
│   ├── move_hris.db        # Primary SQLite database (Attendees, Facilitators, Settings)
│   └── move_hris_dump.sql  # Complete SQL text dump for cross-machine database sync
├── frontend/
│   ├── index.html          # Clean Single-Page Application (Studio & HRIS)
│   ├── css/styles.css      # Modern stylesheet & high-resolution A4/A5 print rules
│   └── js/app.js           # Frontend state controller, studio engine & API client
├── index.html              # Root auto-redirect to local server
├── CITY HALL LOGO.png      # Official City of Baguio Seal
├── MOVE BAGUIO LOGO.png    # Official Chapter Emblem
├── GANGA.png               # President E-Signature
├── signature (15).png      # Mayor E-Signature
├── CA MOVE TEMPLATE.docx   # Official Certificate of Appearance Word Template
├── Start_HRIS.bat          # 1-Click System Launcher
└── README.md               # System Documentation
```

---

## 💻 Quick Start & Cross-Machine Sync Guide

### On This Machine:
1. Double-click **`Start_HRIS.bat`** to start the backend server and open the browser interface.
2. Both `data/move_hris.db` and `data/move_hris_dump.sql` contain the complete official records:
   - **50 Attendees** for *Men in the Kitchen 2* (with positions, offices, contact numbers, and verified attendance).
   - **13 Facilitators** (12 committee facilitators + Chef Ramon Dela Rosa).
   - Saved custom certificate headers, titles, appearance citations, and signatory configurations.

### On Another Computer (After You Pull):
1. Open your terminal in the cloned repository and run:
   ```bash
   git pull origin main
   ```
2. Git pulls the updated `data/move_hris.db`, `data/move_hris_dump.sql`, frontend, and backend files.
3. Double-click **`Start_HRIS.bat`** to start the application.
4. Your browser will automatically open `http://127.0.0.1:8765` with all records, certificate templates, and controls immediately accessible.

*(Optional Fallback)*: If SQLite on another computer requires a fresh rebuild from text SQL, simply run:
```bash
sqlite3 data/move_hris.db < data/move_hris_dump.sql
```
This guarantees 100% data portability across any operating system or device.
