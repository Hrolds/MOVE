import http.server
import socketserver
import json
import os
import re
import html
from datetime import datetime

PORT = 8765
BASE_DIR = r"C:\Users\ALOD\Documents\MOVE"
TARGET_FILE = os.path.join(BASE_DIR, "ALL MALES MARIED WITH TRAINING.xls")
BACKUP_FILE = os.path.join(BASE_DIR, "ALL MALES MARIED WITH TRAINING - LastSave_Backup.xls")

def escape_xml(val):
    if val is None:
        return ""
    s = str(val)
    return html.escape(s)

def build_worksheet_xml(sheet_name, participants):
    rows_xml = []
    # Header Row
    header_cols = [
        "No.", "Orig #", "Full Name", "Gender", "Office", 
        "Position Title", "Appointment", "Age", "Trainings", 
        "Contact Number", "Civil Status", "Start Date", "Selection Status"
    ]
    
    header_cells = "".join([f'<Cell ss:StyleID="s67"><Data ss:Type="String">{escape_xml(h)}</Data></Cell>' for h in header_cols])
    rows_xml.append(f'    <Row ss:Height="22">{header_cells}</Row>')

    for idx, p in enumerate(participants, 1):
        orig_no = escape_xml(p.get("origNo", ""))
        name = escape_xml(p.get("name", ""))
        gender = escape_xml(p.get("gender", "M"))
        office = escape_xml(p.get("office", ""))
        position = escape_xml(p.get("position", ""))
        appointment = escape_xml(p.get("appointment", "PERMANENT"))
        age = p.get("age")
        trainings = p.get("trainings", 0)
        cell = escape_xml(p.get("cell", "") or "-")
        civil = escape_xml(p.get("civilStatus", "Married"))
        start_date = escape_xml(p.get("startDate", ""))
        status = escape_xml(p.get("statusLabel", "Selected Participant"))

        age_cell = f'<Cell ss:StyleID="s66"><Data ss:Type="Number">{age}</Data></Cell>' if age is not None else '<Cell ss:StyleID="s66"><Data ss:Type="String">-</Data></Cell>'
        tr_cell = f'<Cell ss:StyleID="s66"><Data ss:Type="Number">{trainings}</Data></Cell>' if trainings is not None else '<Cell ss:StyleID="s66"><Data ss:Type="Number">0</Data></Cell>'

        row = (
            f'    <Row ss:Height="18">'
            f'<Cell ss:StyleID="s66"><Data ss:Type="Number">{idx}</Data></Cell>'
            f'<Cell ss:StyleID="s66"><Data ss:Type="String">{orig_no}</Data></Cell>'
            f'<Cell ss:StyleID="s64"><Data ss:Type="String">{name}</Data></Cell>'
            f'<Cell ss:StyleID="s66"><Data ss:Type="String">{gender}</Data></Cell>'
            f'<Cell ss:StyleID="s66"><Data ss:Type="String">{office}</Data></Cell>'
            f'<Cell ss:StyleID="s64"><Data ss:Type="String">{position}</Data></Cell>'
            f'<Cell ss:StyleID="s66"><Data ss:Type="String">{appointment}</Data></Cell>'
            f'{age_cell}'
            f'{tr_cell}'
            f'<Cell ss:StyleID="s66"><Data ss:Type="String">{cell}</Data></Cell>'
            f'<Cell ss:StyleID="s66"><Data ss:Type="String">{civil}</Data></Cell>'
            f'<Cell ss:StyleID="s66"><Data ss:Type="String">{start_date}</Data></Cell>'
            f'<Cell ss:StyleID="s66"><Data ss:Type="String">{status}</Data></Cell>'
            f'</Row>'
        )
        rows_xml.append(row)

    rows_str = "\n".join(rows_xml)

    return f"""  <Worksheet ss:Name="{escape_xml(sheet_name)}">
   <Table ss:DefaultRowHeight="16">
    <Column ss:Width="35"/>
    <Column ss:Width="50"/>
    <Column ss:Width="190"/>
    <Column ss:Width="45"/>
    <Column ss:Width="75"/>
    <Column ss:Width="230"/>
    <Column ss:Width="95"/>
    <Column ss:Width="40"/>
    <Column ss:Width="60"/>
    <Column ss:Width="95"/>
    <Column ss:Width="80"/>
    <Column ss:Width="80"/>
    <Column ss:Width="120"/>
{rows_str}
   </Table>
   <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
    <ProtectObjects>False</ProtectObjects>
    <ProtectScenarios>False</ProtectScenarios>
   </WorksheetOptions>
  </Worksheet>
"""

