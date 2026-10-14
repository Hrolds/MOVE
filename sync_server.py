import http.server
import socketserver
import json
import os
import re
import html
import io
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime

PORT = 8765
BASE_DIR = r"C:\Users\ALOD\Documents\MOVE"
TARGET_FILE = os.path.join(BASE_DIR, "ALL MALES MARIED WITH TRAINING.xls")
BACKUP_FILE = os.path.join(BASE_DIR, "ALL MALES MARIED WITH TRAINING - LastSave_Backup.xls")
TEMPLATE_CA_DOCX = os.path.join(BASE_DIR, "CA MOVE TEMPLATE.docx")

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

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
ET.register_namespace("w", W_NS)

def create_docx_run(text, bold=False, italic=False, size=24, font_name="Arial"):
    r = ET.Element(f"{{{W_NS}}}r")
    rPr = ET.SubElement(r, f"{{{W_NS}}}rPr")
    rFonts = ET.SubElement(rPr, f"{{{W_NS}}}rFonts")
    rFonts.set(f"{{{W_NS}}}ascii", font_name)
    rFonts.set(f"{{{W_NS}}}hAnsi", font_name)
    rFonts.set(f"{{{W_NS}}}cs", font_name)
    if bold:
        ET.SubElement(rPr, f"{{{W_NS}}}b")
        ET.SubElement(rPr, f"{{{W_NS}}}bCs")
    if italic:
        ET.SubElement(rPr, f"{{{W_NS}}}i")
        ET.SubElement(rPr, f"{{{W_NS}}}iCs")
    sz = ET.SubElement(rPr, f"{{{W_NS}}}sz")
    sz.set(f"{{{W_NS}}}val", str(size))
    szCs = ET.SubElement(rPr, f"{{{W_NS}}}szCs")
    szCs.set(f"{{{W_NS}}}val", str(size))
    t = ET.SubElement(r, f"{{{W_NS}}}t")
    t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    t.text = text
    return r

def set_docx_para(p, runs, jc="both", first_line_ind=None, line_spacing=None, space_after=None):
    pPr = p.find(f"{{{W_NS}}}pPr")
    if pPr is None:
        pPr = ET.Element(f"{{{W_NS}}}pPr")
        p.insert(0, pPr)
    jc_elem = pPr.find(f"{{{W_NS}}}jc")
    if jc_elem is None:
        jc_elem = ET.SubElement(pPr, f"{{{W_NS}}}jc")
    jc_elem.set(f"{{{W_NS}}}val", jc)
    if first_line_ind:
        ind_elem = pPr.find(f"{{{W_NS}}}ind")
        if ind_elem is None:
            ind_elem = ET.SubElement(pPr, f"{{{W_NS}}}ind")
        ind_elem.set(f"{{{W_NS}}}firstLine", str(first_line_ind))
    if line_spacing is not None or space_after is not None:
        spacing_elem = pPr.find(f"{{{W_NS}}}spacing")
        if spacing_elem is None:
            spacing_elem = ET.SubElement(pPr, f"{{{W_NS}}}spacing")
        if line_spacing is not None:
            line_val = int(float(line_spacing) * 240)
            spacing_elem.set(f"{{{W_NS}}}line", str(line_val))
            spacing_elem.set(f"{{{W_NS}}}lineRule", "auto")
        if space_after is not None:
            after_val = int(float(space_after) * 15)
            spacing_elem.set(f"{{{W_NS}}}after", str(after_val))
    for old_r in list(p.findall(f"{{{W_NS}}}r")):
        p.remove(old_r)
    for r in runs:
        p.append(r)

