from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree

FILE = Path(r"C:\Users\pvntr\OneDrive\Desktop\Final 1\COMP-1682-Final Year Project - citations standardised.docx")
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W}


def paragraph_text(paragraph):
    return "".join(node.text or "" for node in paragraph.xpath(".//w:t", namespaces=NS))


with ZipFile(FILE, "r") as source:
    root = etree.fromstring(source.read("word/document.xml"))
    first_reference = next(p for p in root.xpath("//w:p", namespaces=NS) if paragraph_text(p).startswith("Competition and Markets Authority"))
    parent = first_reference.getparent()
    children = list(parent)
    references = [
        child for child in children
        if child.tag == f"{{{W}}}p" and "Available at:" in paragraph_text(child)
    ]
    if len(references) != 11:
        raise ValueError(f"Expected 11 references, found {len(references)}.")
    for reference in references:
        parent.remove(reference)
    position = 0
    for reference in sorted(references, key=lambda p: paragraph_text(p).casefold()):
        parent.insert(position, reference)
        position += 1

    xml = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)
    with NamedTemporaryFile(delete=False, suffix=".docx", dir=FILE.parent) as temporary:
        temporary_path = Path(temporary.name)
    try:
        with ZipFile(temporary_path, "w", ZIP_DEFLATED) as output:
            for item in source.infolist():
                output.writestr(item, xml if item.filename == "word/document.xml" else source.read(item.filename))
        with temporary_path.open("rb") as incoming, FILE.open("r+b") as destination:
            destination.seek(0)
            destination.truncate(0)
            destination.write(incoming.read())
            destination.flush()
    finally:
        if temporary_path.exists():
            temporary_path.unlink()

print("Sorted References alphabetically.")
