from copy import deepcopy
from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree

FILE = Path(r"C:\Users\pvntr\OneDrive\Desktop\Final 1\COMP-1682-Final Year Project - citations standardised.docx")
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W}

RELATED_WORKS_1 = (
    "Previous studies show that product search and filtering are important functions in online retail platforms. "
    "Jiang and Zou (2020) examine how consumer search costs and filtering affect online retail platforms, sellers, and customers. "
    "Their study shows the value of allowing customers to narrow product choices using relevant attributes. For a fashion e-commerce "
    "website, filters must match the actual product information so that customers can find suitable items more easily. The BEO Fashion "
    "system will support keyword search and filtering by gender, size, colour, price range, and collection."
)
RELATED_WORKS_2 = (
    "Online fashion shopping also creates difficulty because customers cannot physically try on products before purchasing. "
    "Ornati, Picco-Schwendener and Marazza (2022) explain that size and fit are important concerns in fashion e-commerce and may "
    "influence customer satisfaction and product returns. Therefore, the proposed system will manage size and colour as product variants, "
    "allowing customers to select the available option before adding an item to the shopping cart. This will provide clearer product "
    "information and support a more suitable purchasing decision."
)
LITERATURE_REVIEW_1 = (
    "Existing fashion e-commerce systems provide useful examples for the proposed system. Zalando is a large multi-brand fashion "
    "platform that offers a wide product catalogue, personalised services, and support for retail partners (Zalando, 2026). In comparison, "
    "the BEO Fashion system will have a smaller and more focused scope. It will manage the BEO Fashion catalogue and store operations "
    "rather than operate as a marketplace for multiple independent brands and sellers."
)
LITERATURE_REVIEW_2 = (
    "The proposed system will include product search and filtering, product variants, shopping cart management, online payment options, "
    "order history, and inventory management. It will also support staff functions such as stock adjustment, stock transfer between stores, "
    "and order management. Research by Abouelrous, Gabor and Zhang (2022) highlights the importance of coordinating inventory and order "
    "fulfilment when retailers serve both online and physical store demand. The BEO Fashion system will apply this idea at a suitable scale "
    "by linking online orders with store inventory management."
)

REFERENCES = [
    ("Abouelrous, A.", "Abouelrous, A., Gabor, A. F. and Zhang, Y. (2022) 'Optimizing the inventory and fulfillment of an omnichannel retailer: A stochastic approach with scenario clustering', Computers & Industrial Engineering, 173, 108723. Available at: https://doi.org/10.1016/j.cie.2022.108723."),
    ("Jiang, B.", "Jiang, B. and Zou, T. (2020) 'Consumer search and filtering on online retail platforms', Journal of Marketing Research, 57(5), pp. 900-916. Available at: https://doi.org/10.1177/0022243720928367."),
    ("Ornati, M.", "Ornati, M., Picco-Schwendener, A. and Marazza, S. (2022) 'Sizing up the body: Virtual fit platforms in fashion e-commerce', International Journal of Fashion Studies, 9(1), pp. 199-218. Available at: https://doi.org/10.1386/infs_00066_1."),
]
UNUSED_REFERENCE_PREFIXES = (
    "Amazon Web Services", "Atlassian", "GeeksforGeeks", "Oracle (2025)", "Oracle (2026)", "Spring (2026)", "Umbraco",
)


def paragraph_text(paragraph):
    return "".join(node.text or "" for node in paragraph.xpath(".//w:t", namespaces=NS))


def set_text(paragraph, text):
    paragraph_properties = paragraph.find(f"{{{W}}}pPr")
    run_properties = paragraph.find(f".//{{{W}}}rPr")
    for child in list(paragraph):
        if child is not paragraph_properties:
            paragraph.remove(child)
    run = etree.SubElement(paragraph, f"{{{W}}}r")
    if run_properties is not None:
        run.append(deepcopy(run_properties))
    value = etree.SubElement(run, f"{{{W}}}t")
    value.text = text


def insert_after(reference, addition):
    parent = reference.getparent()
    parent.insert(parent.index(reference) + 1, addition)