def build_docx_table(participants):
    tbl = ET.Element(f"{{{W_NS}}}tbl")
    tblPr = ET.SubElement(tbl, f"{{{W_NS}}}tblPr")
    tblW = ET.SubElement(tblPr, f"{{{W_NS}}}tblW")
    tblW.set(f"{{{W_NS}}}w", "9026")
    tblW.set(f"{{{W_NS}}}type", "dxa")
    tblJc = ET.SubElement(tblPr, f"{{{W_NS}}}jc")
    tblJc.set(f"{{{W_NS}}}val", "center")
    tblBorders = ET.SubElement(tblPr, f"{{{W_NS}}}tblBorders")
    for b_name in ["top", "left", "bottom", "right"]:
        b = ET.SubElement(tblBorders, f"{{{W_NS}}}{b_name}")
        b.set(f"{{{W_NS}}}val", "single")
        b.set(f"{{{W_NS}}}sz", "4")
        b.set(f"{{{W_NS}}}space", "0")
        b.set(f"{{{W_NS}}}color", "333333")
    for b_name in ["insideH", "insideV"]:
        b = ET.SubElement(tblBorders, f"{{{W_NS}}}{b_name}")
        b.set(f"{{{W_NS}}}val", "single")
        b.set(f"{{{W_NS}}}sz", "4")
        b.set(f"{{{W_NS}}}space", "0")
        b.set(f"{{{W_NS}}}color", "CCCCCC")

    tr_h = ET.SubElement(tbl, f"{{{W_NS}}}tr")
    trPr_h = ET.SubElement(tr_h, f"{{{W_NS}}}trPr")
    ET.SubElement(trPr_h, f"{{{W_NS}}}tblHeader")
    ET.SubElement(trPr_h, f"{{{W_NS}}}cantSplit")
    cols = [("No.", "500", "center"), ("Full Name", "2900", "left"), ("Position Title", "2826", "left"), ("Office", "1400", "center"), ("Role", "1400", "center")]
    for title, width, align in cols:
        tc = ET.SubElement(tr_h, f"{{{W_NS}}}tc")
        tcPr = ET.SubElement(tc, f"{{{W_NS}}}tcPr")
        tcW = ET.SubElement(tcPr, f"{{{W_NS}}}tcW")
        tcW.set(f"{{{W_NS}}}w", width)
        tcW.set(f"{{{W_NS}}}type", "dxa")
        shd = ET.SubElement(tcPr, f"{{{W_NS}}}shd")
        shd.set(f"{{{W_NS}}}val", "clear")
        shd.set(f"{{{W_NS}}}color", "auto")
        shd.set(f"{{{W_NS}}}fill", "F1F5F9")
        p = ET.SubElement(tc, f"{{{W_NS}}}p")
        set_docx_para(p, [create_docx_run(title, bold=True, size=18)], jc=align)

    for idx, p in enumerate(participants, 1):
        tr = ET.SubElement(tbl, f"{{{W_NS}}}tr")
        trPr = ET.SubElement(tr, f"{{{W_NS}}}trPr")
        ET.SubElement(trPr, f"{{{W_NS}}}cantSplit")
        values = [
            (str(idx), "500", "center", False),
            (p.get("name", ""), "2900", "left", True),
            (p.get("position", ""), "2826", "left", False),
            (p.get("office", ""), "1400", "center", False),
            (p.get("role", "Participant"), "1400", "center", False)
        ]
        for val, width, align, bold in values:
            tc = ET.SubElement(tr, f"{{{W_NS}}}tc")
            tcPr = ET.SubElement(tc, f"{{{W_NS}}}tcPr")
            tcW = ET.SubElement(tcPr, f"{{{W_NS}}}tcW")
            tcW.set(f"{{{W_NS}}}w", width)
            tcW.set(f"{{{W_NS}}}type", "dxa")
            cell_p = ET.SubElement(tc, f"{{{W_NS}}}p")
            set_docx_para(cell_p, [create_docx_run(val, bold=bold, size=17)], jc=align)

    return tbl

def get_full_activity_title(title, theme):
    t = (title or "").strip()
    th = (theme or "").strip()
    if not th:
        return t
    if th.lower() in t.lower():
        return t
    return f"{t}: {th}"

def format_venue_clause(venue):
    v = (venue or "").strip()
    if not v:
        return ""
    if any(v.lower().startswith(prefix) for prefix in ["at the ", "in the ", "at ", "in "]):
        return v
    return f"at the {v}"

def format_date_clause(date_str):
    d = (date_str or "").strip()
    if not d:
        return ""
    if d.lower().startswith("held on "):
        return d
    return f"held on {d}"

