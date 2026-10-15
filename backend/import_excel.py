import json
import os
import sqlite3
import re
from database import get_connection, init_db

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_JS_PATH = os.path.join(BASE_DIR, "js", "data.js")

def load_initial_data():
    if not os.path.exists(DATA_JS_PATH):
        raise FileNotFoundError(f"data.js not found at {DATA_JS_PATH}")
    
    with open(DATA_JS_PATH, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip().startswith("const INITIAL_DATA ="):
                raw_json = line.strip()[len("const INITIAL_DATA ="):].rstrip(";").strip()
                return json.loads(raw_json)
    raise ValueError("Could not find INITIAL_DATA in data.js")

def migrate_data():
    init_db()
    data = load_initial_data()
    conn = get_connection()
    cursor = conn.cursor()

    # Clear existing tables for fresh migration
    cursor.execute("DELETE FROM municipal_employees_search_pool;")
    cursor.execute("DELETE FROM move_roster;")
    cursor.execute("DELETE FROM activities;")
    cursor.execute("DELETE FROM activity_attendees;")
    cursor.execute("DELETE FROM signatories;")
    cursor.execute("DELETE FROM issued_certificates;")

    # -------------------------------------------------------------
    # 1. Populate Municipal Employees Search Pool (Separate Pool)
    # -------------------------------------------------------------
    raw_data = data.get("raw_data", {})
    permanent_list = raw_data.get("permanent", [])
    casual_list = raw_data.get("casual", [])
    all_pool = permanent_list + casual_list

    pool_rows = []
    for emp in all_pool:
        orig_no = str(emp.get("origNo", "") or "")
        name = str(emp.get("name", "")).strip()
        if not name:
            continue
        position = str(emp.get("position", "")).strip()
        office = str(emp.get("office", "")).strip()
        gender = str(emp.get("gender", "M")).strip()
        civil = str(emp.get("civilStatus", "Married")).strip()
        appointment = str(emp.get("appointment", "PERMANENT")).strip()
        contact = str(emp.get("cell", "") or "").strip()

        pool_rows.append((orig_no, name, position, gender, civil, office, appointment, contact))

    cursor.executemany("""
    INSERT INTO municipal_employees_search_pool 
    (orig_no, full_name, position, gender, civil_status, office, appointment, contact_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, pool_rows)
    print(f"Imported {len(pool_rows)} municipal employees into search pool.")

    # -------------------------------------------------------------
    # 2. Populate Dedicated MOVE Chapter Table (move_roster)
    # -------------------------------------------------------------
    # In MOVE roster, members have selective status flags:
    # is_member, is_officer, is_committee, is_participant
    roster_map = {} # full_name -> dict of fields

    # A. Official MOVE Cadre Members (from move_members)
    move_members = data.get("move_members", [])
    for m in move_members:
        name = str(m.get("name", "")).strip().upper()
        if not name:
            continue
        roster_map[name] = {
            "full_name": name,
            "position": str(m.get("position", "")).strip(),
            "gender": str(m.get("sex", "M")).strip(),
            "civil_status": str(m.get("civilStatus", "Married")).strip(),
            "office": str(m.get("office", "")).strip(),
            "contact_number": str(m.get("contactNumber", "") or "").strip(),
            "role_title": str(m.get("moveRole", "Registered Member")).strip(),
            "is_member": 1,
            "is_officer": 0,
            "is_committee": 0,
            "is_participant": 1,
            "notes": f"Survey Address: {m.get('address', '')}"
        }

    # B. Executive Officers
    officers = data.get("officers", {})
    timeline = officers.get("timeline", [])
    for term in timeline:
        board = term.get("board", [])
        for off in board:
            name = str(off.get("name", "")).strip().upper()
            role = str(off.get("role", "Officer")).strip()
            office = str(off.get("office", "MOVE Baguio Chapter")).strip()

            if name in roster_map:
                roster_map[name]["is_officer"] = 1
                roster_map[name]["role_title"] = role
            else:
                roster_map[name] = {
                    "full_name": name,
                    "position": role,
                    "gender": "M",
                    "civil_status": "Married",
                    "office": office,
                    "contact_number": "",
                    "role_title": role,
                    "is_member": 1,
                    "is_officer": 1,
                    "is_committee": 0,
                    "is_participant": 0,
                    "notes": f"Executive Board ({term.get('term', '2026')})"
                }

    # C. Standing Committees
    committees = officers.get("committees", [])
    for comm in committees:
        comm_name = comm.get("name", "Committee")
        chair = str(comm.get("chair", "")).replace("Mr.", "").replace("Hon.", "").strip().upper()
        vchair = str(comm.get("viceChair", "")).replace("Mr.", "").replace("Hon.", "").strip().upper()

        if chair:
            if chair in roster_map:
                roster_map[chair]["is_committee"] = 1
                roster_map[chair]["role_title"] = f"Chair, {comm_name}"
            else:
                roster_map[chair] = {
                    "full_name": chair,
                    "position": f"Chair, {comm_name}",
                    "gender": "M",
                    "civil_status": "Married",
                    "office": "City Government of Baguio",
                    "contact_number": "",
                    "role_title": f"Chair, {comm_name}",
                    "is_member": 1,
                    "is_officer": 0,
                    "is_committee": 1,
                    "is_participant": 0,
                    "notes": comm_name
                }
        if vchair:
            if vchair in roster_map:
                roster_map[vchair]["is_committee"] = 1
                roster_map[vchair]["role_title"] = f"Vice-Chair, {comm_name}"
            else:
                roster_map[vchair] = {
                    "full_name": vchair,
                    "position": f"Vice-Chair, {comm_name}",
                    "gender": "M",
                    "civil_status": "Married",
                    "office": "City Government of Baguio",
                    "contact_number": "",
                    "role_title": f"Vice-Chair, {comm_name}",
                    "is_member": 1,
                    "is_officer": 0,
                    "is_committee": 1,
                    "is_participant": 0,
                    "notes": comm_name
                }

    # Insert into move_roster
    roster_rows = []
    for r in roster_map.values():
        roster_rows.append((
            r["full_name"], r["position"], r["gender"], r["civil_status"],
            r["office"], r["contact_number"], r["role_title"],
            r["is_member"], r["is_officer"], r["is_committee"], r["is_participant"],
            r["notes"]
        ))

    cursor.executemany("""
    INSERT INTO move_roster
    (full_name, position, gender, civil_status, office, contact_number, role_title,
     is_member, is_officer, is_committee, is_participant, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, roster_rows)
    print(f"Imported {len(roster_rows)} MOVE Chapter records into move_roster.")

    # -------------------------------------------------------------
    # 3. Populate Default Signatories
    # -------------------------------------------------------------
    default_signatories = [
        ("HON. BENJAMIN B. MAGALONG", "City Mayor & Honorary Chapter Adviser", "City Government of Baguio", "signature (15).png", 1),
        ("HON. FAUSTINO A. OLOWAN", "City Vice Mayor & Chapter Adviser", "City Government of Baguio", "", 0),
        ("MARIO D. GANGA JR.", "MOVE Baguio Chapter President", "CMO - PDAO", "GANGA.png", 1),
        ("FLORENTINO N. DELA CRUZ JR.", "MOVE Vice President", "CMO - Library", "", 0),
        ("RUPERTO D. GUADAÑA JR.", "MOVE Chapter Secretary", "Sangguniang Panlungsod", "", 0),
        ("DAN RICKY M. ONG", "Immediate Past President", "Sangguniang Panlungsod", "", 0),
        ("HAROLD P. MALLORCA", "Public Relations Officer / Past President", "CBAO / CMO", "", 0)
    ]
    cursor.executemany("""
    INSERT INTO signatories (name, title, office, signature_image, is_default)
    VALUES (?, ?, ?, ?, ?);
    """, default_signatories)
    print(f"Imported {len(default_signatories)} official signatories.")

    # -------------------------------------------------------------
    # 4. Populate Flagship Activity ("Men in the Kitchen 2")
    # -------------------------------------------------------------
    cursor.execute("""
    INSERT INTO activities (title, theme, activity_date, venue, duration_hours, trainer_name, trainer_position, target_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        "Men in the Kitchen 2",
        "Love Served in the Kitchen",
        "October 20, 2026",
        "CDRRMO Building, Motorpool Compound, Lower Rock Quarry, Baguio City",
        "8 Hours",
        "Chef Ramon Dela Rosa",
        "Master Trainer & Culinary Specialist",
        "50 target participants from various municipal departments"
    ))
    activity_id = cursor.lastrowid
    print(f"Created initial Activity ID {activity_id} ('Men in the Kitchen 2').")

    # -------------------------------------------------------------
    # 5. Populate Activity Attendees (with live is_present status)
    # -------------------------------------------------------------
    # Fetch first 50 MOVE roster members with is_participant=1 or is_member=1
    cursor.execute("SELECT * FROM move_roster ORDER BY id ASC LIMIT 50;")
    attendee_candidates = cursor.fetchall()

    attendee_rows = []
    for idx, c in enumerate(attendee_candidates, 1):
        # By default, mark the first 47 as present (94% verified attendance), 3 absent for demo testing
        is_pres = 1 if idx <= 47 else 0
        attendee_rows.append((
            activity_id,
            c["id"],
            c["full_name"],
            c["position"],
            c["gender"],
            c["civil_status"],
            c["office"],
            c["contact_number"],
            is_pres,
            "08:15 AM" if is_pres else None,
            "Pre-enrolled participant"
        ))

    cursor.executemany("""
    INSERT INTO activity_attendees 
    (activity_id, move_roster_id, full_name, position, gender, civil_status, office, contact_number, is_present, check_in_time, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, attendee_rows)
    print(f"Enrolled {len(attendee_rows)} attendees for Activity {activity_id} (47 present, 3 absent).")

    conn.commit()
    conn.close()
    print("Database migration completed successfully!")

if __name__ == "__main__":
    migrate_data()
