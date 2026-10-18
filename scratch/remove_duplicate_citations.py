from copy import deepcopy
from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree


FILE = Path(r"C:\Users\pvntr\OneDrive\Desktop\Final 1\COMP-1682-Final Year Project - citations standardised.docx")
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W}

REPLACEMENTS = {
    "Front-end Development is": [
        (" (geeksforgeeks, 2025) (GeeksforGeeks, 2025).", " (GeeksforGeeks, 2025).")
    ],
    "The development environment is often": [
        (" (umbraco, 2025) (Umbraco, 2025).", " (Umbraco, 2025).")
    ],
    "Version control, also known as source control": [
        (" (atlassian, 2025) (Atlassian, 2025).", " (Atlassian, 2025).")
    ],
    "The backend (or server side)": [
        (" (aws.amazon, 2026) (Amazon Web Services, 2026).", " (Amazon Web Services, 2026).")
    ],
    "Legal issues in an e-commerce system": [
        (" (Conway, 2025) (gov.uk, 2026) (Conway, 2025; GOV.UK, 2026).", " (Conway, 2025; GOV.UK, 2026).")
    ],
    "Social issues in e-commerce": [
        (" (Authority, 2025) (Competition and Markets Authority, 2025).", " (Competition and Markets Authority, 2025).")
    ],
    "Ethical issues in e-commerce": [
        (" (Service, 2025) (Government Digital Service, 2025).", " (Government Digital Service, 2025).")
    ],
    "Professional issues in e-commerce": [
        (" (Authority S. R., 2026) (Solicitors Regulation Authority, 2026).", " (Solicitors Regulation Authority, 2026).")
    ],
}


def paragraph_text(paragraph):
    return "".join(paragraph.xpath(".//w:t/text()", namespaces=NS))


def set_text(paragraph, text):
    first_run = paragraph.find("w:r", NS)
    properties = None
    if first_run is not None:
        existing = first_run.find("w:rPr", NS)
        properties = deepcopy(existing) if existing is not None else None
    ppr = paragraph.find("w:pPr", NS)
    for child in list(paragraph):
        if child is not ppr:
            paragraph.remove(child)
    run = etree.SubElement(paragraph, f"{{{W}}}r")
    if properties is not None:
        run.append(properties)
    value = etree.SubElement(run, f"{{{W}}}t")
    value.text = text


with ZipFile(FILE, "r") as source_zip:
    root = etree.fromstring(source_zip.read("word/document.xml"))
    changes = 0
    for paragraph in root.xpath("//w:p", namespaces=NS):
        current = paragraph_text(paragraph)
        for starts_with, replacements in REPLACEMENTS.items():
            if current.startswith(starts_with):
                updated = current
                for old, new in replacements:
                    if old not in updated:
                        raise ValueError(f"Expected duplicate citation was not found in: {starts_with}")
                    updated = updated.replace(old, new)
                set_text(paragraph, updated)
                changes += 1
                break
    if changes != len(REPLACEMENTS):
        raise ValueError(f"Updated {changes} paragraphs, expected {len(REPLACEMENTS)}.")

    xml = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)
    with NamedTemporaryFile(delete=False, suffix=".docx", dir=FILE.parent) as temporary:
        temporary_path = Path(temporary.name)
    try:
        with ZipFile(temporary_path, "w", ZIP_DEFLATED) as output_zip:
            for item in source_zip.infolist():
                output_zip.writestr(item, xml if item.filename == "word/document.xml" else source_zip.read(item.filename))
        # The OneDrive folder can deny rename/replace while allowing writes to
        # the existing file. Keep the original package in the workspace, then
        # update that file in place rather than replacing its directory entry.
        backup_path = Path(r"D:\web code\scratch\COMP-1682-Final Year Project - citations standardised.backup.docx")
        backup_path.write_bytes(FILE.read_bytes())
        with temporary_path.open("rb") as source, FILE.open("r+b") as destination:
            destination.seek(0)
            destination.truncate(0)
            destination.write(source.read())
            destination.flush()
    finally:
        if temporary_path.exists():
            temporary_path.unlink()
