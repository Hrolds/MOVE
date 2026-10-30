import sqlite3
import os
from typing import Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "move_hris.db")

def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Separate search pool for municipal employees (747 personnel)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS municipal_employees_search_pool (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orig_no TEXT,
        full_name TEXT NOT NULL,
        position TEXT,
        gender TEXT DEFAULT 'M',
        civil_status TEXT DEFAULT 'Married',
        office TEXT,
        appointment TEXT DEFAULT 'PERMANENT',
        contact_number TEXT
    );
    """)

    # 2. Dedicated MOVE Chapter Roster with toggleable status flags
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS move_roster (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        position TEXT,
        gender TEXT DEFAULT 'M',
        civil_status TEXT DEFAULT 'Married',
        office TEXT,
        contact_number TEXT,
        role_title TEXT DEFAULT 'Member',
        is_member INTEGER DEFAULT 1,
        is_officer INTEGER DEFAULT 0,
        is_committee INTEGER DEFAULT 0,
        is_participant INTEGER DEFAULT 0,
        notes TEXT,
        hris_id INTEGER,
        hris_status TEXT DEFAULT 'ACTIVE'
    );
    """)

    cursor.execute("PRAGMA table_info(move_roster)")
    mr_cols = [r["name"] for r in cursor.fetchall()]
    if "hris_id" not in mr_cols:
        cursor.execute("ALTER TABLE move_roster ADD COLUMN hris_id INTEGER")
    if "hris_status" not in mr_cols:
        cursor.execute("ALTER TABLE move_roster ADD COLUMN hris_status TEXT DEFAULT 'ACTIVE'")

    # 3. Activities / Seminars table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        theme TEXT,
        activity_date TEXT,
        venue TEXT,
        duration_hours TEXT DEFAULT '8 Hours',
        trainer_name TEXT,
        trainer_position TEXT,
        target_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 4. Activity Attendees & Live Attendance checklist
    # Note: is_present (1 or 0) gates certificate generation!
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activity_attendees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
        move_roster_id INTEGER REFERENCES move_roster(id) ON DELETE SET NULL,
        full_name TEXT NOT NULL,
        position TEXT,
        gender TEXT DEFAULT 'M',
        civil_status TEXT DEFAULT 'Married',
        office TEXT,
        contact_number TEXT,
        is_present INTEGER DEFAULT 0,
        check_in_time TEXT,
        notes TEXT
    );
    """)

    # 4b. Ensure uniqueness of attendee per activity
    cursor.execute("""
    CREATE UNIQUE INDEX IF NOT EXISTS idx_activity_attendees_unique 
    ON activity_attendees(activity_id, UPPER(TRIM(full_name)));
    """)

    # 4c. Activity Facilitators, Trainers, and Resource Speakers
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activity_facilitators (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
        move_roster_id INTEGER REFERENCES move_roster(id) ON DELETE SET NULL,
        full_name TEXT NOT NULL,
        role_title TEXT DEFAULT 'Facilitator',
        position TEXT,
        office TEXT,
        gender TEXT DEFAULT 'M',
        civil_status TEXT DEFAULT 'Married',
        contact_number TEXT,
        is_present INTEGER DEFAULT 1,
        check_in_time TEXT,
        notes TEXT
    );
    """)

    cursor.execute("""
    CREATE UNIQUE INDEX IF NOT EXISTS idx_activity_facilitators_unique 
    ON activity_facilitators(activity_id, UPPER(TRIM(full_name)));
    """)

    # 5. Signatories registry
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS signatories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        office TEXT,
        signature_image TEXT,
        is_default INTEGER DEFAULT 0
    );
    """)

    # 6. Issued certificates registry
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS issued_certificates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
        attendee_id INTEGER REFERENCES activity_attendees(id) ON DELETE CASCADE,
        cert_type TEXT NOT NULL, -- 'participation', 'appearance', 'appreciation'
        serial_no TEXT UNIQUE,
        signatory_1_id INTEGER REFERENCES signatories(id),
        signatory_2_id INTEGER REFERENCES signatories(id),
        signatory_3_id INTEGER REFERENCES signatories(id),
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 7. Certificate Header, Title, and Presentation Settings
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS certificate_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        header_line_1 TEXT DEFAULT 'Republic of the Philippines • City Government of Baguio',
        header_line_2 TEXT DEFAULT 'Men Opposed to Violence Against Women Everywhere (MOVE)',
        header_line_3 TEXT DEFAULT 'Baguio City, Philippines',
        participation_title TEXT DEFAULT 'CERTIFICATE OF PARTICIPATION',
        participation_intro TEXT DEFAULT 'is presented to',
        appreciation_title TEXT DEFAULT 'CERTIFICATE OF APPRECIATION',
        appreciation_intro TEXT DEFAULT 'is presented to',
        appearance_title TEXT DEFAULT 'CERTIFICATE OF APPEARANCE',
        appearance_intro TEXT DEFAULT 'This is to certify that',
        participation_citation TEXT DEFAULT 'for {his/her} active participation and completion of the capacity-building seminar entitled'
    );
    """)

    cursor.execute("""
    INSERT OR IGNORE INTO certificate_settings (
        id, header_line_1, header_line_2, header_line_3,
        participation_title, participation_intro,
        appreciation_title, appreciation_intro,
        appearance_title, appearance_intro,
        participation_citation
    ) VALUES (
        1,
        'Republic of the Philippines • City Government of Baguio',
        'Men Opposed to Violence Against Women Everywhere (MOVE)',
        'Baguio City, Philippines',
        'CERTIFICATE OF PARTICIPATION',
        'is presented to',
        'CERTIFICATE OF APPRECIATION',
        'is presented to',
        'CERTIFICATE OF APPEARANCE',
        'This is to certify that',
        'for {his/her} active participation and completion of the capacity-building seminar entitled'
    );
    """)

    conn.commit()
    conn.close()
    print("SQLite database initialized at:", DB_PATH)

if __name__ == "__main__":
    init_db()
