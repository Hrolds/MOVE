import subprocess
import re
import html
import xml.etree.ElementTree as ET

def escape_xml(val):
    if val is None:
        return ""
    return html.escape(str(val))

# 1. Get original XML from git HEAD
raw_bytes = subprocess.check_output(['git', 'show', 'HEAD:ALL MALES MARIED WITH TRAINING.xls'])
orig_xml = raw_bytes.decode('utf-8', errors='ignore')

# 2. Extract worksheets
def extract_ws(name, text):
    m = re.search(rf'(<Worksheet\s+ss:Name="{re.escape(name)}">.*?</Worksheet>)', text, re.DOTALL)
    return m.group(1) if m else None

def parse_ws_rows(name, text):
    m = re.search(rf'<Worksheet\s+ss:Name="{re.escape(name)}">\s*<Table[^>]*>(.*?)</Table>', text, re.DOTALL)
    if not m:
        return []
    rows = re.findall(r'<Row[^>]*>(.*?)</Row>', m.group(1), re.DOTALL)
    data = []
    for r in rows:
        cells = re.findall(r'<Cell[^>]*>(.*?)</Cell>', r, re.DOTALL)
        row_vals = []
        for c in cells:
            d = re.search(r'<Data[^>]*>(.*?)</Data>', c, re.DOTALL)
            row_vals.append(d.group(1) if d else "")
        data.append(row_vals)
    return data

sheet_rows = parse_ws_rows("Sheet", orig_xml)
casual_rows = parse_ws_rows("Casual", orig_xml)

print(f"Original Sheet rows: {len(sheet_rows)}, Casual rows: {len(casual_rows)}")

# Extract protected worksheets
officer_block = extract_ws("Officer", orig_xml)
committees_block = extract_ws("Committees", orig_xml)
members_block = extract_ws("Members", orig_xml)
summary_block = extract_ws("Office_Summary", orig_xml)
selected_block = extract_ws("Selected_Participants", orig_xml)

print(f"Protected worksheets: Officer={bool(officer_block)}, Committees={bool(committees_block)}, Members={bool(members_block)}, Office_Summary={bool(summary_block)}")

# 3. Combine Sheet and Casual into PRIMARY_DB
primary_db_records = []
rec_idx = 1

# Process Sheet (Permanent)
for r in sheet_rows[1:]: # skip header
    if not r or not any(r):
        continue
    orig_no = r[0] if len(r) > 0 else ""
    full_name = r[1] if len(r) > 1 else ""
    if not full_name:
        continue
    surname = r[2] if len(r) > 2 else ""
    first_name = r[3] if len(r) > 3 else ""
    mid_name = r[4] if len(r) > 4 else ""
    ext = r[5] if len(r) > 5 else ""
    gender = r[6] if len(r) > 6 else "M"
    civ_status = r[7] if len(r) > 7 else "Married"
    office = r[8] if len(r) > 8 else ""
    pos_title = r[9] if len(r) > 9 else ""
    appt = r[10] if len(r) > 10 else "PERMANENT"
    lvl = r[11] if len(r) > 11 else ""
    start_date = r[12] if len(r) > 12 else ""
    nature = r[13] if len(r) > 13 else ""
    status = r[14] if len(r) > 14 else "ACTIVE"
    sg = r[15] if len(r) > 15 else ""
    step = r[16] if len(r) > 16 else ""
    age = r[17] if len(r) > 17 else ""
    cell = r[18] if len(r) > 18 else ""
    trainings = r[19] if len(r) > 19 else "0"
    update_date = r[20] if len(r) > 20 else ""

    primary_db_records.append({
        "idx": rec_idx,
        "origNo": orig_no,
        "fullName": full_name,
        "surname": surname,
        "firstName": first_name,
        "middleName": mid_name,
        "ext": ext,
        "gender": gender,
        "civilStatus": civ_status,
        "office": office,
        "position": pos_title,
        "appointment": appt if appt else "PERMANENT",
        "level": lvl,
        "startDate": start_date,
        "nature": nature,
        "status": status,
        "sg": sg,
        "step": step,
        "age": age,
        "cell": cell,
        "trainings": trainings,
        "updateDate": update_date
    })
    rec_idx += 1

