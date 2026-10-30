import urllib.request
import json
import time
import re
import os
import sqlite3
from typing import Dict, List, Any, Optional, Tuple

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "move_hris.db")

HRIS_BASE_URL = os.environ.get("HRIS_API_BASE_URL", "http://192.168.3.43:5000")
HRIS_USERNAME = os.environ.get("HRIS_API_USERNAME", "bioman")
HRIS_PASSWORD = os.environ.get("HRIS_API_PASSWORD", "HarHar@951357")

# In-memory and file cache
_hris_token: Optional[str] = None
_hris_token_expiry: float = 0
_hris_cache: Dict[str, Any] = {
    "employees": None,
    "employees_at": 0,
    "departments": None,
    "departments_at": 0
}
CACHE_TTL_SECONDS = 300  # 5 minutes

TOKEN_FILE = os.path.join(BASE_DIR, "data", ".hris_token.json")
DEPTS_FILE = os.path.join(BASE_DIR, "data", ".hris_depts.json")
EMPS_FILE = os.path.join(BASE_DIR, "data", ".hris_employees.json")


def _read_json_file(file_path: str) -> Optional[Any]:
    try:
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return None


def _write_json_file(file_path: str, data: Any):
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False)
    except Exception:
        pass


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def ensure_hris_columns():
    """Ensure move_roster has hris_id and hris_status columns."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(move_roster)")
    columns = [row["name"] for row in cursor.fetchall()]
    if "hris_id" not in columns:
        cursor.execute("ALTER TABLE move_roster ADD COLUMN hris_id INTEGER")
    if "hris_status" not in columns:
        cursor.execute("ALTER TABLE move_roster ADD COLUMN hris_status TEXT DEFAULT 'ACTIVE'")
    conn.commit()
    conn.close()


def norm_str(val: Any) -> str:
    """Normalize string by removing non-alphanumeric chars for robust fuzzy matching."""
    if val is None:
        return ""
    return re.sub(r"[^A-Z0-9]", "", str(val).upper())


def extract_name_tokens(name: str) -> set:
    """Extract individual significant words from a name string."""
    if not name:
        return set()
    cleaned = re.sub(r"[^A-Za-z]", " ", name).upper()
    return set(token for token in cleaned.split() if len(token) >= 2)


def get_hris_token() -> str:
    global _hris_token, _hris_token_expiry
    now = time.time()
    if _hris_token and now < (_hris_token_expiry - 120):
        return _hris_token

    # Check disk cache first to prevent redundant remote auth requests
    cached = _read_json_file(TOKEN_FILE)
    if cached and isinstance(cached, dict):
        t = cached.get("token")
        exp = cached.get("expiry", 0)
        if t and now < (exp - 120):
            _hris_token = t
            _hris_token_expiry = exp
            return _hris_token

    login_url = f"{HRIS_BASE_URL}/api/Authenticate/login"
    payload = json.dumps({"userName": HRIS_USERNAME, "password": HRIS_PASSWORD}).encode("utf-8")
    req = urllib.request.Request(
        login_url,
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            if resp.status != 200:
                raise RuntimeError(f"HRIS login failed with HTTP {resp.status}")
            data = json.loads(resp.read().decode("utf-8"))
            token = data.get("token")
            if not token:
                raise RuntimeError("HRIS login did not return a valid auth token")
            _hris_token = token
            _hris_token_expiry = now + (4 * 3600)  # 4 hours
            _write_json_file(TOKEN_FILE, {"token": token, "expiry": _hris_token_expiry})
            return _hris_token
    except urllib.error.HTTPError as he:
        # If rate limited (429) but we have a stored disk token, reuse it as best effort
        if cached and cached.get("token"):
            _hris_token = cached["token"]
            _hris_token_expiry = now + 3600
            return _hris_token
        raise RuntimeError(f"HRIS login error (HTTP {he.code}): {he.reason}")


def get_hris_departments(force: bool = False) -> Dict[str, str]:
    """Returns mapping of office_Code -> office_Name from HRIS API."""
    now = time.time()
    if not force and _hris_cache["departments"] and (now - _hris_cache["departments_at"] < CACHE_TTL_SECONDS):
        return _hris_cache["departments"]

    # Check disk cache
    if not force:
        disk_depts = _read_json_file(DEPTS_FILE)
        if disk_depts and isinstance(disk_depts, dict) and len(disk_depts) > 0:
            _hris_cache["departments"] = disk_depts
            _hris_cache["departments_at"] = now
            return disk_depts

    try:
        token = get_hris_token()
        url = f"{HRIS_BASE_URL}/api/Department"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
        dept_map = {}
        with urllib.request.urlopen(req, timeout=10) as resp:
            depts = json.loads(resp.read().decode("utf-8"))
            for d in depts:
                code = (d.get("office_Code") or "").strip().upper()
                name = (d.get("office_Name") or "").strip()
                if code:
                    dept_map[code] = name

        _hris_cache["departments"] = dept_map
        _hris_cache["departments_at"] = now
        _write_json_file(DEPTS_FILE, dept_map)
        return dept_map
    except Exception as e:
        # Fallback to disk cache if network error
        disk_depts = _read_json_file(DEPTS_FILE)
        if disk_depts:
            _hris_cache["departments"] = disk_depts
            _hris_cache["departments_at"] = now
            return disk_depts
        raise e


def get_hris_employees(force: bool = False) -> List[Dict[str, Any]]:
    """Returns all 4,719 employee records from HRIS API with disk caching."""
    now = time.time()
    if not force and _hris_cache["employees"] and (now - _hris_cache["employees_at"] < CACHE_TTL_SECONDS):
        return _hris_cache["employees"]

    # Check disk cache
    if not force:
        disk_emps = _read_json_file(EMPS_FILE)
        if disk_emps and isinstance(disk_emps, list) and len(disk_emps) > 0:
            _hris_cache["employees"] = disk_emps
            _hris_cache["employees_at"] = now
            return disk_emps

    try:
        token = get_hris_token()
        url = f"{HRIS_BASE_URL}/api/Employees/ALL"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            employees = json.loads(resp.read().decode("utf-8"))

        _hris_cache["employees"] = employees
        _hris_cache["employees_at"] = now
        _write_json_file(EMPS_FILE, employees)
        return employees
    except Exception as e:
        # Fallback to disk cache if available
        disk_emps = _read_json_file(EMPS_FILE)
        if disk_emps:
            _hris_cache["employees"] = disk_emps
            _hris_cache["employees_at"] = now
            return disk_emps
        raise e


def format_official_office(office_code: str, dept_map: Dict[str, str]) -> str:
    """Format office as 'Full Office Name (CODE)' based on user specification."""
    code = (office_code or "").strip().upper()
    if not code:
        return "City Government of Baguio"

    full_name = dept_map.get(code)
    if not full_name:
        # Fallback check for common variants
        clean_code = code.split("-")[0]
        full_name = dept_map.get(clean_code)

    if full_name:
        if f"({code})" in full_name:
            return full_name
        return f"{full_name} ({code})"
    return code


def match_hris_record(member: Dict[str, Any], hris_list: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Intelligently matches a MOVE roster member against HRIS records."""
    # 0. Check explicit HRIS ID if bound
    explicit_id = member.get("hris_id")
    if explicit_id:
        for e in hris_list:
            if e.get("id") == explicit_id:
                return e

    raw_name = (member.get("full_name") or "").strip()
    norm_member = norm_str(raw_name)
    member_tokens = extract_name_tokens(raw_name)

    # 1. Exact normalized matches (Surname Firstname Middlename / Firstname Middlename Surname)
    for e in hris_list:
        sur = e.get("surname") or ""
        first = e.get("firstname") or ""
        mid = e.get("middlename") or ""
        f1 = norm_str(f"{sur} {first} {mid}")
        f2 = norm_str(f"{first} {mid} {sur}")
        f3 = norm_str(f"{sur} {first}")
        f4 = norm_str(f"{first} {sur}")
        if norm_member in (f1, f2, f3, f4):
            return e

    # 2. Token subset match (all tokens in member name exist in HRIS employee full name)
    if member_tokens:
        for e in hris_list:
            e_str = f"{e.get('surname', '')} {e.get('firstname', '')} {e.get('middlename', '')}"
            e_tokens = extract_name_tokens(e_str)
            if member_tokens and member_tokens.issubset(e_tokens):
                return e

    # 3. Surname + First Word of First Name match
    for e in hris_list:
        sur = norm_str(e.get("surname", ""))
        first_full = (e.get("firstname") or "").strip()
        first_token = first_full.split()[0] if first_full else ""
        if len(sur) >= 3 and sur in member_tokens:
            if first_token and norm_str(first_token) in member_tokens:
                return e

    return None


