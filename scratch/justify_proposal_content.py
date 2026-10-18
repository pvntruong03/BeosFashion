from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH

FILE = Path(r"C:\Users\pvntr\OneDrive\Desktop\Final 1\COMP-1682-Final Year Project - citations standardised.docx")

EXCLUDED = {
    "COMP1682.1 Project Proposal",
    "Overview",
    "Aim",
    "Related works / Literature review",
    "3.1 Related works",
    "3.2 Literature review",
    "Objectives",
    "System Requirements and Design",
    "Customer Shopping System",
    "Product and Store Management System",
    "System Quality and Deployment",
    "Project Framework or Any Methodology used",
    "Legal, Social, Ethical and Professional",
    "Introduction:",
    "Legal",
    "Social",
    "Ethical",
    "Professional",
    "Planning (see appendix A)",
    "Table 1: Project Development Schedule",
    "Use-case Diagram",
    "Initial References",
    "References",
    "Declaration of AI Use",
}


def should_justify(text):
    stripped = text.strip()
    if not stripped or stripped in EXCLUDED:
        return False
    if stripped.startswith(("Keywords:", "Outcome describing", "To develop research questions", "To create an outline", "To explain concepts", "To support my use", "To summarise")):
        return False
    if "Available at:" in stripped:
        return False
    if stripped.startswith(("[", "Develop a Fashion Store")):
        return False
    return True


document = Document(FILE)
changed = 0
for paragraph in document.paragraphs:
    if should_justify(paragraph.text):
        paragraph.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        changed += 1

# In the schedule, justify only the descriptive Activities column. The other
# columns remain compact and easy to scan.
for table in document.tables:
    if len(table.columns) >= 2:
        for row in table.rows[1:]:
            for paragraph in row.cells[1].paragraphs:
                if paragraph.text.strip():
                    paragraph.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
                    changed += 1

backup = Path(r"D:\web code\scratch\COMP-1682-Final Year Project - citations standardised.before-justification.docx")
backup.write_bytes(FILE.read_bytes())
document.save(FILE)
print(f"Justified {changed} content paragraphs.")
