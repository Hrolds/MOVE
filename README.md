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
* Create new capacity-building events and seminars.
* Simple text field for target participants (e.g. *"50 target participants from various municipal departments"*).
* Tracks duration, venue, and resource speaker designations.

### 3. 📝 Live Attendance Checklist & Certificate Gating
* Live summary metric cards: **Total Enrolled**, **🟢 Present (Certified)**, and **🔴 Absent**.
* Click `PRESENT` or `ABSENT` to update attendance in real time.
* **Strict Gating Mechanism**: Only participants marked as `Present` appear in the Certificate Studio. Absent attendees are strictly locked out from certificate issuance.
* **Bulk Enrollment**: 1-click button to enroll all MOVE participants into the selected activity.
* **Batch Attendance**: 1-click button to mark all enrolled attendees as present.

### 4. 🎓 ONE Unified Certificate Studio
Replaced 3 separate studios with a single, elegant studio featuring a **Template Switcher**:
1. **Certificate of Participation**: A4 Landscape with Baguio Gold double frame, chapter seal, City Hall seal, and dual executive signatures.
2. **Certificate of Appearance (CA / DTR Slip)**: Official attendance slip certifying presence for Civil Service DTR non-entry accreditation.
3. **Certificate of Appreciation**: Prestigious honors certificate for VIPs, guest speakers, trainers, and partner agencies.

#### In-Studio Attendance Management:
* **Interactive Attendance Badge**: Click the `Verified Present` badge on the recipient card to instantly toggle that person to `Absent` directly from the studio.
* **Direct Navigation Ribbon**: `[ 📋 Change Attendance ]` button lets you switch back to the attendance checklist at any moment.
* **Sidebar Attendance Card**: Displays real-time eligible attendee counts with a quick return shortcut.

#### Printing & Customization:
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
| `GET` | `/api/activities/{id}/attendees` | Get attendee list and attendance status for an activity |
| `POST` | `/api/activities/{id}/attendees` | Enroll a single attendee into an activity |
| `PUT` | `/api/activities/{id}/attendees/{att_id}/present` | Toggle attendance (`is_present`: `0`\|`1`) |
| `PUT` | `/api/activities/{id}/batch-attendance` | Batch update attendance (`set_present`: `true`\|`false`) |
| `POST` | `/api/activities/{id}/bulk-enroll-move` | Bulk-enroll all MOVE roster participants |
| `DELETE` | `/api/activities/{id}/attendees/{att_id}` | Remove an attendee from an activity |
| `GET` | `/api/activities/{id}/eligible-certificates` | Gated list of attendees where `is_present = 1` |
| `GET` | `/api/signatories` | Get list of available executive signatories |

---

## 📁 Repository Structure

```text
├── backend/
│   ├── database.py         # SQLite connection & schema models
│   ├── import_excel.py     # Data migration script
│   └── server.py           # Clean REST API server (Port 8765)
├── data/
│   └── move_hris.db        # SQLite database file
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

## 💻 Quick Start Guide

1. Double-click **`Start_HRIS.bat`** in the project folder.
2. The REST API server will launch in the background on port `8765`.
3. Your default browser will automatically open **`http://127.0.0.1:8765`**.
4. To stop the server when done, close the command prompt window.