def compare_roster_with_hris(force: bool = False) -> Dict[str, Any]:
    """Compares all MOVE personnel against the HRIS API and compiles comparison metrics."""
    ensure_hris_columns()
    dept_map = get_hris_departments(force=force)
    hris_list = get_hris_employees(force=force)

    conn = get_db()
    cursor = conn.execute("SELECT * FROM move_roster ORDER BY full_name ASC")
    roster_rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    results = []
    diff_count = 0
    in_sync_count = 0
    inactive_count = 0
    not_found_count = 0

    for r in roster_rows:
        member_id = r["id"]
        member_name = r["full_name"]
        curr_pos = (r.get("position") or "").strip()
        curr_office = (r.get("office") or "").strip()
        move_role = r.get("role_title") or "Member"

        matched_hris = match_hris_record(r, hris_list)

        if matched_hris:
            hris_id = matched_hris.get("id")
            hris_pos = (matched_hris.get("position_Title") or "").strip()
            hris_office_code = (matched_hris.get("office_Code") or "").strip().upper()
            hris_office_formatted = format_official_office(hris_office_code, dept_map)
            hris_status = (matched_hris.get("status") or "ACTIVE").strip().upper()
            hris_appt = (matched_hris.get("appointment") or "PERMANENT").strip().upper()
            hris_official_name = f"{matched_hris.get('surname', '')}, {matched_hris.get('firstname', '')} {matched_hris.get('middlename', '')}".strip()

            # Difference detection
            pos_diff = norm_str(curr_pos) != norm_str(hris_pos)
            
            # Office comparison: check if office code or key tokens exist in current office string
            curr_off_norm = norm_str(curr_office)
            code_norm = norm_str(hris_office_code)
            office_diff = (code_norm not in curr_off_norm) and (curr_off_norm not in code_norm)

            is_inactive = (hris_status != "ACTIVE")
            is_outdated = pos_diff or office_diff or is_inactive

            if is_outdated:
                diff_count += 1
            else:
                in_sync_count += 1

            if is_inactive:
                inactive_count += 1

            results.append({
                "id": member_id,
                "full_name": member_name,
                "move_role": move_role,
                "current_position": curr_pos,
                "current_office": curr_office,
                "hris_id": hris_id,
                "hris_official_name": hris_official_name,
                "hris_position": hris_pos,
                "hris_office_code": hris_office_code,
                "hris_office_formatted": hris_office_formatted,
                "hris_status": hris_status,
                "hris_appointment": hris_appt,
                "has_position_diff": pos_diff,
                "has_office_diff": office_diff,
                "is_inactive": is_inactive,
                "is_outdated": is_outdated,
                "is_matched": True
            })
        else:
            not_found_count += 1
            results.append({
                "id": member_id,
                "full_name": member_name,
                "move_role": move_role,
                "current_position": curr_pos,
                "current_office": curr_office,
                "hris_id": None,
                "hris_official_name": None,
                "hris_position": None,
                "hris_office_code": None,
                "hris_office_formatted": None,
                "hris_status": "UNKNOWN",
                "hris_appointment": None,
                "has_position_diff": False,
                "has_office_diff": False,
                "is_inactive": False,
                "is_outdated": False,
                "is_matched": False
            })

    return {
        "success": True,
        "metrics": {
            "total_roster": len(roster_rows),
            "matched_count": len(roster_rows) - not_found_count,
            "diff_count": diff_count,
            "in_sync_count": in_sync_count,
            "inactive_count": inactive_count,
            "not_found_count": not_found_count,
            "cached_at": _hris_cache["employees_at"]
        },
        "comparison": results
    }