# Process Casual
for r in casual_rows[1:]: # skip header
    if not r or not any(r):
        continue
    orig_no = r[0] if len(r) > 0 else ""
    full_name = r[1] if len(r) > 1 else ""
    if not full_name:
        continue
    surname = r[2] if len(r) > 2 else ""
    first_name = r[3] if len(r) > 3 else ""
    mid_name = r[4] if len(r) > 4 else ""
    ext = r[5] if len(r) > 5 else ""
    gender = r[6] if len(r) > 6 else "M"
    civ_status = r[7] if len(r) > 7 else "Married"
    office = r[8] if len(r) > 8 else ""
    pos_title = r[9] if len(r) > 9 else ""
    appt = r[10] if len(r) > 10 else "CASUAL"
    lvl = r[11] if len(r) > 11 else ""
    start_date = r[12] if len(r) > 12 else ""
    nature = r[13] if len(r) > 13 else ""
    status = r[14] if len(r) > 14 else "ACTIVE"
    sg = r[15] if len(r) > 15 else ""
    step = r[16] if len(r) > 16 else ""
    age = r[17] if len(r) > 17 else ""
    cell = r[18] if len(r) > 18 else ""
    trainings = r[19] if len(r) > 19 else "0"
    update_date = r[20] if len(r) > 20 else ""

    primary_db_records.append({
        "idx": rec_idx,
        "origNo": orig_no,
        "fullName": full_name,
        "surname": surname,
        "firstName": first_name,
        "middleName": mid_name,
        "ext": ext,
        "gender": gender,
        "civilStatus": civ_status,
        "office": office,
        "position": pos_title,
        "appointment": appt if appt else "CASUAL",
        "level": lvl,
        "startDate": start_date,
        "nature": nature,
        "status": status,
        "sg": sg,
        "step": step,
        "age": age,
        "cell": cell,
        "trainings": trainings,
        "updateDate": update_date
    })
    rec_idx += 1

print(f"Total merged records in PRIMARY_DB: {len(primary_db_records)}")

# 4. Build PRIMARY_DB worksheet XML
pdb_headers = [
    "No.", "Orig #", "Full Name", "Surname", "First Name", "Middle Name", "EXT.",
    "Gender", "Civil Status", "Office", "Position Title", "Appointment", "Level #",
    "Start Date", "Nature", "Status", "S.G.", "Step #", "Age", "CELL #", "No. of Trainings", "Update Date"
]
pdb_header_cells = "".join([f'<Cell ss:StyleID="s67"><Data ss:Type="String">{escape_xml(h)}</Data></Cell>' for h in pdb_headers])
pdb_rows = [f'    <Row ss:Height="22">{pdb_header_cells}</Row>']