def build_custom_text_runs(text, member, hon, full_act_title, sz=27):
    m_name = (member.get("name") or "").upper().strip()
    m_pos = (member.get("position") or "").upper().strip()
    m_off = (member.get("office") or "").upper().strip()

    targets = []
    if hon and m_name:
        targets.append(f"{hon}{m_name}")
    if m_name:
        targets.append(m_name)
    if m_pos:
        targets.append(m_pos)
    if m_off:
        targets.append(m_off)
    if full_act_title:
        targets.append(full_act_title)

    targets = sorted(list(set(filter(None, targets))), key=len, reverse=True)
    if not targets:
        return [create_docx_run(text, size=sz)]

    pattern = "(" + "|".join(re.escape(t) for t in targets) + ")"
    parts = re.split(pattern, text)
    runs = []
    for part in parts:
        if not part:
            continue
        is_bold = part in targets
        runs.append(create_docx_run(part, bold=is_bold, size=sz))
    return runs

def populate_individual_elements(parent, member, title, theme, date_str, venue, purpose, issue_date, signatory, sig_t1, sig_t2, initials, attendance_basis, hon, line_spacing=1.40, space_after=14, text_indent=720, doc_title="CERTIFICATE OF APPEARANCE", custom_text=None, font_size_pt=13.5, title_space_after=300, sig_align="center", main_align="both"):
    m_name = (member.get("name") or "EMPLOYEE FULL NAME").upper()
    m_pos = (member.get("position") or "OFFICIAL POSITION TITLE").upper()
    m_off = (member.get("office") or "DEPARTMENT / OFFICE").upper()

    full_act_title = get_full_activity_title(title, theme)
    date_clause = format_date_clause(date_str)
    venue_clause = format_venue_clause(venue)
    basis = attendance_basis.strip() if attendance_basis else "was duly verified to have attended and participated in the activity entitled"
    sz = int(float(font_size_pt) * 2)

    ET.SubElement(parent, f"{{{W_NS}}}p")
    p_title = ET.SubElement(parent, f"{{{W_NS}}}p")
    set_docx_para(p_title, [create_docx_run(doc_title or "CERTIFICATE OF APPEARANCE", bold=True, size=40, font_name="MS Reference Sans Serif")], jc="center", space_after=title_space_after)
    
    ET.SubElement(parent, f"{{{W_NS}}}p")

    # Main Formal Certification Flowing Paragraph
    p_main = ET.SubElement(parent, f"{{{W_NS}}}p")
    if custom_text and custom_text.strip():
        runs_main = build_custom_text_runs(custom_text.strip(), member, hon, full_act_title, sz=sz)
    else:
        runs_main = [
            create_docx_run("This is to certify that ", size=sz),
            create_docx_run(f"{hon}{m_name}", bold=True, size=sz),
            create_docx_run(", holding the position of ", size=sz),
            create_docx_run(m_pos, bold=True, size=sz),
            create_docx_run(" under ", size=sz),
            create_docx_run(m_off, bold=True, size=sz),
            create_docx_run(f", {basis} \u201c", size=sz),
            create_docx_run(full_act_title, bold=True, size=sz),
            create_docx_run(f",\u201d {date_clause}, {venue_clause}.", size=sz)
        ]
    set_docx_para(p_main, runs_main, jc=main_align, first_line_ind=text_indent, line_spacing=line_spacing, space_after=space_after)
    
    ET.SubElement(parent, f"{{{W_NS}}}p")
    p_purp = ET.SubElement(parent, f"{{{W_NS}}}p")
    set_docx_para(p_purp, [create_docx_run(purpose, size=sz)], jc=main_align, first_line_ind=text_indent, line_spacing=line_spacing, space_after=space_after)
    
    ET.SubElement(parent, f"{{{W_NS}}}p")
    p_iss = ET.SubElement(parent, f"{{{W_NS}}}p")
    set_docx_para(p_iss, [create_docx_run(issue_date, size=sz)], jc="left", line_spacing=line_spacing, space_after=int(space_after * 1.5))
    
    ET.SubElement(parent, f"{{{W_NS}}}p")
    ET.SubElement(parent, f"{{{W_NS}}}p")
    p_sig_name = ET.SubElement(parent, f"{{{W_NS}}}p")
    set_docx_para(p_sig_name, [create_docx_run(signatory, bold=True, size=24)], jc=sig_align)
    p_sig_t1 = ET.SubElement(parent, f"{{{W_NS}}}p")
    set_docx_para(p_sig_t1, [create_docx_run(sig_t1, bold=True, size=22)], jc=sig_align)
    p_sig_t2 = ET.SubElement(parent, f"{{{W_NS}}}p")
    set_docx_para(p_sig_t2, [create_docx_run(sig_t2, size=20)], jc=sig_align)
    
    p_init = ET.SubElement(parent, f"{{{W_NS}}}p")
    set_docx_para(p_init, [create_docx_run(initials, size=18)], jc="left")

