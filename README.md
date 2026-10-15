# Men Opposed to Violence Against Women Everywhere (MOVE)
## City Government of Baguio Chapter &bull; HRIS Management Information System

A modern, full-featured web application and local **SQLite database** system designed for the **Men Opposed to Violence Against Women Everywhere (MOVE)** advocacy group (City Government of Baguio Chapter).

---

## 🏛️ System Architecture

The system is built on a clean, decoupled architecture:

```
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
│       - is_member     (Official Cadre)                 │
│       - is_officer    (Executive Board)                │
│       - is_committee  (Standing Committees)            │
│       - is_participant(Designated Training Trainees)   │
└──────────────────────────┬─────────────────────────────┘
                           │ Enrolls into Activity
                           ▼
┌────────────────────────────────────────────────────────┐
│          Activities & Live Attendance Checklist        │
│          • Event details & simple target notes         │
│          • Live check-in toggle: PRESENT vs ABSENT     │
└──────────────────────────┬─────────────────────────────┘
                           │ Gating Rule: is_present = 1
                           ▼
┌────────────────────────────────────────────────────────┐
│          ONE Unified Certificate Studio                │
│          • 1. Certificate of Participation (A4)        │
│          • 2. Certificate of Appearance (CA / DTR)     │
│          • 3. Certificate of Appreciation (VIP Honors) │
│          • Single & Batch Print with Clean Page Breaks │
└────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Architecture (`data/move_hris.db`)

The primary data store is a lightweight, zero-configuration **SQLite database**:

| Table | Description |
| :--- | :--- |
| **`move_roster`** | **Official MOVE Chapter Directory**: Contains members, officers, and committee heads with interactive toggle flags (`is_member`, `is_officer`, `is_committee`, `is_participant`). |
| **`municipal_employees_search_pool`** | **Municipal Workforce Search Pool**: 748 Permanent and Casual employees stored in an isolated table. Ready to be queried or replaced by your external HRIS API. |
| **`activities`** | **Training Seminars & Events**: Activity title, theme, date, venue, trainer, and target participants notes. |
| **`activity_attendees`** | **Attendance Roster**: Links attendees to an activity with the `is_present` gate (0 = Absent, 1 = Present). |
| **`signatories`** | **Executive Signatories**: Official leadership and custom signatories with e-signatures (`signature (15).png`, `GANGA.png`). |
| **`issued_certificates`** | **Registry of Issued Certificates**: Serial numbers, issuance timestamps, and certificate types. |

---

## 🚀 Key Modules & Features

### 1. 👥 Dedicated MOVE Roster & Selective Status Flags
* Direct visual table with interactive status pill buttons:
  * `[✓ Member]` (Emerald)
  * `[★ Officer]` (Amber)
  * `[◈ Committee]` (Purple)
  * `[● Participant]` (Cyan)
* Click any badge to toggle that person's status in real time.
* Quick Add Member modal for manual entry.
* Quick Search Pool modal to search all 748 municipal employees and copy them into MOVE with 1 click.

### 2. 📅 Activities & Simple Target Notes
* Create new capacity-building events and seminars.
* Simple text field for target participants (no complex quota formulas).
* Tracks duration, venue, and resource speaker designations.

### 3. 📝 Live Attendance Checklist & Certificate Gating
* Live summary metric cards: **Total Enrolled**, **🟢 Present (Certified)**, and **🔴 Absent**.
* Click `PRESENT` or `ABSENT` to update attendance in real time.
* **Strict Gating Mechanism**: Only participants marked as `Present` appear in the Certificate Studio. Absent attendees are locked out from certificate issuance.

### 4. 🎓 ONE Unified Certificate Studio
Replaced 3 separate studios with a single, elegant studio featuring a **Template Switcher**:
1. **Certificate of Participation**: A4 Landscape with Baguio Gold double frame, chapter seal, City Hall seal, and dual executive signatures.
2. **Certificate of Appearance (CA / DTR Slip)**: Official attendance slip certifying presence for Civil Service DTR non-entry accreditation.
3. **Certificate of Appreciation**: Prestigious honors certificate for VIPs, guest speakers, trainers, and partner agencies.

* **Recipient Navigator**: `< Recipient 14 of 47 (Verified Present) >` with a searchable dropdown.
* **Inline Click-to-Edit**: Click directly on any text on the certificate stage to customize.
* **High-Resolution Printing**:
  * **Print Single**: Standardized A4 landscape printing.
  * **Batch Print All Present**: Automatically generates clean page breaks (`page-break-after: always`) to print all verified attendees in one batch.

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

1. Double-click **`Start_HRIS.bat`** (or `Start_New_HRIS.bat`).
2. The REST API server will start in the background on port `8765`, and your default browser will open **`http://127.0.0.1:8765`**.