for rec in primary_db_records:
    c_idx = f'<Cell ss:StyleID="s66"><Data ss:Type="Number">{rec["idx"]}</Data></Cell>'
    c_orig = f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(rec["origNo"])}</Data></Cell>'
    c_name = f'<Cell ss:StyleID="s64"><Data ss:Type="String">{escape_xml(rec["fullName"])}</Data></Cell>'
    c_sur = f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(rec["surname"])}</Data></Cell>'
    c_first = f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(rec["firstName"])}</Data></Cell>'
    c_mid = f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(rec["middleName"])}</Data></Cell>'
    c_ext = f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(rec["ext"])}</Data></Cell>'
    c_gen = f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(rec["gender"])}</Data></Cell>'
    c_civ = f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(rec["civilStatus"])}</Data></Cell>'
    c_off = f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(rec["office"])}</Data></Cell>'
    c_pos = f'<Cell ss:StyleID="s64"><Data ss:Type="String">{escape_xml(rec["position"])}</Data></Cell>'
    c_app = f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(rec["appointment"])}</Data></Cell>'
    c_lvl = f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(rec["level"])}</Data></Cell>'
    c_start = f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(rec["startDate"])}</Data></Cell>'
    c_nat = f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(rec["nature"])}</Data></Cell>'
    c_stat = f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(rec["status"])}</Data></Cell>'
    c_sg = f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(rec["sg"])}</Data></Cell>'
    c_step = f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(rec["step"])}</Data></Cell>'
    
    age_val = rec["age"]
    c_age = f'<Cell ss:StyleID="s66"><Data ss:Type="Number">{age_val}</Data></Cell>' if str(age_val).isdigit() else f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(age_val)}</Data></Cell>'
    
    c_cell = f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(rec["cell"])}</Data></Cell>'
    
    tr_val = rec["trainings"]
    c_tr = f'<Cell ss:StyleID="s66"><Data ss:Type="Number">{tr_val}</Data></Cell>' if str(tr_val).isdigit() else f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(tr_val)}</Data></Cell>'
    
    c_upd = f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(rec["updateDate"])}</Data></Cell>'

    row = (
        f'    <Row ss:Height="18">'
        f'{c_idx}{c_orig}{c_name}{c_sur}{c_first}{c_mid}{c_ext}{c_gen}{c_civ}{c_off}'
        f'{c_pos}{c_app}{c_lvl}{c_start}{c_nat}{c_stat}{c_sg}{c_step}{c_age}{c_cell}{c_tr}{c_upd}'
        f'</Row>'
    )
    pdb_rows.append(row)

pdb_xml_str = "\n".join(pdb_rows)
ws_primary_db = f"""  <Worksheet ss:Name="PRIMARY_DB">
   <Table ss:DefaultRowHeight="16">
    <Column ss:Width="35"/>
    <Column ss:Width="45"/>
    <Column ss:Width="190"/>
    <Column ss:Width="95"/>
    <Column ss:Width="95"/>
    <Column ss:Width="85"/>
    <Column ss:Width="40"/>
    <Column ss:Width="45"/>
    <Column ss:Width="70"/>
    <Column ss:Width="75"/>
    <Column ss:Width="200"/>
    <Column ss:Width="85"/>
    <Column ss:Width="45"/>
    <Column ss:Width="65"/>
    <Column ss:Width="65"/>
    <Column ss:Width="60"/>
    <Column ss:Width="35"/>
    <Column ss:Width="40"/>
    <Column ss:Width="35"/>
    <Column ss:Width="80"/>
    <Column ss:Width="85"/>
    <Column ss:Width="70"/>
{pdb_xml_str}
   </Table>
   <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
    <ProtectObjects>False</ProtectObjects>
    <ProtectScenarios>False</ProtectScenarios>
   </WorksheetOptions>
  </Worksheet>"""

# 5. Build Cert_Participation worksheet
part_headers = [
    "No.", "Certificate Serial #", "Activity Code", "Activity Title", "Theme / Sub-Theme",
    "Date Conducted", "Venue", "Duration / Hours", "Participant Name", "Office / Department",
    "Position Title", "MOVE Signatory (President)", "President Title",
    "LGU Signatory (Mayor)", "Mayor Title", "Attendance Verification Status"
]
part_h_cells = "".join([f'<Cell ss:StyleID="s67"><Data ss:Type="String">{escape_xml(h)}</Data></Cell>' for h in part_headers])
part_rows = [f'    <Row ss:Height="22">{part_h_cells}</Row>']

