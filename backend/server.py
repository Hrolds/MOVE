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
import hris_service
import sftp_service

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
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
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

        # 1b. API: HRIS Comparison & Audit
        if path == "/api/hris/compare":
            force_refresh = str(query.get("force", ["0"])[0]).lower() in ("1", "true", "yes")
            try:
                result = hris_service.compare_roster_with_hris(force=force_refresh)
                self.send_json(result)
            except Exception as e:
                self.send_json({"success": False, "error": str(e)}, 500)
            return

        if path == "/api/hris/departments":
            try:
                depts = hris_service.get_hris_departments()
                self.send_json({"success": True, "departments": depts})
            except Exception as e:
                self.send_json({"success": False, "error": str(e)}, 500)
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

            if status_filter == "officer":
                sql += " ORDER BY CASE WHEN officer_order IS NOT NULL AND officer_order > 0 THEN officer_order ELSE 999 END ASC, id ASC"
            else:
                sql += " ORDER BY full_name ASC"
            cursor = conn.execute(sql, params)
            roster = [dict(row) for row in cursor.fetchall()]
            conn.close()
            self.send_json({"success": True, "count": len(roster), "roster": roster})
            return

        # 2b. API: MOVE Roster Member Photo (from local cache or SFTP)
        m_roster_photo = re.match(r"^/api/move-roster/(\d+)/photo$", path)
        if m_roster_photo:
            roster_id = int(m_roster_photo.group(1))
            photo_info = sftp_service.get_profile_photo_for_roster_id(roster_id)
            if photo_info:
                file_path, mime = photo_info
                self.send_response(200)
                self.send_header("Content-Type", mime)
                self.send_header("Cache-Control", "public, max-age=86400")
                self.end_headers()
                with open(file_path, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.send_json({"success": False, "message": "Photo not found"}, 404)
            return

        # 2c. API: HRIS Employee Photo
        m_hris_photo = re.match(r"^/api/hris/(\d+)/photo$", path)
        if m_hris_photo:
            hris_id = int(m_hris_photo.group(1))
            photo_info = sftp_service.get_profile_photo_for_hris_id(hris_id)
            if photo_info:
                file_path, mime = photo_info
                self.send_response(200)
                self.send_header("Content-Type", mime)
                self.send_header("Cache-Control", "public, max-age=86400")
                self.end_headers()
                with open(file_path, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.send_json({"success": False, "message": "Photo not found"}, 404)
            return

        # 3. API: Municipal Employees Search Pool (Separate Table)
        if path == "/api/search-pool":
            q = query.get("q", [""])[0].strip()
            office = query.get("office", [""])[0].strip()
            limit = int(query.get("limit", [10])[0])

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

        # 8. API: Certificate Settings
        if path == "/api/certificate-settings":
            conn = get_connection()
            cursor = conn.cursor()
            row = cursor.execute("SELECT * FROM certificate_settings WHERE id = 1;").fetchone()
            conn.close()
            self.send_json({"success": True, "settings": dict(row) if row else {}})
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

        # 0a. API: HRIS Bulk Sync
        if path == "/api/hris/sync-roster":
            ids = body.get("ids", [])
            all_outdated = body.get("all_outdated", False)
            update_position = body.get("update_position", True)
            update_office = body.get("update_office", True)
            try:
                if all_outdated:
                    comp = hris_service.compare_roster_with_hris()
                    # Only include outdated active employees by default
                    ids = [item["id"] for item in comp.get("comparison", []) if item.get("is_outdated") and not item.get("is_inactive")]
                result = hris_service.sync_members(ids, update_position=update_position, update_office=update_office)
                self.send_json(result)
            except Exception as e:
                self.send_json({"success": False, "error": str(e)}, 500)
            return

        # 0b. API: HRIS Single Member Sync
        if path == "/api/hris/sync-single":
            member_id = body.get("id")
            update_position = body.get("update_position", True)
            update_office = body.get("update_office", True)
            try:
                result = hris_service.sync_members([member_id], update_position=update_position, update_office=update_office)
                self.send_json(result)
            except Exception as e:
                self.send_json({"success": False, "error": str(e)}, 500)
            return

        # 0c. API: Manually link HRIS ID to member
        if path == "/api/hris/link-id":
            member_id = body.get("member_id")
            hris_id = body.get("hris_id")
            apply_sync = body.get("apply_sync", True)
            try:
                result = hris_service.link_manual_hris_id(int(member_id), int(hris_id), apply_sync=apply_sync)
                self.send_json(result)
            except Exception as e:
                self.send_json({"success": False, "error": str(e)}, 500)
            return

        # 0d. API: Save Officers Arrangement / Hierarchy Order
        if path == "/api/move-roster/reorder-officers":
            ordered_ids = body.get("ordered_ids", [])
            if not ordered_ids or not isinstance(ordered_ids, list):
                self.send_json({"success": False, "message": "ordered_ids array required"}, 400)
                return

            conn = get_connection()
            try:
                for rank, member_id in enumerate(ordered_ids, start=1):
                    conn.execute(
                        "UPDATE move_roster SET officer_order = ? WHERE id = ?;",
                        (rank, int(member_id))
                    )
                conn.commit()
                conn.close()
                self.send_json({"success": True, "message": f"Successfully saved arrangement for {len(ordered_ids)} officers", "count": len(ordered_ids)})
            except Exception as e:
                conn.close()
                self.send_json({"success": False, "error": str(e)}, 500)
            return

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

        # 7. API: Reset Certificate Settings to Default
        if path == "/api/certificate-settings/reset":
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("""
            UPDATE certificate_settings
            SET header_line_1 = 'Republic of the Philippines • City Government of Baguio',
                header_line_2 = 'Men Opposed to Violence Against Women Everywhere (MOVE)',
                header_line_3 = 'Baguio City, Philippines',
                participation_title = 'CERTIFICATE OF PARTICIPATION',
                participation_intro = 'is presented to',
                appreciation_title = 'CERTIFICATE OF APPRECIATION',
                appreciation_intro = 'is presented to',
                appearance_title = 'CERTIFICATE OF APPEARANCE',
                appearance_intro = 'This is to certify that',
                participation_citation = 'for {his/her} active participation and completion of the capacity-building seminar entitled',
                appearance_citation = 'was duly verified to have rendered invaluable service as Resource Speaker / Facilitator in',
                ca_template_formula = 'This is to certify that {title_prefix} {full_name}, {position} of {office}, was duly verified to have attended and participated in the activity entitled “{activity_title}: {activity_theme},” held on {activity_date}, at the {activity_venue}.',
                header_spacing = 0,
                logo_distance = 0
            WHERE id = 1;
            """)
            conn.commit()
            updated = cursor.execute("SELECT * FROM certificate_settings WHERE id = 1;").fetchone()
            conn.close()
            self.send_json({
                "success": True,
                "message": "Certificate settings reset to default",
                "settings": dict(updated)
            })
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
            if field == "is_officer" and val == 1:
                conn.execute("""
                    UPDATE move_roster 
                    SET is_officer = 1,
                        officer_order = CASE 
                            WHEN officer_order IS NULL OR officer_order = 999 
                            THEN (SELECT COALESCE(MAX(officer_order), 0) + 1 FROM move_roster WHERE is_officer = 1)
                            ELSE officer_order 
                        END
                    WHERE id = ?;
                """, (roster_id,))
            elif field == "is_officer" and val == 0:
                conn.execute("UPDATE move_roster SET is_officer = 0, officer_order = 999 WHERE id = ?;", (roster_id,))
            else:
                conn.execute(f"UPDATE move_roster SET {field} = ? WHERE id = ?;", (val, roster_id))
            conn.commit()
            conn.close()
            self.send_json({"success": True, "message": f"Updated {field} = {val} for roster ID {roster_id}"})
            return

        # 1b. API: Update MOVE Roster Member Details (Full Name, Role Title, Position, Office, etc.)
        m_edit_roster = re.match(r"^/api/move-roster/(\d+)$", path)
        if m_edit_roster:
            roster_id = int(m_edit_roster.group(1))
            full_name = str(body.get("full_name", "")).strip().upper()
            if not full_name:
                self.send_json({"success": False, "message": "Personnel Full Name is required"}, 400)
                return

            role_title = str(body.get("role_title", "Member (Cadre)")).strip()
            position = str(body.get("position", "")).strip()
            office = str(body.get("office", "")).strip()
            gender = str(body.get("gender", "M")).strip()
            civil = str(body.get("civil_status", "Married")).strip()
            contact = str(body.get("contact_number", "")).strip()
            notes = str(body.get("notes", "")).strip()

            conn = get_connection()
            cursor = conn.cursor()

            set_clauses = [
                "full_name = ?", "role_title = ?", "position = ?", "office = ?",
                "gender = ?", "civil_status = ?", "contact_number = ?", "notes = ?"
            ]
            params = [full_name, role_title, position, office, gender, civil, contact, notes]

            for f in ["is_member", "is_officer", "is_committee", "is_participant"]:
                if f in body:
                    set_clauses.append(f"{f} = ?")
                    params.append(1 if body[f] else 0)

            params.append(roster_id)
            sql = f"UPDATE move_roster SET {', '.join(set_clauses)} WHERE id = ?;"
            cursor.execute(sql, params)
            conn.commit()

            updated = conn.execute("SELECT * FROM move_roster WHERE id = ?;", (roster_id,)).fetchone()
            conn.close()

            if not updated:
                self.send_json({"success": False, "message": "Member not found"}, 404)
                return

            self.send_json({
                "success": True,
                "message": "MOVE Member updated successfully",
                "member": dict(updated)
            })
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

        # 5. API: Update Signatory (Title, Name, Office)
        m_upd_sig = re.match(r"^/api/signatories/(\d+)$", path)
        if m_upd_sig:
            sig_id = int(m_upd_sig.group(1))
            title = str(body.get("title", "")).strip()
            name = str(body.get("name", "")).strip()
            office = str(body.get("office", "")).strip()

            if not title and not name:
                self.send_json({"success": False, "message": "Signatory title or name is required"}, 400)
                return

            conn = get_connection()
            cursor = conn.cursor()
            existing = cursor.execute("SELECT * FROM signatories WHERE id = ?;", (sig_id,)).fetchone()
            if not existing:
                conn.close()
                self.send_json({"success": False, "message": "Signatory not found"}, 404)
                return

            final_title = title if title else existing["title"]
            final_name = name if name else existing["name"]
            final_office = office if office else existing["office"]

            cursor.execute("""
            UPDATE signatories
            SET title = ?, name = ?, office = ?
            WHERE id = ?;
            """, (final_title, final_name, final_office, sig_id))
            conn.commit()

            updated = cursor.execute("SELECT * FROM signatories WHERE id = ?;", (sig_id,)).fetchone()
            conn.close()

            self.send_json({
                "success": True,
                "message": "Signatory position title updated successfully",
                "signatory": dict(updated)
            })
            return

        # 6. API: Update Certificate Settings (Header lines, Titles, Presentation lines)
        if path == "/api/certificate-settings":
            conn = get_connection()
            cursor = conn.cursor()
            existing = cursor.execute("SELECT * FROM certificate_settings WHERE id = 1;").fetchone()
            existing_dict = dict(existing) if existing else {}

            header_line_1 = str(body.get("header_line_1", existing_dict.get("header_line_1", ""))).strip()
            header_line_2 = str(body.get("header_line_2", existing_dict.get("header_line_2", ""))).strip()
            header_line_3 = str(body.get("header_line_3", existing_dict.get("header_line_3", ""))).strip()
            participation_title = str(body.get("participation_title", existing_dict.get("participation_title", ""))).strip()
            participation_intro = str(body.get("participation_intro", existing_dict.get("participation_intro", ""))).strip()
            appreciation_title = str(body.get("appreciation_title", existing_dict.get("appreciation_title", ""))).strip()
            appreciation_intro = str(body.get("appreciation_intro", existing_dict.get("appreciation_intro", ""))).strip()
            appearance_title = str(body.get("appearance_title", existing_dict.get("appearance_title", ""))).strip()
            appearance_intro = str(body.get("appearance_intro", existing_dict.get("appearance_intro", ""))).strip()
            participation_citation = str(body.get("participation_citation", existing_dict.get("participation_citation", "for {his/her} active participation and completion of the capacity-building seminar entitled"))).strip()
            appearance_citation = str(body.get("appearance_citation", existing_dict.get("appearance_citation", "was duly verified to have rendered invaluable service as Resource Speaker / Facilitator in"))).strip()
            ca_template_formula = str(body.get("ca_template_formula", existing_dict.get("ca_template_formula", "This is to certify that {title_prefix} {full_name}, {position} of {office}, was duly verified to have attended and participated in the activity entitled “{activity_title}: {activity_theme},” held on {activity_date}, at the {activity_venue}."))).strip()
            header_spacing = int(body.get("header_spacing", existing_dict.get("header_spacing", 0)))
            logo_distance = int(body.get("logo_distance", existing_dict.get("logo_distance", 0)))

            cursor.execute("""
            UPDATE certificate_settings
            SET header_line_1 = ?, header_line_2 = ?, header_line_3 = ?,
                participation_title = ?, participation_intro = ?,
                appreciation_title = ?, appreciation_intro = ?,
                appearance_title = ?, appearance_intro = ?,
                participation_citation = ?,
                appearance_citation = ?,
                ca_template_formula = ?,
                header_spacing = ?,
                logo_distance = ?
            WHERE id = 1;
            """, (
                header_line_1, header_line_2, header_line_3,
                participation_title, participation_intro,
                appreciation_title, appreciation_intro,
                appearance_title, appearance_intro,
                participation_citation,
                appearance_citation,
                ca_template_formula,
                header_spacing,
                logo_distance
            ))
            conn.commit()
            updated = cursor.execute("SELECT * FROM certificate_settings WHERE id = 1;").fetchone()
            conn.close()
            self.send_json({
                "success": True,
                "message": "Certificate settings updated successfully",
                "settings": dict(updated)
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
    try:
        sftp_service.warm_cache_in_background()
    except Exception as e:
        print(f"SFTP warm cache notice: {e}")
    with socketserver.TCPServer(("127.0.0.1", PORT), HRISApiHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == "__main__":
    run_server()