with ZipFile(FILE, "r") as source:
    root = etree.fromstring(source.read("word/document.xml"))
    paragraphs = root.xpath("//w:p", namespaces=NS)
    by_prefix = lambda prefix: next((p for p in paragraphs if paragraph_text(p).startswith(prefix)), None)

    related_heading = by_prefix("3.1. Related works")
    literature_heading = by_prefix("3.2 Literature review")
    first_mysql_heading = by_prefix("3.1.1. MySQL")
    zalando_old = by_prefix("Zalando is used as a reference")
    if None in (related_heading, literature_heading, first_mysql_heading, zalando_old):
        raise ValueError("Expected Literature Review paragraphs were not found.")
    if any("Jiang and Zou (2020)" in paragraph_text(p) for p in paragraphs):
        raise ValueError("Related-studies content is already present; no edit was made.")

    # Remove technology descriptions below 3.1, while retaining the 3.2
    # heading. Then remove the previous 3.2 body before Objectives.
    deleting_technology = False
    deleting_old_review = False
    for paragraph in list(root.xpath("//w:p", namespaces=NS)):
        text = paragraph_text(paragraph)
        if paragraph is first_mysql_heading:
            deleting_technology = True
        if paragraph is literature_heading:
            deleting_technology = False
            deleting_old_review = True
            continue
        if text == "Objectives":
            deleting_old_review = False
        if deleting_technology or deleting_old_review:
            paragraph.getparent().remove(paragraph)

    # Insert the two scholarly related-studies paragraphs below 3.1.
    first_study = deepcopy(related_heading)
    second_study = deepcopy(related_heading)
    set_text(first_study, RELATED_WORKS_1)
    set_text(second_study, RELATED_WORKS_2)
    insert_after(related_heading, first_study)
    insert_after(first_study, second_study)

    # The original 3.2 heading remains unchanged. Insert the two comparison paragraphs.
    first_comparison = deepcopy(literature_heading)
    second_comparison = deepcopy(literature_heading)
    set_text(first_comparison, LITERATURE_REVIEW_1)
    set_text(second_comparison, LITERATURE_REVIEW_2)
    insert_after(literature_heading, first_comparison)
    insert_after(first_comparison, second_comparison)

    # Remove now-unused technical documentation references and insert the
    # three scholarly sources in alphabetical order.
    for paragraph in list(root.xpath("//w:p", namespaces=NS)):
        if paragraph_text(paragraph).startswith(UNUSED_REFERENCE_PREFIXES):
            paragraph.getparent().remove(paragraph)

    all_paragraphs = root.xpath("//w:p", namespaces=NS)
    templates = next((p for p in all_paragraphs if paragraph_text(p).startswith("Competition and Markets Authority")), None)
    reference_heading = next((p for p in all_paragraphs if paragraph_text(p) == "References"), None)
    if templates is None or reference_heading is None:
        raise ValueError("Reference formatting template was not found.")
    for prefix, reference in reversed(REFERENCES):
        children = list(reference_heading.getparent())
        start = children.index(reference_heading) + 1
        following = next((p for p in children[start:] if p.tag == f"{{{W}}}p" and paragraph_text(p) > reference), None)
        new_reference = deepcopy(templates)
        set_text(new_reference, reference)
        if following is None:
            templates.getparent().append(new_reference)
        else:
            parent = following.getparent()
            parent.insert(parent.index(following), new_reference)

    updated_xml = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)
    with NamedTemporaryFile(delete=False, suffix=".docx", dir=FILE.parent) as temporary:
        temporary_path = Path(temporary.name)
    try:
        with ZipFile(temporary_path, "w", ZIP_DEFLATED) as output:
            for item in source.infolist():
                output.writestr(item, updated_xml if item.filename == "word/document.xml" else source.read(item.filename))
        backup = Path(r"D:\web code\scratch\COMP-1682-Final Year Project - citations standardised.before-literature-review.docx")
        backup.write_bytes(FILE.read_bytes())
        with temporary_path.open("rb") as incoming, FILE.open("r+b") as destination:
            destination.seek(0)
            destination.truncate(0)
            destination.write(incoming.read())
            destination.flush()
    finally:
        if temporary_path.exists():
            temporary_path.unlink()

print("Rewrote Literature Review using scholarly sources and retained section headings.")