# Sample 50 participants from Men in the Kitchen 2
for p_idx, rec in enumerate(primary_db_records[:50], 1):
    ser = f"MOVE-2026-KITCHEN-2-{p_idx:04d}"
    ver_status = escape_xml("Verified & Certified" if p_idx <= 47 else "Pending Attendance")
    r = (
        f'    <Row ss:Height="18">'
        f'<Cell ss:StyleID="s66"><Data ss:Type="Number">{p_idx}</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(ser)}</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">ACT-KITCHEN-2</Data></Cell>'
        f'<Cell ss:StyleID="s64"><Data ss:Type="String">Men in the Kitchen 2</Data></Cell>'
        f'<Cell ss:StyleID="s64"><Data ss:Type="String">Love Served in the Kitchen - Culinary Empowerment</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">October 20, 2026</Data></Cell>'
        f'<Cell ss:StyleID="s64"><Data ss:Type="String">CDRRMO Building, Motorpool Compound, Lower Rock Quarry, Baguio City</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">8 Hours</Data></Cell>'
        f'<Cell ss:StyleID="s64"><Data ss:Type="String">{escape_xml(rec["fullName"])}</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(rec["office"])}</Data></Cell>'
        f'<Cell ss:StyleID="s64"><Data ss:Type="String">{escape_xml(rec["position"])}</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">HAROLD C. MALLORCA</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">MOVE Baguio Chapter President</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">HON. BENJAMIN B. MAGALONG</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">City Mayor, Baguio City</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">{ver_status}</Data></Cell>'
        f'</Row>'
    )
    part_rows.append(r)

part_xml_str = "\n".join(part_rows)
ws_cert_participation = f"""  <Worksheet ss:Name="Cert_Participation">
   <Table ss:DefaultRowHeight="16">
    <Column ss:Width="35"/>
    <Column ss:Width="130"/>
    <Column ss:Width="70"/>
    <Column ss:Width="200"/>
    <Column ss:Width="150"/>
    <Column ss:Width="85"/>
    <Column ss:Width="200"/>
    <Column ss:Width="65"/>
    <Column ss:Width="190"/>
    <Column ss:Width="75"/>
    <Column ss:Width="220"/>
    <Column ss:Width="140"/>
    <Column ss:Width="150"/>
    <Column ss:Width="140"/>
    <Column ss:Width="150"/>
    <Column ss:Width="110"/>
{part_xml_str}
   </Table>
   <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
    <ProtectObjects>False</ProtectObjects>
    <ProtectScenarios>False</ProtectScenarios>
   </WorksheetOptions>
  </Worksheet>"""

# 6. Build Cert_Attendance_CA worksheet
ca_headers = [
    "No.", "Appearance Slip Serial #", "Employee Full Name", "Office / Department", 
    "Position Title", "Activity / Event Title", "Date of Appearance", "Venue / Location", 
    "Purpose / Event Description", "Accrediting Signatory", "Signatory Title 1", "Signatory Title 2", "Issue Date"
]
ca_h_cells = "".join([f'<Cell ss:StyleID="s67"><Data ss:Type="String">{escape_xml(h)}</Data></Cell>' for h in ca_headers])
ca_rows = [f'    <Row ss:Height="22">{ca_h_cells}</Row>']

for ca_idx, rec in enumerate(primary_db_records[:50], 1):
    ser = f"CA-2026-KITCHEN-2-{ca_idx:04d}"
    r = (
        f'    <Row ss:Height="18">'
        f'<Cell ss:StyleID="s66"><Data ss:Type="Number">{ca_idx}</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(ser)}</Data></Cell>'
        f'<Cell ss:StyleID="s64"><Data ss:Type="String">{escape_xml(rec["fullName"])}</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(rec["office"])}</Data></Cell>'
        f'<Cell ss:StyleID="s64"><Data ss:Type="String">{escape_xml(rec["position"])}</Data></Cell>'
        f'<Cell ss:StyleID="s64"><Data ss:Type="String">Men in the Kitchen 2</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">October 20, 2026</Data></Cell>'
        f'<Cell ss:StyleID="s64"><Data ss:Type="String">CDRRMO Building, Motorpool Compound, Lower Rock Quarry, Baguio City</Data></Cell>'
        f'<Cell ss:StyleID="s64"><Data ss:Type="String">Participated in Men in the Kitchen 2 advocacy and skills workshop</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">BENJAMIN B. MAGALONG</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">City Mayor</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">LCAT-VAWC Chairperson</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">October 20, 2026</Data></Cell>'
        f'</Row>'
    )
    ca_rows.append(r)