def sync_members(ids: List[int], update_position: bool = True, update_office: bool = True) -> Dict[str, Any]:
    """Applies official HRIS position and/or office to specified MOVE roster IDs."""
    ensure_hris_columns()
    dept_map = get_hris_departments()
    hris_list = get_hris_employees()

    conn = get_db()
    cursor = conn.cursor()

    updated = []
    skipped = []

    for mid in ids:
        row = cursor.execute("SELECT * FROM move_roster WHERE id = ?", (mid,)).fetchone()
        if not row:
            skipped.append({"id": mid, "reason": "Member ID not found"})
            continue

        member = dict(row)
        matched_hris = match_hris_record(member, hris_list)
        if not matched_hris:
            skipped.append({"id": mid, "name": member["full_name"], "reason": "Not matched in HRIS"})
            continue

        hris_id = matched_hris.get("id")
        hris_pos = (matched_hris.get("position_Title") or "").strip()
        hris_office_code = (matched_hris.get("office_Code") or "").strip().upper()
        hris_office_formatted = format_official_office(hris_office_code, dept_map)
        hris_status = (matched_hris.get("status") or "ACTIVE").strip().upper()

        new_pos = hris_pos if update_position and hris_pos else member["position"]
        new_office = hris_office_formatted if update_office and hris_office_formatted else member["office"]

        cursor.execute("""
            UPDATE move_roster
            SET position = ?, office = ?, hris_id = ?, hris_status = ?
            WHERE id = ?
        """, (new_pos, new_office, hris_id, hris_status, mid))

        # Also cascade to municipal_employees_search_pool if same person exists
        cursor.execute("""
            UPDATE municipal_employees_search_pool
            SET position = ?, office = ?
            WHERE UPPER(TRIM(full_name)) = UPPER(TRIM(?))
        """, (new_pos, new_office, member["full_name"]))

        updated.append({
            "id": mid,
            "name": member["full_name"],
            "previous_position": member["position"],
            "updated_position": new_pos,
            "previous_office": member["office"],
            "updated_office": new_office,
            "hris_id": hris_id,
            "hris_status": hris_status
        })

    conn.commit()
    conn.close()

    return {
        "success": True,
        "updated_count": len(updated),
        "skipped_count": len(skipped),
        "updated": updated,
        "skipped": skipped
    }