def generate_ca_docx(data):
    if not os.path.exists(TEMPLATE_CA_DOCX):
        raise FileNotFoundError(f"Template not found at {TEMPLATE_CA_DOCX}")

    mode = data.get("mode", "individual")
    export_all = data.get("exportAll", False)
    title = data.get("activityTitle", "Men in the Kitchen 2")
    theme = data.get("theme", "Love Served in the Kitchen")
    date_str = data.get("date", "October 20, 2026")
    venue = data.get("venue", "CDRRMO Building, Motorpool Compound, Lower Rock Quarry, Baguio City")
    attendance_basis = data.get("attendanceBasis", "was duly verified to have attended and participated in the activity entitled")
    honorific_mode = data.get("honorificMode", "auto")
    purpose = data.get("purpose", "This certification is issued upon the request of the above-named individual for whatever lawful purpose it may serve.")
    issue_date = data.get("issueDate", "Issued this 20th day of October 2026, Baguio City, Philippines.")
    signatory = data.get("signatoryName", "BENJAMIN B. MAGALONG")
    sig_t1 = data.get("signatoryTitle1", "City Mayor")
    sig_t2 = data.get("signatoryTitle2", "LCAT-VAWC Chairperson")
    initials = data.get("initials", "/drmo/ctb")
    participants = data.get("participants", [])
    ind_member = data.get("individualMember") or (participants[0] if participants else {})

    line_spacing = float(data.get("lineSpacing", 1.40))
    space_after = float(data.get("paragraphSpacing", 14))
    font_size_pt = float(data.get("fontSize", 13.5))
    text_indent_px = float(data.get("textIndent", 36))
    ind_dxa = int(text_indent_px * 15) if text_indent_px else 720
    doc_title = data.get("documentTitle", "CERTIFICATE OF APPEARANCE")
    custom_member_texts = data.get("customMemberTexts") or {}
    main_template = data.get("mainTemplate") or ""
    individual_main_text = data.get("individualMainText") or ""

    # Signature and text alignments
    sig_align_raw = str(data.get("signatureAlign", "center")).lower().strip()
    sig_align = sig_align_raw if sig_align_raw in ["left", "center", "right"] else "center"
    main_align_raw = str(data.get("mainTextAlign", "both")).lower().strip()
    main_align = "both" if main_align_raw in ["justify", "both"] else (main_align_raw if main_align_raw in ["left", "center", "right"] else "both")
    title_spacing_px = float(data.get("titleSpacingAfter", 20))
    title_space_after = int(title_spacing_px * 15)

    def resolve_hon(member):
        if honorific_mode == "none":
            return ""
        if honorific_mode == "mr":
            return "MR. "
        if honorific_mode == "ms":
            return "MS. "
        g = str(member.get("gender", "M")).upper()
        if g in ["F", "FEMALE"]:
            return "MS. "
        return "MR. "

    with zipfile.ZipFile(TEMPLATE_CA_DOCX, "r") as src:
        out_buf = io.BytesIO()
        with zipfile.ZipFile(out_buf, "w", compression=zipfile.ZIP_DEFLATED) as dst:
            for item in src.namelist():
                content = src.read(item)
                if item == "word/document.xml":
                    tree = ET.fromstring(content)
                    body = tree.find(f"{{{W_NS}}}body")
                    sectPr = body.find(f"{{{W_NS}}}sectPr")
                    
                    if mode == "group":
                        children = list(body)
                        p_cert = children[2]
                        full_act_title = get_full_activity_title(title, theme)
                        date_clause = format_date_clause(date_str)
                        venue_clause = format_venue_clause(venue)
                        runs_cert = [
                            create_docx_run("This is to certify that the following employees appeared as "),
                            create_docx_run("Participant/Facilitator", bold=True),
                            create_docx_run(' during the \u201c'),
                            create_docx_run(full_act_title, bold=True),
                            create_docx_run(f",\u201d {date_clause}, {venue_clause}:")
                        ]
                        set_docx_para(p_cert, runs_cert, jc=main_align, first_line_ind=ind_dxa, line_spacing=line_spacing, space_after=space_after)

                        p_placeholder = children[3]
                        idx_placeholder = list(body).index(p_placeholder)
                        body.remove(p_placeholder)
                        tbl_elem = build_docx_table(participants)
                        body.insert(idx_placeholder, tbl_elem)

                        for p in body.iter(f"{{{W_NS}}}p"):
                            txt = "".join(p.itertext())
                            if "CERTIFICATE OF APPEARANCE" in txt:
                                set_docx_para(p, [create_docx_run(doc_title, bold=True, size=40, font_name="MS Reference Sans Serif")], jc="center", space_after=title_space_after)
                            elif "daily time records" in txt or "support the non-entry" in txt:
                                set_docx_para(p, [create_docx_run(purpose)], jc=main_align, first_line_ind=ind_dxa, line_spacing=line_spacing, space_after=space_after)
                            elif "Issued this" in txt:
                                set_docx_para(p, [create_docx_run(issue_date)], jc="left", line_spacing=line_spacing, space_after=int(space_after * 1.5))
                            elif "BENJAMIN B. MAGALONG" in txt:
                                set_docx_para(p, [create_docx_run(signatory, bold=True, size=24)], jc=sig_align)
                            elif "City Mayor" in txt:
                                set_docx_para(p, [create_docx_run(sig_t1, bold=True, size=22)], jc=sig_align)
                            elif "LCAT-VAWC Chairperson" in txt:
                                set_docx_para(p, [create_docx_run(sig_t2, size=20)], jc=sig_align)
                            elif "/drmo/ctb" in txt or ("/drmo" in txt and "ctb" in txt):
                                set_docx_para(p, [create_docx_run(initials, size=18)], jc="left")
                    else:
                        body.remove(sectPr)
                        for elem in list(body):
                            body.remove(elem)

                        members_to_export = participants if export_all else [ind_member]
                        for idx, member in enumerate(members_to_export):
                            if idx > 0:
                                p_br = ET.SubElement(body, f"{{{W_NS}}}p")
                                r_br = ET.SubElement(p_br, f"{{{W_NS}}}r")
                                br = ET.SubElement(r_br, f"{{{W_NS}}}br")
                                br.set(f"{{{W_NS}}}type", "page")
                            hon = resolve_hon(member)
                            m_id = str(member.get("id", ""))
                            cust_text = custom_member_texts.get(m_id)
                            if not cust_text and not export_all and individual_main_text:
                                cust_text = individual_main_text
                            elif not cust_text and main_template and "{name}" in main_template:
                                m_name = (member.get("name") or "EMPLOYEE FULL NAME").upper()
                                m_pos = (member.get("position") or "OFFICIAL POSITION TITLE").upper()
                                m_off = (member.get("office") or "DEPARTMENT / OFFICE").upper()
                                full_act_title = get_full_activity_title(title, theme)
                                date_clause = format_date_clause(date_str)
                                venue_clause = format_venue_clause(venue)
                                basis = attendance_basis.strip() if attendance_basis else "was duly verified to have attended and participated in the activity entitled"
                                cust_text = main_template \
                                    .replace("{honorific}", hon) \
                                    .replace("{name}", m_name) \
                                    .replace("{position}", m_pos) \
                                    .replace("{office}", m_off) \
                                    .replace("{basis}", basis) \
                                    .replace("{activity}", full_act_title) \
                                    .replace("{date}", date_clause) \
                                    .replace("{venue}", venue_clause)

                            populate_individual_elements(
                                body, member, title, theme, date_str, venue,
                                purpose, issue_date, signatory, sig_t1, sig_t2,
                                initials, attendance_basis, hon,
                                line_spacing=line_spacing, space_after=space_after,
                                text_indent=ind_dxa, doc_title=doc_title,
                                custom_text=cust_text, font_size_pt=font_size_pt,
                                title_space_after=title_space_after, sig_align=sig_align, main_align=main_align
                            )

                        body.append(sectPr)

                    content = ET.tostring(tree, encoding="utf-8")
                dst.writestr(item, content)

        return out_buf.getvalue()

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
        elif self.path == "/api/export-ca-docx":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                data = json.loads(body)
                docx_bytes = generate_ca_docx(data)
                self.send_response(200)
                self.send_header("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                self.send_header("Content-Disposition", 'attachment; filename="Certificate_of_Appearance.docx"')
                self.send_header("Content-Length", str(len(docx_bytes)))
                self.end_headers()
                self.wfile.write(docx_bytes)
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