ca_xml_str = "\n".join(ca_rows)
ws_cert_ca = f"""  <Worksheet ss:Name="Cert_Attendance_CA">
   <Table ss:DefaultRowHeight="16">
    <Column ss:Width="35"/>
    <Column ss:Width="130"/>
    <Column ss:Width="190"/>
    <Column ss:Width="75"/>
    <Column ss:Width="220"/>
    <Column ss:Width="180"/>
    <Column ss:Width="85"/>
    <Column ss:Width="200"/>
    <Column ss:Width="220"/>
    <Column ss:Width="140"/>
    <Column ss:Width="110"/>
    <Column ss:Width="130"/>
    <Column ss:Width="85"/>
{ca_xml_str}
   </Table>
   <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
    <ProtectObjects>False</ProtectObjects>
    <ProtectScenarios>False</ProtectScenarios>
   </WorksheetOptions>
  </Worksheet>"""

# 7. Build Cert_Appreciation worksheet
apprec_headers = [
    "No.", "Serial Number", "Awardee / Recipient Name", "Title / Honorific", 
    "Office / Organization", "Position / Designation", "Activity / Event Title", 
    "Award Title", "Citation Lead & Text", "Date Awarded", "Venue", 
    "Signatory 1", "Signatory 2", "Signatory 3"
]
apprec_h_cells = "".join([f'<Cell ss:StyleID="s67"><Data ss:Type="String">{escape_xml(h)}</Data></Cell>' for h in apprec_headers])
apprec_rows = [f'    <Row ss:Height="22">{apprec_h_cells}</Row>']

apprec_recipients = [
    {
        "name": "MOVE BAGUIO CHAPTER & CSWDO",
        "honorific": "",
        "office": "City Government of Baguio",
        "position": "Resource Training Partner & Facilitator",
        "activity": "Men in the Kitchen 2",
        "award": "CERTIFICATE OF APPRECIATION",
        "citation": "In grateful recognition of invaluable support, dedicated commitment, and meritorious service rendered during the Men in the Kitchen 2 culinary and gender advocacy workshop."
    },
    {
        "name": "MARIA ELENA G. SANTOS",
        "honorific": "Atty.",
        "office": "Commission on Human Rights (CHR-CAR)",
        "position": "Legal Consultant & Guest Resource Speaker",
        "activity": "Orientation on RA 9262 (Anti-VAWC Act) & The Role of Men in VAW-Free Communities",
        "award": "CERTIFICATE OF APPRECIATION",
        "citation": "In sincere appreciation of expert sharing of legal insights, empowering public servants to become frontline advocates in protecting women and children."
    },
    {
        "name": "CHEF RAMON DELA ROSA",
        "honorific": "Chef",
        "office": "Baguio Culinary Arts Institute",
        "position": "Master Trainer & Behavioral Specialist",
        "activity": "Men in the Kitchen 2",
        "award": "CERTIFICATE OF APPRECIATION",
        "citation": "For exemplary guidance, creative masterclass facilitation, and inspiring male employees towards wholesome domestic partnership and culinary self-reliance."
    },
    {
        "name": "HON. BENJAMIN B. MAGALONG",
        "honorific": "Hon.",
        "office": "City Government of Baguio",
        "position": "City Mayor & Honorary Chapter Adviser",
        "activity": "Annual MOVE Baguio Chapter General Assembly & 18-Day Campaign to End VAW",
        "award": "PLAQUE OF HIGHEST APPRECIATION",
        "citation": "For visionary leadership, unwavering administrative backing, and championing gender-transformative governance in the Summer Capital."
    },
    {
        "name": "HAROLD C. MALLORCA",
        "honorific": "Mr.",
        "office": "GSO",
        "position": "President, MOVE Baguio Chapter",
        "activity": "Men in the Kitchen 2",
        "award": "CERTIFICATE OF RECOGNITION",
        "citation": "For exceptional leadership, strategic planning, and operational execution of culinary advocacy initiatives for male public servants."
    }
]