def link_manual_hris_id(member_id: int, hris_id: int, apply_sync: bool = True) -> Dict[str, Any]:
    """Manually links an exact HRIS ID to a MOVE roster member and optionally syncs details."""
    ensure_hris_columns()
    dept_map = get_hris_departments()
    hris_list = get_hris_employees()

    matched_hris = next((e for e in hris_list if e.get("id") == hris_id), None)
    if not matched_hris:
        return {"success": False, "error": f"HRIS ID #{hris_id} was not found in the HRIS directory"}

    conn = get_db()
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM move_roster WHERE id = ?", (member_id,)).fetchone()
    if not row:
        conn.close()
        return {"success": False, "error": f"Member ID #{member_id} not found in MOVE roster"}

    member = dict(row)
    hris_pos = (matched_hris.get("position_Title") or "").strip()
    hris_office_code = (matched_hris.get("office_Code") or "").strip().upper()
    hris_office_formatted = format_official_office(hris_office_code, dept_map)
    hris_status = (matched_hris.get("status") or "ACTIVE").strip().upper()

    new_pos = hris_pos if apply_sync and hris_pos else member["position"]
    new_office = hris_office_formatted if apply_sync and hris_office_formatted else member["office"]

    cursor.execute("""
        UPDATE move_roster
        SET hris_id = ?, hris_status = ?, position = ?, office = ?
        WHERE id = ?
    """, (hris_id, hris_status, new_pos, new_office, member_id))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "member_id": member_id,
        "hris_id": hris_id,
        "hris_official_name": f"{matched_hris.get('surname', '')}, {matched_hris.get('firstname', '')}",
        "updated_position": new_pos,
        "updated_office": new_office,
        "hris_status": hris_status
    }
