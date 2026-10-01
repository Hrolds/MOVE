# HRIS Employee Filter & 50-Participant Selection System

An interactive, real-time web application and local database synchronization system for filtering, selecting, and organizing employee participants across 17+ municipal departments.

## 🚀 Key Features

* **Interactive Real-Time Web Tool (`index.html`)**:
  * Live dynamic filtering by **Age** (e.g. 30–40), **Max Trainings** (< 25), and **Office Quota Cap**.
  * Instant 0ms recalculations and live metrics updating across all tabs.
  * **Alphabetical Auto-Arrange**: Double-click department headers or badges to sort offices A → Z, Z → A, or by staff count.
  * **3-Way Office Badge Selector**: Switch badge counts between `Final Roster (50)`, `Both (4/7)`, and `Candidate Pool (51)`.
  * **Participant Management**:
    * Checkbox selection column in both *Check & Add Participants* and *Filtered Candidates Pool*.
    * One-click bulk addition (`Add Checked to Participants`).
    * Custom participant entry modal with autocomplete.
  * **Direct Database Sync**: 1-click **"💾 Save Changes to Excel File"** writes directly into the master spreadsheet on disk.
  * **Multi-Sheet Export**: Client-side export generating `.xlsx` workbooks with 4 sheets (Participants Roster, Office Summary, Manual Additions, Master Employee Directory).

* **Local Python Sync Server (`sync_server.py`)**:
  * Lightweight background HTTP server running on port `8765`.
  * Connects the browser directly to `ALL MALES MARIED WITH TRAINING.xls` without modifying the original source sheets.
  * Real-time backup creation before every write operation.

* **Complete Employee Master Database (`ALL MALES MARIED WITH TRAINING.xls`)**:
  * **`Sheet`**: Original Permanent Employees Directory (474 records).
  * **`Casual`**: Casual & Temporary Employees Directory (274 records).
  * **`Selected_Participants`**: Final 50-participant roster.
  * **`Office_Summary`**: Departmental allocation breakdown.

## 📁 Repository Structure

```text
├── index.html                  # Interactive Single-Page Web Application
├── sync_server.py              # Python Local Sync Backend (Port 8765)
├── Start_HRIS_System.bat       # 1-Click System Launcher (Starts Server & Opens App)
├── ALL MALES MARIED WITH TRAINING.xls  # Master Multi-Sheet Excel Database
├── CASUAL, TEM.xls             # Source Casual & Temporary Employees Dataset
└── README.md                   # Documentation
```

## 💻 Quick Start

1. Double-click **`Start_HRIS_System.bat`** to start the sync server and launch the web app in your default browser.
2. Alternatively, start manually:
   ```bash
   python sync_server.py
   ```
   and open `index.html` in your web browser.
