import http.server
import socketserver
import json
import os
import re
import urllib.parse
import sys
from datetime import datetime

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from database import get_connection, init_db

PORT = 8765
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

class HRISApiHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Serve files from BASE_DIR (so images, CSS, and frontend are accessible)
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def parse_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            return {}
        body_bytes = self.rfile.read(content_length)
        try:
            return json.loads(body_bytes.decode("utf-8"))
        except Exception:
            return {}

    # -------------------------------------------------------------
    # GET Request Dispatcher
    # -------------------------------------------------------------
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # Serve Frontend Root
        if path == "/" or path == "/index.html":
            target_html = os.path.join(FRONTEND_DIR, "index.html")
            if os.path.exists(target_html):
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                with open(target_html, "rb") as f:
                    self.wfile.write(f.read())
                return
            else:
                return super().do_GET()

        # 1. API: Server Health & Status
        if path == "/api/status":
            self.send_json({
                "status": "online",
                "database": "SQLite",
                "timestamp": datetime.now().isoformat()
            })
            return

        # 2. API: MOVE Dedicated Roster (with selective status filtering)
        if path == "/api/move-roster":
            status_filter = query.get("status", ["all"])[0]
            search_query = query.get("q", [""])[0].strip()

            conn = get_connection()
            sql = "SELECT * FROM move_roster WHERE 1=1"
            params = []

            if status_filter == "member":
                sql += " AND is_member = 1"
            elif status_filter == "officer":
                sql += " AND is_officer = 1"
            elif status_filter == "committee":
                sql += " AND is_committee = 1"
            elif status_filter == "participant":
                sql += " AND is_participant = 1"

            if search_query:
                sql += " AND (full_name LIKE ? OR position LIKE ? OR office LIKE ?)"
                params.extend([f"%{search_query}%", f"%{search_query}%", f"%{search_query}%"])

            sql += " ORDER BY full_name ASC"
            cursor = conn.execute(sql, params)
            roster = [dict(row) for row in cursor.fetchall()]
            conn.close()
            self.send_json({"success": True, "count": len(roster), "roster": roster})
            return

        # 3. API: Municipal Employees Search Pool (Separate Table)
        if path == "/api/search-pool":
            q = query.get("q", [""])[0].strip()
            office = query.get("office", [""])[0].strip()
            limit = int(query.get("limit", [50])[0])

            conn = get_connection()
            sql = "SELECT * FROM municipal_employees_search_pool WHERE 1=1"
            params = []
            if q:
                sql += " AND (full_name LIKE ? OR position LIKE ?)"
                params.extend([f"%{q}%", f"%{q}%"])
            if office:
                sql += " AND office = ?"
                params.append(office)
            sql += f" ORDER BY full_name ASC LIMIT {limit}"

            cursor = conn.execute(sql, params)
            employees = [dict(row) for row in cursor.fetchall()]
            conn.close()
            self.send_json({"success": True, "count": len(employees), "employees": employees})
            return

        # 4. API: Activities
        if path == "/api/activities":
            conn = get_connection()
            cursor = conn.execute("""
            SELECT a.*, 
                   COUNT(att.id) as total_attendees,
                   SUM(CASE WHEN att.is_present = 1 THEN 1 ELSE 0 END) as present_count
            FROM activities a
            LEFT JOIN activity_attendees att ON a.id = att.activity_id
            GROUP BY a.id
            ORDER BY a.id DESC;
            """)
            activities = [dict(row) for row in cursor.fetchall()]
            conn.close()
            self.send_json({"success": True, "activities": activities})
            return

        # 5. API: Activity Attendees (Checklist)
        m_att = re.match(r"^/api/activities/(\d+)/attendees$", path)
        if m_att:
            activity_id = int(m_att.group(1))
            conn = get_connection()
            cursor = conn.execute("""
            SELECT * FROM activity_attendees 
            WHERE activity_id = ? 
            ORDER BY full_name ASC;
            """, (activity_id,))
            attendees = [dict(row) for row in cursor.fetchall()]
            conn.close()
            self.send_json({"success": True, "activity_id": activity_id, "attendees": attendees})
            return

        # 5b. API: Activity Facilitators / Trainers / Resource Speakers
        m_fac = re.match(r"^/api/activities/(\d+)/facilitators$", path)
        if m_fac:
            activity_id = int(m_fac.group(1))
            conn = get_connection()
            cursor = conn.execute("""
            SELECT * FROM activity_facilitators 
            WHERE activity_id = ? 
            ORDER BY id ASC;
            """, (activity_id,))
            facilitators = [dict(row) for row in cursor.fetchall()]
            conn.close()
            self.send_json({"success": True, "activity_id": activity_id, "facilitators": facilitators, "count": len(facilitators)})
            return

        # 6. API: GATED CERTIFICATES (ONLY presents allowed!)
        m_cert = re.match(r"^/api/activities/(\d+)/eligible-certificates$", path)
        if m_cert:
            activity_id = int(m_cert.group(1))
            conn = get_connection()
            # Fetch Activity Details
            act = conn.execute("SELECT * FROM activities WHERE id = ?;", (activity_id,)).fetchone()
            if not act:
                conn.close()
                self.send_json({"success": False, "message": "Activity not found"}, 404)
                return

            # GATED QUERY: WHERE is_present = 1
            cursor = conn.execute("""
            SELECT * FROM activity_attendees 
            WHERE activity_id = ? AND is_present = 1
            ORDER BY full_name ASC;
            """, (activity_id,))
            eligible_attendees = [dict(row) for row in cursor.fetchall()]

            cursor_fac = conn.execute("""
            SELECT * FROM activity_facilitators 
            WHERE activity_id = ? AND is_present = 1
            ORDER BY id ASC;
            """, (activity_id,))
            eligible_facilitators = [dict(row) for row in cursor_fac.fetchall()]

            # Fetch Default Signatories
            sig_cur = conn.execute("SELECT * FROM signatories ORDER BY is_default DESC, id ASC;")
            signatories = [dict(row) for row in sig_cur.fetchall()]
            conn.close()

            self.send_json({
                "success": True,
                "activity": dict(act),
                "count": len(eligible_attendees),
                "eligible_attendees": eligible_attendees,
                "eligible_facilitators": eligible_facilitators,
                "signatories": signatories
            })
            return

        # 7. API: Signatories List
        if path == "/api/signatories":
            conn = get_connection()
            cursor = conn.execute("SELECT * FROM signatories ORDER BY id ASC;")
            signatories = [dict(row) for row in cursor.fetchall()]
            conn.close()
            self.send_json({"success": True, "signatories": signatories})
            return

        # Default static file handler for images, css, js
        return super().do_GET()

    # -------------------------------------------------------------
    # POST Request Dispatcher
    # -------------------------------------------------------------
    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = self.parse_body()

        # 1. API: Add Person directly into MOVE Roster
        if path == "/api/move-roster":
            full_name = str(body.get("full_name", "")).strip().upper()
            if not full_name:
                self.send_json({"success": False, "message": "Full Name is required"}, 400)
                return
            position = str(body.get("position", "")).strip()
            gender = str(body.get("gender", "M")).strip()
            civil = str(body.get("civil_status", "Married")).strip()
            office = str(body.get("office", "")).strip()
            contact = str(body.get("contact_number", "")).strip()
            role_title = str(body.get("role_title", "Member")).strip()
            is_member = int(bool(body.get("is_member", True)))
            is_officer = int(bool(body.get("is_officer", False)))
            is_committee = int(bool(body.get("is_committee", False)))
            is_participant = int(bool(body.get("is_participant", False)))
            notes = str(body.get("notes", "")).strip()

            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO move_roster 
            (full_name, position, gender, civil_status, office, contact_number, role_title,
             is_member, is_officer, is_committee, is_participant, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (full_name, position, gender, civil, office, contact, role_title,
                  is_member, is_officer, is_committee, is_participant, notes))
            new_id = cursor.lastrowid
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Member added to MOVE roster", "id": new_id})
            return

        # 2. API: Copy from Municipal Pool to MOVE Roster
        if path == "/api/search-pool/copy-to-move":
            emp_id = body.get("employee_id")
            conn = get_connection()
            emp = conn.execute("SELECT * FROM municipal_employees_search_pool WHERE id = ?;", (emp_id,)).fetchone()
            if not emp:
                conn.close()
                self.send_json({"success": False, "message": "Employee not found"}, 404)
                return

            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO move_roster
            (full_name, position, gender, civil_status, office, contact_number, role_title,
             is_member, is_officer, is_committee, is_participant, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (emp["full_name"], emp["position"], emp["gender"], emp["civil_status"],
                  emp["office"], emp["contact_number"], "Registered Member",
                  1, 0, 0, 1, f"Imported from Municipal Pool (Orig #{emp['orig_no']})"))
            new_id = cursor.lastrowid
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": f"{emp['full_name']} added to MOVE Roster", "id": new_id})
            return

        # 3. API: Create Activity
        if path == "/api/activities":
            title = str(body.get("title", "")).strip()
            if not title:
                self.send_json({"success": False, "message": "Activity Title is required"}, 400)
                return
            theme = str(body.get("theme", "")).strip()
            date = str(body.get("activity_date", "")).strip()
            venue = str(body.get("venue", "")).strip()
            duration = str(body.get("duration_hours", "8 Hours")).strip()
            trainer = str(body.get("trainer_name", "")).strip()
            trainer_pos = str(body.get("trainer_position", "")).strip()
            target_notes = str(body.get("target_notes", "")).strip()

            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO activities 
            (title, theme, activity_date, venue, duration_hours, trainer_name, trainer_position, target_notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """, (title, theme, date, venue, duration, trainer, trainer_pos, target_notes))
            act_id = cursor.lastrowid
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": "Activity created successfully", "id": act_id})
            return

        # 4. API: Add Attendee to Activity (from MOVE or custom)
        m_add_att = re.match(r"^/api/activities/(\d+)/attendees$", path)
        if m_add_att:
            activity_id = int(m_add_att.group(1))
            full_name = str(body.get("full_name", "")).strip().upper()
            if not full_name:
                self.send_json({"success": False, "message": "Full Name is required"}, 400)
                return
            move_roster_id = body.get("move_roster_id")
            position = str(body.get("position", "")).strip()
            gender = str(body.get("gender", "M")).strip()
            civil = str(body.get("civil_status", "Married")).strip()
            office = str(body.get("office", "")).strip()
            contact = str(body.get("contact_number", "")).strip()
            is_present = int(bool(body.get("is_present", False)))

            conn = get_connection()
            cursor = conn.cursor()

            # Check if attendee is already enrolled in this activity
            existing = cursor.execute("""
            SELECT id, is_present, check_in_time FROM activity_attendees
            WHERE activity_id = ? AND UPPER(TRIM(full_name)) = UPPER(TRIM(?));
            """, (activity_id, full_name)).fetchone()
            if existing:
                conn.close()
                status_str = "Present" if existing["is_present"] else "Absent"
                self.send_json({
                    "success": False,
                    "duplicate": True,
                    "existing_id": existing["id"],
                    "message": f"'{full_name}' is already enrolled in this activity (Current Status: {status_str}). Duplicate enrollment is not allowed."
                }, 409)
                return

            try:
                cursor.execute("""
                INSERT INTO activity_attendees
                (activity_id, move_roster_id, full_name, position, gender, civil_status, office, contact_number, is_present, check_in_time)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """, (activity_id, move_roster_id, full_name, position, gender, civil, office, contact,
                      is_present, datetime.now().strftime("%I:%M %p") if is_present else None))
                new_id = cursor.lastrowid
                conn.commit()
            except sqlite3.IntegrityError:
                conn.close()
                self.send_json({
                    "success": False,
                    "duplicate": True,
                    "message": f"'{full_name}' is already enrolled in this activity."
                }, 409)
                return

            conn.close()
            self.send_json({"success": True, "message": "Attendee enrolled into activity", "id": new_id})
            return

        # 5. API: Bulk Enroll MOVE Members / Participants into Activity
        m_bulk = re.match(r"^/api/activities/(\d+)/bulk-enroll-move$", path)
        if m_bulk:
            activity_id = int(m_bulk.group(1))
            status_filter = body.get("status_filter", "participant") # 'participant', 'member', 'all'
            
            conn = get_connection()
            sql = "SELECT * FROM move_roster WHERE 1=1"
            if status_filter == "participant":
                sql += " AND is_participant = 1"
            elif status_filter == "member":
                sql += " AND is_member = 1"
            elif status_filter == "officer":
                sql += " AND is_officer = 1"
            
            candidates = conn.execute(sql).fetchall()
            cursor = conn.cursor()
            count = 0
            for c in candidates:
                # Check if already enrolled (case and whitespace insensitive)
                exists = cursor.execute("""
                SELECT id FROM activity_attendees 
                WHERE activity_id = ? AND UPPER(TRIM(full_name)) = UPPER(TRIM(?));
                """, (activity_id, c["full_name"])).fetchone()
                if not exists:
                    try:
                        cursor.execute("""
                        INSERT INTO activity_attendees
                        (activity_id, move_roster_id, full_name, position, gender, civil_status, office, contact_number, is_present)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0);
                        """, (activity_id, c["id"], c["full_name"], c["position"], c["gender"],
                              c["civil_status"], c["office"], c["contact_number"]))
                        count += 1
                    except sqlite3.IntegrityError:
                        pass
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": f"Enrolled {count} attendees into activity", "enrolled_count": count})
            return

        # 6. API: Add Facilitator to Activity (with Duplicate Detection)
        m_add_fac = re.match(r"^/api/activities/(\d+)/facilitators$", path)
        if m_add_fac:
            activity_id = int(m_add_fac.group(1))
            full_name = str(body.get("full_name", "")).strip().upper()
            if not full_name:
                self.send_json({"success": False, "message": "Facilitator Full Name is required"}, 400)
                return
            move_roster_id = body.get("move_roster_id")
            role_title = str(body.get("role_title", "Facilitator")).strip() or "Facilitator"
            position = str(body.get("position", "")).strip()
            gender = str(body.get("gender", "M")).strip()
            civil = str(body.get("civil_status", "Married")).strip()
            office = str(body.get("office", "")).strip()
            contact = str(body.get("contact_number", "")).strip()
            is_present = int(bool(body.get("is_present", True)))
            notes = str(body.get("notes", "")).strip()

            conn = get_connection()
            cursor = conn.cursor()

            # Duplicate check
            existing = cursor.execute("""
            SELECT id, is_present, check_in_time FROM activity_facilitators
            WHERE activity_id = ? AND UPPER(TRIM(full_name)) = UPPER(TRIM(?));
            """, (activity_id, full_name)).fetchone()
            if existing:
                conn.close()
                status_str = "Present" if existing["is_present"] else "Absent"
                self.send_json({
                    "success": False,
                    "duplicate": True,
                    "existing_id": existing["id"],
                    "message": f"'{full_name}' is already listed as a facilitator in this activity (Status: {status_str})."
                }, 409)
                return

            try:
                cursor.execute("""
                INSERT INTO activity_facilitators
                (activity_id, move_roster_id, full_name, role_title, position, gender, civil_status, office, contact_number, is_present, check_in_time, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """, (activity_id, move_roster_id, full_name, role_title, position, gender, civil, office, contact,
                      is_present, datetime.now().strftime("%I:%M %p") if is_present else None, notes))
                new_id = cursor.lastrowid
                conn.commit()
            except sqlite3.IntegrityError:
                conn.close()
                self.send_json({
                    "success": False,
                    "duplicate": True,
                    "message": f"'{full_name}' is already enrolled as a facilitator in this activity."
                }, 409)
                return

            conn.close()
            self.send_json({"success": True, "message": "Facilitator enrolled into activity", "id": new_id})
            return

        # Fallback 404
        self.send_json({"success": False, "message": "Endpoint not found"}, 404)

    # -------------------------------------------------------------
    # PUT Request Dispatcher (Updates & Status Toggles)
    # -------------------------------------------------------------
    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = self.parse_body()

        # 1. API: Toggle or Change MOVE Roster Status (is_member, is_officer, is_committee, is_participant)
        m_stat = re.match(r"^/api/move-roster/(\d+)/status$", path)
        if m_stat:
            roster_id = int(m_stat.group(1))
            field = str(body.get("field", "")).strip()
            val = int(bool(body.get("value", 0)))

            valid_fields = ["is_member", "is_officer", "is_committee", "is_participant"]
            if field not in valid_fields:
                self.send_json({"success": False, "message": f"Invalid status field '{field}'"}, 400)
                return

            conn = get_connection()
            conn.execute(f"UPDATE move_roster SET {field} = ? WHERE id = ?;", (val, roster_id))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": f"Updated {field} = {val} for roster ID {roster_id}"})
            return

        # 2. API: Toggle Attendee is_present (The Certificate Gate!)
        m_pres = re.match(r"^/api/activities/(\d+)/attendees/(\d+)/present$", path)
        if m_pres:
            activity_id = int(m_pres.group(1))
            attendee_id = int(m_pres.group(2))
            is_present = int(bool(body.get("is_present", 1)))
            check_in = datetime.now().strftime("%I:%M %p") if is_present else None

            conn = get_connection()
            conn.execute("""
            UPDATE activity_attendees 
            SET is_present = ?, check_in_time = ?
            WHERE id = ? AND activity_id = ?;
            """, (is_present, check_in, attendee_id, activity_id))
            conn.commit()
            conn.close()
            self.send_json({
                "success": True,
                "message": "Attendance updated",
                "is_present": is_present,
                "check_in_time": check_in
            })
            return

        # 2a-2. API: Update Attendee Details (Position, Office, Name, Gender, Civil Status, etc.)
        m_edit_att = re.match(r"^/api/activities/(\d+)/attendees/(\d+)$", path)
        if m_edit_att:
            activity_id = int(m_edit_att.group(1))
            attendee_id = int(m_edit_att.group(2))

            full_name = str(body.get("full_name", "")).strip().upper()
            if not full_name:
                self.send_json({"success": False, "message": "Attendee Full Name is required"}, 400)
                return

            position = str(body.get("position", "")).strip()
            office = str(body.get("office", "")).strip()
            gender = str(body.get("gender", "M")).strip()
            civil = str(body.get("civil_status", "Married")).strip()
            contact = str(body.get("contact_number", "")).strip()
            notes = str(body.get("notes", "")).strip()

            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("""
            UPDATE activity_attendees
            SET full_name = ?, position = ?, office = ?,
                gender = ?, civil_status = ?, contact_number = ?, notes = ?
            WHERE id = ? AND activity_id = ?;
            """, (full_name, position, office, gender, civil, contact, notes, attendee_id, activity_id))
            conn.commit()

            updated = conn.execute("SELECT * FROM activity_attendees WHERE id = ?;", (attendee_id,)).fetchone()
            conn.close()

            if not updated:
                self.send_json({"success": False, "message": "Attendee not found"}, 404)
                return

            self.send_json({
                "success": True,
                "message": "Attendee updated successfully",
                "attendee": dict(updated)
            })
            return

        # 2b. API: Toggle Facilitator is_present
        m_fac_pres = re.match(r"^/api/activities/(\d+)/facilitators/(\d+)/present$", path)
        if m_fac_pres:
            activity_id = int(m_fac_pres.group(1))
            fac_id = int(m_fac_pres.group(2))
            is_present = int(bool(body.get("is_present", 1)))
            check_in = datetime.now().strftime("%I:%M %p") if is_present else None

            conn = get_connection()
            conn.execute("""
            UPDATE activity_facilitators 
            SET is_present = ?, check_in_time = ?
            WHERE id = ? AND activity_id = ?;
            """, (is_present, check_in, fac_id, activity_id))
            conn.commit()
            conn.close()
            self.send_json({
                "success": True,
                "message": "Facilitator attendance updated",
                "is_present": is_present,
                "check_in_time": check_in
            })
            return

        # 2c. API: Update Facilitator Details (Position, Role Title, Office, Name, etc.)
        m_edit_fac = re.match(r"^/api/activities/(\d+)/facilitators/(\d+)$", path)
        if m_edit_fac:
            activity_id = int(m_edit_fac.group(1))
            fac_id = int(m_edit_fac.group(2))
            
            full_name = str(body.get("full_name", "")).strip().upper()
            if not full_name:
                self.send_json({"success": False, "message": "Facilitator Full Name is required"}, 400)
                return

            role_title = str(body.get("role_title", "Facilitator")).strip()
            position = str(body.get("position", "")).strip()
            office = str(body.get("office", "")).strip()
            gender = str(body.get("gender", "M")).strip()
            civil = str(body.get("civil_status", "Married")).strip()
            contact = str(body.get("contact_number", "")).strip()
            notes = str(body.get("notes", "")).strip()

            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("""
            UPDATE activity_facilitators
            SET full_name = ?, role_title = ?, position = ?, office = ?,
                gender = ?, civil_status = ?, contact_number = ?, notes = ?
            WHERE id = ? AND activity_id = ?;
            """, (full_name, role_title, position, office, gender, civil, contact, notes, fac_id, activity_id))
            conn.commit()

            updated = conn.execute("SELECT * FROM activity_facilitators WHERE id = ?;", (fac_id,)).fetchone()
            conn.close()

            if not updated:
                self.send_json({"success": False, "message": "Facilitator not found"}, 404)
                return

            self.send_json({
                "success": True,
                "message": "Facilitator updated successfully",
                "facilitator": dict(updated)
            })
            return

        # 3. API: Batch Toggle All Attendees Present / Absent
        m_batch_att = re.match(r"^/api/activities/(\d+)/batch-attendance$", path)
        if m_batch_att:
            activity_id = int(m_batch_att.group(1))
            set_all_present = int(bool(body.get("set_present", True)))
            check_in = datetime.now().strftime("%I:%M %p") if set_all_present else None

            conn = get_connection()
            conn.execute("""
            UPDATE activity_attendees 
            SET is_present = ?, check_in_time = ?
            WHERE activity_id = ?;
            """, (set_all_present, check_in, activity_id))
            conn.commit()
            conn.close()
            self.send_json({
                "success": True, 
                "message": f"All attendees marked as {'Present' if set_all_present else 'Absent'}"
            })
            return

        # 4. API: Update Activity Details (Venue, Date, Title, Theme, Hours, Trainer, Target Notes)
        m_upd_act = re.match(r"^/api/activities/(\d+)$", path)
        if m_upd_act:
            activity_id = int(m_upd_act.group(1))
            title = str(body.get("title", "")).strip()
            if not title:
                self.send_json({"success": False, "message": "Activity Title is required"}, 400)
                return
            theme = str(body.get("theme", "")).strip()
            date = str(body.get("activity_date", "")).strip()
            duration = str(body.get("duration_hours", "8 Hours")).strip()
            venue = str(body.get("venue", "")).strip()
            trainer = str(body.get("trainer_name", "")).strip()
            trainer_pos = str(body.get("trainer_position", "")).strip()
            target_notes = str(body.get("target_notes", "")).strip()

            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("""
            UPDATE activities
            SET title = ?, theme = ?, activity_date = ?, duration_hours = ?,
                venue = ?, trainer_name = ?, trainer_position = ?, target_notes = ?
            WHERE id = ?;
            """, (title, theme, date, duration, venue, trainer, trainer_pos, target_notes, activity_id))
            conn.commit()

            act = conn.execute("SELECT * FROM activities WHERE id = ?;", (activity_id,)).fetchone()
            conn.close()

            if not act:
                self.send_json({"success": False, "message": "Activity not found"}, 404)
                return

            self.send_json({
                "success": True,
                "message": "Activity updated successfully",
                "activity": dict(act)
            })
            return

        self.send_json({"success": False, "message": "Endpoint not found"}, 404)

    # -------------------------------------------------------------
    # DELETE Request Dispatcher
    # -------------------------------------------------------------
    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # 1. API: Delete Member from MOVE Roster
        m_del_roster = re.match(r"^/api/move-roster/(\d+)$", path)
        if m_del_roster:
            roster_id = int(m_del_roster.group(1))
            conn = get_connection()
            conn.execute("DELETE FROM move_roster WHERE id = ?;", (roster_id,))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": f"Roster record {roster_id} deleted"})
            return

        # 2. API: Delete Attendee from Activity
        m_del_att = re.match(r"^/api/activities/(\d+)/attendees/(\d+)$", path)
        if m_del_att:
            activity_id = int(m_del_att.group(1))
            attendee_id = int(m_del_att.group(2))
            conn = get_connection()
            conn.execute("DELETE FROM activity_attendees WHERE id = ? AND activity_id = ?;", (attendee_id, activity_id))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": f"Attendee {attendee_id} removed from activity {activity_id}"})
            return

        # 2b. API: Delete Facilitator from Activity
        m_del_fac = re.match(r"^/api/activities/(\d+)/facilitators/(\d+)$", path)
        if m_del_fac:
            activity_id = int(m_del_fac.group(1))
            fac_id = int(m_del_fac.group(2))
            conn = get_connection()
            conn.execute("DELETE FROM activity_facilitators WHERE id = ? AND activity_id = ?;", (fac_id, activity_id))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": f"Facilitator {fac_id} removed from activity {activity_id}"})
            return

        # 3. API: Delete Activity (and all its attendees and facilitators)
        m_del_act = re.match(r"^/api/activities/(\d+)$", path)
        if m_del_act:
            activity_id = int(m_del_act.group(1))
            conn = get_connection()
            conn.execute("DELETE FROM activity_attendees WHERE activity_id = ?;", (activity_id,))
            conn.execute("DELETE FROM activity_facilitators WHERE activity_id = ?;", (activity_id,))
            conn.execute("DELETE FROM activities WHERE id = ?;", (activity_id,))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": f"Activity {activity_id}, attendees, and facilitators deleted successfully"})
            return

        self.send_json({"success": False, "message": "Endpoint not found"}, 404)

def run_server():
    print(f"============================================================")
    print(f"   MOVE Baguio Chapter HRIS — Clean REST API Server        ")
    print(f"============================================================")
    print(f"  Database : SQLite ({os.path.join(BASE_DIR, 'data', 'move_hris.db')})")
    print(f"  Port     : http://127.0.0.1:{PORT}")
    print(f"============================================================")
    with socketserver.TCPServer(("127.0.0.1", PORT), HRISApiHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == "__main__":
    run_server()
