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
│          • Live check-in toggle: PRESENT vs ABSENT     │
└──────────────────────────┬─────────────────────────────┘
                           │ Gating Rule: WHERE is_present = 1
                           ▼
┌────────────────────────────────────────────────────────┐
│          ONE Unified Certificate Studio                │
│          • 1. Certificate of Participation (A4)        │
│          • 2. Certificate of Appearance (CA / DTR)     │
│          • 3. Certificate of Appreciation (VIP Honors) │
│          • In-Studio Attendance Toggling & Shortcuts   │
│          • Single & Batch Print with Clean Page Breaks │
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

### 4. 🎓 ONE Unified Certificate Studio
Replaced 3 separate studios with a single, elegant studio featuring a **Template Switcher**:
1. **Certificate of Participation**: A4 Landscape with Baguio Gold double frame, chapter seal, City Hall seal, and dual executive signatures.
2. **Certificate of Appearance (CA / DTR Slip)**: Official attendance slip certifying presence for Civil Service DTR non-entry accreditation.
3. **Certificate of Appreciation**: Prestigious honors certificate for VIPs, guest speakers, trainers, and partner agencies.

#### In-Studio Attendance Management:
* **Interactive Attendance Badge**: Click the `Verified Present` badge on the recipient card to instantly toggle that person to `Absent` directly from the studio.
* **Direct Navigation Ribbon**: `[ 📋 Change Attendance ]` button lets you switch back to the attendance checklist at any moment.
* **Sidebar Attendance Card**: Displays real-time eligible attendee counts with a quick return shortcut.
* **Save Event Details Directly to Database**: Edit activity title, theme, date, duration, or venue directly in the studio sidebar and save them instantly to SQLite.

#### Printing & Customization:
* **Adjustable E-Signature Sizing & Scaling**:
  * **Interactive Size Slider**: Smoothly scale e-signatures from 20px to 96px in real time (default: 44px).
  * **Quick Size Presets**: 1-click buttons for `Small (32px)`, `Medium (44px)`, `Large (56px)`, and `XL (72px)`.
  * **Independent Signatory Tuning**: Check *"Tune Separately"* to set independent heights for Signatory 1 (President Ganga) and Signatory 2 (Mayor Magalong) to visually balance different image paddings.
  * **Vertical Baseline Nudge (`↑` / `↓`)**: Fine-tune how the signatures rest or overlap onto the printed signature lines.
  * **On-Canvas Hover Resize Controls**: Hover over any signature on the certificate stage to reveal quick `[-]` and `[+]` resize buttons (automatically hidden during printing).
  * **Saved Preferences**: Size and scaling preferences automatically persist in local storage.
* **Background Watermarks (Appreciation, Appearance & Participation)**: Centered watermark overlay with customizable logo (`MOVE Chapter Seal`, `City Hall Seal`, `Men in the Kitchen 2`, `Breathe Baguio`) and real-time opacity slider (4% to 30%).
* **Flexible Appearance Certificate Signatories**: Choose which signature appears on the Certificate of Appearance — Signatory 2 (Mayor Magalong - Right/Center), Signatory 1 (President Ganga - Right/Center), or Dual Signatories (both side-by-side).
* **Digital E-Signature Visibility**: Choose whether to display all digital signatures, Mayor only, President only, or blank signature lines for physical wet-ink signing.
* **Recipient Navigator**: `< Recipient 1 of 47 (Verified Present) >` with a searchable dropdown.
* **Inline Click-to-Edit**: Click directly on any text on the certificate canvas to customize.
* **Print Single**: Standardized A4 landscape printing.
* **Batch Print All Present**: Automatically generates clean page breaks (`page-break-after: always`) to print all verified attendees in one batch.

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
| `GET` | `/api/signatories` | Get list of available executive signatories |

### 🎓 Role-Based Certificate Matrix

| Recipient Role | Eligible Certificates | Ineligible Certificates | Gating Condition |
| :--- | :--- | :--- | :--- |
| **Attendees (Participants)** | • **Certificate of Participation** (A4 Landscape)<br>• **Certificate of Appearance (CA)** (DTR / Accreditation) | • Certificate of Appreciation *(Hidden)* | Strictly gated: `is_present = 1` in Attendance Checklist |
| **Facilitators (Speakers / Trainers)** | • **Certificate of Appreciation** (Honorary / VIP)<br>• **Certificate of Appearance (CA)** (Travel / DTR) | • Certificate of Participation *(Hidden)* | Strictly gated: `is_present = 1` in Facilitator Checklist |

---

## 📁 Repository Structure

```text
├── backend/
│   ├── database.py         # SQLite connection & schema models
│   ├── import_excel.py     # Data migration script
│   └── server.py           # Clean REST API server (Port 8765)
├── data/
│   ├── move_hris.db        # Primary SQLite database (50 Attendees + 13 Facilitators)
│   └── move_hris_dump.sql  # Complete SQL text dump for cross-machine database sync
├── frontend/
│   ├── index.html          # Clean Single-Page Application
│   ├── css/styles.css      # Modern stylesheet & A4 landscape print rules
│   └── js/app.js           # Frontend state controller & API client
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

### On This Machine (Changes Already Saved):
1. Both `data/move_hris.db` and `data/move_hris_dump.sql` contain the complete official roster:
   - **50 Attendees** for *Men in the Kitchen 2* (with positions, offices, contact numbers, and verified attendance).
   - **13 Facilitators** (12 committee facilitators + Chef Ramon Dela Rosa).
   - Interactive **`[ ✏️ Edit ]`** buttons for modifying position titles and details in real time.

### On Another Computer (After You Pull):
1. Open your terminal in the cloned repository and run:
   ```bash
   git pull origin main
   ```
2. Git will pull the updated `data/move_hris.db`, `data/move_hris_dump.sql`, frontend, and backend files.
3. Double-click **`Start_HRIS.bat`** to start the application.
4. Your browser will automatically open `http://127.0.0.1:8765` with all 50 attendees, 13 facilitators, and edit controls immediately accessible.

*(Optional Fallback)*: If SQLite on another computer requires a fresh rebuild from text SQL, simply run:
```bash
sqlite3 data/move_hris.db < data/move_hris_dump.sql
```
This guarantees 100% data portability across any operating system or device.