def build_office_summary_xml(participants):
    office_counts = {}
    for p in participants:
        off = p.get("office", "UNKNOWN")
        office_counts[off] = office_counts.get(off, 0) + 1

    total = len(participants)
    rows_xml = []
    header_cols = ["No.", "Office Name", "Selected Participants Count", "Allocation Share %"]
    header_cells = "".join([f'<Cell ss:StyleID="s67"><Data ss:Type="String">{escape_xml(h)}</Data></Cell>' for h in header_cols])
    rows_xml.append(f'    <Row ss:Height="22">{header_cells}</Row>')

    for idx, off in enumerate(sorted(office_counts.keys()), 1):
        cnt = office_counts[off]
        pct = f"{(cnt / total * 100):.1f}%" if total > 0 else "0.0%"
        row = (
            f'    <Row ss:Height="18">'
            f'<Cell ss:StyleID="s66"><Data ss:Type="Number">{idx}</Data></Cell>'
            f'<Cell ss:StyleID="s64"><Data ss:Type="String">{escape_xml(off)}</Data></Cell>'
            f'<Cell ss:StyleID="s66"><Data ss:Type="Number">{cnt}</Data></Cell>'
            f'<Cell ss:StyleID="s66"><Data ss:Type="String">{pct}</Data></Cell>'
            f'</Row>'
        )
        rows_xml.append(row)

    # Total Row
    rows_xml.append(
        f'    <Row ss:Height="20">'
        f'<Cell ss:StyleID="s67"><Data ss:Type="String"></Data></Cell>'
        f'<Cell ss:StyleID="s67"><Data ss:Type="String">TOTAL PARTICIPANTS</Data></Cell>'
        f'<Cell ss:StyleID="s67"><Data ss:Type="Number">{total}</Data></Cell>'
        f'<Cell ss:StyleID="s67"><Data ss:Type="String">100.0%</Data></Cell>'
        f'</Row>'
    )

    rows_str = "\n".join(rows_xml)

    return f"""  <Worksheet ss:Name="Office_Summary">
   <Table ss:DefaultRowHeight="16">
    <Column ss:Width="35"/>
    <Column ss:Width="160"/>
    <Column ss:Width="170"/>
    <Column ss:Width="120"/>
{rows_str}
   </Table>
   <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
    <ProtectObjects>False</ProtectObjects>
    <ProtectScenarios>False</ProtectScenarios>
   </WorksheetOptions>
  </Worksheet>
"""

def save_sheets_to_xls(sheet_name, participants, include_office_summary=True):
    if not os.path.exists(TARGET_FILE):
        return False, f"Target file not found at: {TARGET_FILE}"

    with open(TARGET_FILE, "r", encoding="utf-8") as f:
        xml_content = f.read()

    # Save backup before writing
    with open(BACKUP_FILE, "w", encoding="utf-8") as f:
        f.write(xml_content)

    # Remove existing sheet with this sheet_name if already present
    pattern_sheet = re.compile(
        rf'\s*<Worksheet\s+ss:Name="{re.escape(sheet_name)}">.*?</Worksheet>',
        re.DOTALL
    )
    xml_content = pattern_sheet.sub("", xml_content)

    if include_office_summary:
        pattern_summary = re.compile(
            r'\s*<Worksheet\s+ss:Name="Office_Summary">.*?</Worksheet>',
            re.DOTALL
        )
        xml_content = pattern_summary.sub("", xml_content)

    # Generate new sheet xml
    new_sheets_xml = build_worksheet_xml(sheet_name, participants)
    if include_office_summary:
        new_sheets_xml += "\n" + build_office_summary_xml(participants)

    # Insert before </Workbook>
    idx = xml_content.rfind("</Workbook>")
    if idx == -1:
        return False, "Could not find </Workbook> closing tag in target file"

    updated_xml = xml_content[:idx] + "\n" + new_sheets_xml + xml_content[idx:]

    with open(TARGET_FILE, "w", encoding="utf-8") as f:
        f.write(updated_xml)

    return True, f"Successfully saved sheet '{sheet_name}' ({len(participants)} participants) into ALL MALES MARIED WITH TRAINING.xls"

class HRISSyncHandler(http.server.BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            sheets = []
            if os.path.exists(TARGET_FILE):
                try:
                    with open(TARGET_FILE, "r", encoding="utf-8", errors="ignore") as f:
                        sheets = re.findall(r'<Worksheet\s+ss:Name="([^"]+)"', f.read())
                except Exception:
                    pass
            resp = {
                "status": "online",
                "targetFile": TARGET_FILE,
                "fileExists": os.path.exists(TARGET_FILE),
                "sheets": sheets,
                "timestamp": datetime.now().isoformat()
            }
            self.wfile.write(json.dumps(resp).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/api/save-sheet":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                data = json.loads(body)
                sheet_name = data.get("sheetName", "Selected_Participants").strip() or "Selected_Participants"
                participants = data.get("participants", [])
                include_summary = data.get("includeOfficeSummary", True)

                success, msg = save_sheets_to_xls(sheet_name, participants, include_summary)

                self.send_response(200 if success else 500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                resp = {
                    "success": success,
                    "message": msg,
                    "sheetName": sheet_name,
                    "participantCount": len(participants),
                    "file": TARGET_FILE
                }
                self.wfile.write(json.dumps(resp).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                resp = {"success": False, "message": str(e)}
                self.wfile.write(json.dumps(resp).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == "__main__":
    print(f"Starting HRIS Local Database Sync Server on port {PORT}...")
    print(f"Target Database File: {TARGET_FILE}")
    with socketserver.TCPServer(("127.0.0.1", PORT), HRISSyncHandler) as httpd:
        print(f"Server running at http://127.0.0.1:{PORT}/")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
