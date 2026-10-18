from copy import deepcopy
from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree

FILE = Path(r"C:\Users\pvntr\OneDrive\Desktop\Final 1\COMP-1682-Final Year Project - citations standardised.docx")
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W}

PARAGRAPH_1 = (
    "Waterfall and Scrum are two possible approaches to developing the Fashion Store E-Commerce Website. "
    "Waterfall follows a sequential process, where requirements and system design are completed before implementation begins "
    "(Ruparelia, 2010). In contrast, Scrum develops the system through short Sprints. At the end of each Sprint, the work is "
    "reviewed and the next priorities can be adjusted. Scrum is useful when requirements are unclear or likely to change during "
    "development. It also normally involves a Scrum Team, including a Product Owner, Scrum Master, and Developers "
    "(Schwaber and Sutherland, 2020)."
)

PARAGRAPH_2 = (
    "The Waterfall Model will be used for the Fashion Store E-Commerce Website. The main functions can be identified before "
    "development, including customer registration and login, product browsing and filtering, size and colour selection, shopping "
    "cart management, online payment options, order management, and inventory management. Since these requirements are already "
    "defined, Waterfall will provide a clear structure for organising the work and completing the project within the planned "
    "six-month period. Scrum would allow frequent changes and feedback, but Waterfall is more suitable because the proposed "
    "scope is expected to remain stable. Waterfall will also support the preparation of documents such as the requirements "
    "specification, database design, system diagrams, and test results for the academic report."
)

PARAGRAPH_3 = (
    "The project will be completed within six months. The work will follow six phases: Requirements Analysis, System Design, "
    "Implementation, Testing, Deployment, and Maintenance. The requirements, system architecture, database, and user interfaces "
    "will first be defined and designed. The system will then be developed using Java and Spring Boot for the backend and React "
    "for the frontend. Testing will include unit, integration, functional, and system testing to check that the system meets the "
    "requirements and identify errors. Finally, the website will be deployed, its main functions will be verified, and initial "
    "maintenance will be carried out to fix any remaining issues."
)

SCRUM_REFERENCE = (
    "Schwaber, K. and Sutherland, J. (2020) The Scrum Guide: The Definitive Guide to Scrum: The Rules of the Game. "
    "Available at: https://scrumguides.org/scrum-guide.html (Accessed: 4 October 2026)."
)


def paragraph_text(paragraph):
    return "".join(node.text or "" for node in paragraph.xpath(".//w:t", namespaces=NS))


def set_text(paragraph, text):
    properties = paragraph.find(f"{{{W}}}pPr")
    first_run_properties = paragraph.find(f".//{{{W}}}rPr")
    for child in list(paragraph):
        if child is not properties:
            paragraph.remove(child)
    run = etree.SubElement(paragraph, f"{{{W}}}r")
    if first_run_properties is not None:
        run.append(deepcopy(first_run_properties))
    value = etree.SubElement(run, f"{{{W}}}t")
    value.text = text


with ZipFile(FILE, "r") as source:
    root = etree.fromstring(source.read("word/document.xml"))
    paragraphs = root.xpath("//w:p", namespaces=NS)
    methodology = next((p for p in paragraphs if paragraph_text(p).startswith("The Waterfall Model is used as the main")), None)
    next_paragraph = next((p for p in paragraphs if paragraph_text(p).startswith("During the project, requirements are first")), None)
    ruparelia = next((p for p in paragraphs if paragraph_text(p).startswith("Ruparelia, N. B.")), None)
    if methodology is None or next_paragraph is None or ruparelia is None:
        raise ValueError("The expected methodology or reference paragraphs were not found.")
    if any("Schwaber, K. and Sutherland, J." in paragraph_text(p) for p in paragraphs):
        raise ValueError("The Scrum reference is already present; no edit was made.")

    set_text(methodology, PARAGRAPH_1)
    set_text(next_paragraph, PARAGRAPH_2)
    third_paragraph = deepcopy(next_paragraph)
    set_text(third_paragraph, PARAGRAPH_3)
    parent = next_paragraph.getparent()
    parent.insert(parent.index(next_paragraph) + 1, third_paragraph)

    reference_paragraph = deepcopy(ruparelia)
    set_text(reference_paragraph, SCRUM_REFERENCE)
    reference_parent = ruparelia.getparent()
    reference_parent.insert(reference_parent.index(ruparelia) + 1, reference_paragraph)

    updated_xml = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)
    with NamedTemporaryFile(delete=False, suffix=".docx", dir=FILE.parent) as temporary:
        temporary_path = Path(temporary.name)
    try:
        with ZipFile(temporary_path, "w", ZIP_DEFLATED) as output:
            for item in source.infolist():
                output.writestr(item, updated_xml if item.filename == "word/document.xml" else source.read(item.filename))
        backup = Path(r"D:\web code\scratch\COMP-1682-Final Year Project - citations standardised.before-methodology.docx")
        backup.write_bytes(FILE.read_bytes())
        with temporary_path.open("rb") as incoming, FILE.open("r+b") as destination:
            destination.seek(0)
            destination.truncate(0)
            destination.write(incoming.read())
            destination.flush()
    finally:
        if temporary_path.exists():
            temporary_path.unlink()

print("Updated methodology section and added Scrum reference.")
