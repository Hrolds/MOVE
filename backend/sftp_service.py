import os
import sqlite3
import threading
from typing import Optional, Tuple

try:
    import paramiko
except ImportError:
    paramiko = None

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "move_hris.db")
CACHE_DIR = os.path.join(BASE_DIR, "data", "profile_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

SFTP_HOST = os.environ.get("ID_MAKER_SFTP_HOST", "192.168.3.18")
SFTP_PORT = int(os.environ.get("ID_MAKER_SFTP_PORT", 22))
SFTP_USER = os.environ.get("ID_MAKER_SFTP_USERNAME", "igris")
SFTP_PASS = os.environ.get("ID_MAKER_SFTP_PASSWORD", "Arise")
SFTP_ROOT = os.environ.get("ID_MAKER_SFTP_ROOT", "dots/biometrics")

_sftp_lock = threading.Lock()


def find_cached_photo(hris_id: int) -> Optional[Tuple[str, str]]:
    """Check if the photo is already downloaded in local profile_cache."""
    for ext, mime in [(".png", "image/png"), (".jpg", "image/jpeg"), (".jpeg", "image/jpeg")]:
        candidate = os.path.join(CACHE_DIR, f"{hris_id}{ext}")
        if os.path.exists(candidate) and os.path.getsize(candidate) > 100:
            return candidate, mime
    return None


def fetch_from_sftp(hris_id: int) -> Optional[Tuple[str, str]]:
    """Connect to SFTP server and download employee profile picture."""
    if not paramiko:
        return None

    remote_candidates = [
        f"{SFTP_ROOT}/{hris_id}/profile/profile.png",
        f"{SFTP_ROOT}/{hris_id}/profile/profile.jpg",
        f"{SFTP_ROOT}/{hris_id}/profile/PVC.png",
        f"{SFTP_ROOT}/{hris_id}/profile.png",
        f"{SFTP_ROOT}/{hris_id}/profile.jpg",
        f"{SFTP_ROOT}/ojt/{hris_id}/profile/profile.png",
        f"{SFTP_ROOT}/ojt/{hris_id}/profile.png",
    ]

    with _sftp_lock:
        ssh = None
        sftp = None
        try:
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(SFTP_HOST, port=SFTP_PORT, username=SFTP_USER, password=SFTP_PASS, timeout=4)
            sftp = ssh.open_sftp()

            for cand in remote_candidates:
                try:
                    ext = os.path.splitext(cand)[1].lower()
                    if ext not in [".png", ".jpg", ".jpeg"]:
                        ext = ".png"
                    local_target = os.path.join(CACHE_DIR, f"{hris_id}{ext}")
                    sftp.get(cand, local_target)
                    if os.path.exists(local_target) and os.path.getsize(local_target) > 100:
                        mime = "image/png" if ext == ".png" else "image/jpeg"
                        return local_target, mime
                except Exception:
                    continue
        except Exception as e:
            print(f"[sftp_service] Connection error for #{hris_id}: {e}")
        finally:
            if sftp:
                try:
                    sftp.close()
                except Exception:
                    pass
            if ssh:
                try:
                    ssh.close()
                except Exception:
                    pass

    return None


def get_profile_photo_for_hris_id(hris_id: int) -> Optional[Tuple[str, str]]:
    """Retrieve profile photo for a given HRIS ID, from disk cache or SFTP."""
    cached = find_cached_photo(hris_id)
    if cached:
        return cached

    return fetch_from_sftp(hris_id)


def get_profile_photo_for_roster_id(roster_id: int) -> Optional[Tuple[str, str]]:
    """Retrieve profile photo for a given MOVE roster member ID."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    row = conn.execute("SELECT hris_id FROM move_roster WHERE id = ?", (roster_id,)).fetchone()
    conn.close()

    if not row or not row["hris_id"]:
        return None

    return get_profile_photo_for_hris_id(int(row["hris_id"]))


def warm_cache_in_background():
    """Background worker to pre-cache photos for all roster personnel."""
    def _worker():
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            rows = conn.execute("SELECT id, hris_id FROM move_roster WHERE hris_id IS NOT NULL").fetchall()
            conn.close()

            missing = []
            for r in rows:
                hid = r["hris_id"]
                if not find_cached_photo(hid):
                    missing.append(hid)

            if not missing:
                return

            print(f"[sftp_service] Pre-caching photos for {len(missing)} roster personnel...")
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(SFTP_HOST, port=SFTP_PORT, username=SFTP_USER, password=SFTP_PASS, timeout=5)
            sftp = ssh.open_sftp()

            for hid in missing:
                for cand in [
                    f"{SFTP_ROOT}/{hid}/profile/profile.png",
                    f"{SFTP_ROOT}/{hid}/profile/profile.jpg",
                    f"{SFTP_ROOT}/{hid}/profile/PVC.png",
                    f"{SFTP_ROOT}/{hid}/profile.png",
                    f"{SFTP_ROOT}/{hid}/profile.jpg",
                ]:
                    try:
                        ext = os.path.splitext(cand)[1].lower()
                        dest = os.path.join(CACHE_DIR, f"{hid}{ext}")
                        sftp.get(cand, dest)
                        break
                    except Exception:
                        pass

            sftp.close()
            ssh.close()
            print("[sftp_service] Background photo cache warming complete.")
        except Exception as e:
            print(f"[sftp_service] Warm cache error: {e}")

    t = threading.Thread(target=_worker, daemon=True)
    t.start()