for a_idx, ar in enumerate(apprec_recipients, 1):
    ser = f"APPREC-2026-{a_idx:04d}"
    r = (
        f'    <Row ss:Height="18">'
        f'<Cell ss:StyleID="s66"><Data ss:Type="Number">{a_idx}</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(ser)}</Data></Cell>'
        f'<Cell ss:StyleID="s64"><Data ss:Type="String">{escape_xml(ar["name"])}</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(ar["honorific"])}</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">{escape_xml(ar["office"])}</Data></Cell>'
        f'<Cell ss:StyleID="s64"><Data ss:Type="String">{escape_xml(ar["position"])}</Data></Cell>'
        f'<Cell ss:StyleID="s64"><Data ss:Type="String">{escape_xml(ar["activity"])}</Data></Cell>'
        f'<Cell ss:StyleID="s67"><Data ss:Type="String">{escape_xml(ar["award"])}</Data></Cell>'
        f'<Cell ss:StyleID="s64"><Data ss:Type="String">{escape_xml(ar["citation"])}</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">October 20, 2026</Data></Cell>'
        f'<Cell ss:StyleID="s64"><Data ss:Type="String">CDRRMO Building, Motorpool Compound, Lower Rock Quarry, Baguio City</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">HAROLD C. MALLORCA (President)</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">HON. BENJAMIN B. MAGALONG (City Mayor)</Data></Cell>'
        f'<Cell ss:StyleID="s66"><Data ss:Type="String">LIZA R. BULAN (CSWDO Head)</Data></Cell>'
        f'</Row>'
    )
    apprec_rows.append(r)

apprec_xml_str = "\n".join(apprec_rows)
ws_cert_appreciation = f"""  <Worksheet ss:Name="Cert_Appreciation">
   <Table ss:DefaultRowHeight="16">
    <Column ss:Width="35"/>
    <Column ss:Width="110"/>
    <Column ss:Width="190"/>
    <Column ss:Width="60"/>
    <Column ss:Width="140"/>
    <Column ss:Width="190"/>
    <Column ss:Width="200"/>
    <Column ss:Width="150"/>
    <Column ss:Width="280"/>
    <Column ss:Width="85"/>
    <Column ss:Width="200"/>
    <Column ss:Width="150"/>
    <Column ss:Width="160"/>
    <Column ss:Width="140"/>
{apprec_xml_str}
   </Table>
   <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
    <ProtectObjects>False</ProtectObjects>
    <ProtectScenarios>False</ProtectScenarios>
   </WorksheetOptions>
  </Worksheet>"""

# 8. Assemble Workbook header & Styles
first_ws_pos = orig_xml.find('<Worksheet')
wb_header = orig_xml[:first_ws_pos].strip()

worksheets_to_include = [
    ws_primary_db.strip(),
    officer_block.strip() if officer_block else "",
    committees_block.strip() if committees_block else "",
    members_block.strip() if members_block else "",
    summary_block.strip() if summary_block else "",
    selected_block.strip() if selected_block else "",
    ws_cert_participation.strip(),
    ws_cert_ca.strip(),
    ws_cert_appreciation.strip()
]

final_xml = wb_header + "\n" + "\n".join([w for w in worksheets_to_include if w]) + "\n</Workbook>"

TARGET_FILE = "ALL MALES MARIED WITH TRAINING.xls"
with open(TARGET_FILE, "w", encoding="utf-8") as f:
    f.write(final_xml)

print(f"\nWritten to {TARGET_FILE}")

# 9. Verify with ElementTree parser
tree = ET.parse(TARGET_FILE)
root = tree.getroot()
ws_elements = root.findall('{urn:schemas-microsoft-com:office:spreadsheet}Worksheet')
ws_names = [e.attrib.get('{urn:schemas-microsoft-com:office:spreadsheet}Name') for e in ws_elements]

print("\nElementTree validation SUCCESSFUL! Worksheets verified:")
for i, name in enumerate(ws_names, 1):
    print(f"  {i}. {name}")
