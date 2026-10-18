from copy import deepcopy
from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree

FILE = Path(r"C:\Users\pvntr\OneDrive\Desktop\Final 1\COMP-1682-Final Year Project - citations standardised.docx")
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W}

SUBSECTIONS = [
    ("3.1.1 MySQL", "Relational database systems are suitable for e-commerce applications because they organise structured data and maintain relationships between customers, products, product variants, shopping carts, orders, and inventory records. Research comparing Oracle and MySQL shows that relational database management systems differ in their syntax, data handling, and performance characteristics (Kvet, Fidesova and Matiasko, 2016). For the Fashion Store E-Commerce System, a relational database will support consistent storage of transactional data and help maintain the links between product variants, stock quantities, and customer orders."),
    ("3.1.2 Front-end Development Technologies", "The front end affects how customers browse products and make purchasing decisions. An attribute-based interface can increase customers’ perceived control, enjoyment, and satisfaction in business-to-consumer e-commerce (Kamis, Stern and Ladik, 2010). This supports the use of a clear product catalogue, keyword search, and filters by gender, size, colour, price range, and collection. React will be used to provide responsive pages for product browsing, product details, shopping cart management, and checkout."),
    ("3.1.3 Development Environment", "A structured development environment supports testing and integration before software is released. A systematic review of continuous integration research found that it can improve software-development activities and quality assurance, although technical challenges must also be managed (Soares et al., 2022). The system will be developed and tested in a separate environment before deployment so that problems in authentication, product management, shopping carts, orders, and inventory can be identified without affecting the deployed system."),
    ("3.1.4 Version Control Tools", "Version control supports reliable software development by recording code changes and allowing earlier versions to be restored when necessary. Research on GitHub projects found that continuous integration can improve productivity without an observable reduction in code quality (Vasilescu et al., 2015). Git will be used to maintain the source-code history and support testing, maintenance, and error recovery throughout the development of the Fashion Store E-Commerce System."),
    ("3.1.5 Back-end Development Technologies", "The backend manages business logic, data processing, authentication, and communication between the frontend and database. Research comparing RESTful web services with more complex web-service approaches identifies REST as a suitable architectural approach for many web applications (Pautasso, Zimmermann and Leymann, 2008). Java and Spring Boot will be used to develop REST-based backend services for customer accounts, products, product variants, shopping carts, orders, payments, and inventory management."),
]

NEW_REFERENCES = [
    "Kamis, A., Stern, T. and Ladik, D.M. (2010) 'A flow-based model of web site intentions when users customize products in business-to-consumer electronic commerce', Information Systems Frontiers, 12(2), pp. 157-168. Available at: https://doi.org/10.1007/s10796-008-9135-y (Accessed: 4 October 2026).",
    "Kvet, M., Fidesova, L. and Matiasko, K. (2016) 'Experimental comparison of syntax and semantics of DBS Oracle and MySQL'. 2016 19th Conference of Open Innovations Association (FRUCT). Available at: https://doi.org/10.23919/FRUCT.2016.7892192 (Accessed: 4 October 2026).",
    "Pautasso, C., Zimmermann, O. and Leymann, F. (2008) 'RESTful Web Services vs. “Big” Web Services: Making the Right Architectural Decision'. Proceedings of the 17th International Conference on World Wide Web, pp. 805-814. Available at: https://doi.org/10.1145/1367497.1367606 (Accessed: 4 October 2026).",
    "Soares, E., Sizilio, G., Santos, J., Alencar da Costa, D. and Kulesza, U. (2022) 'The effects of continuous integration on software development: A systematic literature review', Empirical Software Engineering, 27(3), 78. Available at: https://doi.org/10.1007/s10664-021-10114-1 (Accessed: 4 October 2026).",
    "Vasilescu, B., Yu, Y., Wang, H., Devanbu, P. and Filkov, V. (2015) 'Quality and productivity outcomes relating to continuous integration in GitHub'. Proceedings of the 10th Joint Meeting on Foundations of Software Engineering, pp. 805-816. Available at: https://doi.org/10.1145/2786805.2786850 (Accessed: 4 October 2026).",
]


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


with ZipFile(FILE, "r") as source:
    root = etree.fromstring(source.read("word/document.xml"))
    paragraphs = root.xpath("//w:p", namespaces=NS)
    get = lambda text: next((p for p in paragraphs if paragraph_text(p) == text), None)
    heading = get("3.1 Related Works")
    literature_heading = get("3.2 Literature Review")
    body_template = next((p for p in paragraphs if paragraph_text(p).startswith("Previous studies show that product search")), None)
    if None in (heading, literature_heading, body_template):
        raise ValueError("Expected Related Works paragraphs were not found.")
    if any(paragraph_text(p).startswith("3.1.1 MySQL") for p in paragraphs):
        raise ValueError("The subsection structure already exists; no edit was made.")

    # Remove the current two-paragraph 3.1 content while preserving its title.
    parent = heading.getparent()
    children = list(parent)
    start = children.index(heading) + 1
    end = children.index(literature_heading)
    for paragraph in children[start:end]:
        if paragraph.tag == f"{{{W}}}p":
            parent.remove(paragraph)

    # Rebuild 3.1 using the existing heading/body formatting.
    position = list(parent).index(heading) + 1
    for title, body in SUBSECTIONS:
        new_heading = deepcopy(heading)
        new_body = deepcopy(body_template)
        set_text(new_heading, title)
        set_text(new_body, body)
        parent.insert(position, new_heading)
        parent.insert(position + 1, new_body)
        position += 2

    # Replace two no-longer-used sources with five peer-reviewed sources.
    reference_template = next((p for p in root.xpath("//w:p", namespaces=NS) if paragraph_text(p).startswith("Abouelrous,")), None)
    if reference_template is None:
        raise ValueError("Reference template not found.")
    reference_parent = reference_template.getparent()
    for paragraph in list(reference_parent):
        if paragraph.tag == f"{{{W}}}p" and paragraph_text(paragraph).startswith(("Jiang, B.", "Ornati, M.")):
            reference_parent.remove(paragraph)
    for reference in NEW_REFERENCES:
        new_reference = deepcopy(reference_template)
        set_text(new_reference, reference)
        reference_parent.append(new_reference)

    # Sort all reference entries alphabetically in their existing SDT container.
    reference_entries = [
        p for p in list(reference_parent)
        if p.tag == f"{{{W}}}p" and "Available at:" in paragraph_text(p)
    ]
    for entry in reference_entries:
        reference_parent.remove(entry)
    for index, entry in enumerate(sorted(reference_entries, key=lambda p: paragraph_text(p).casefold())):
        reference_parent.insert(index, entry)

    xml = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)
    with NamedTemporaryFile(delete=False, suffix=".docx", dir=FILE.parent) as temporary:
        temporary_path = Path(temporary.name)
    try:
        with ZipFile(temporary_path, "w", ZIP_DEFLATED) as output:
            for item in source.infolist():
                output.writestr(item, xml if item.filename == "word/document.xml" else source.read(item.filename))
        backup = Path(r"D:\web code\scratch\COMP-1682-Final Year Project - citations standardised.before-related-subsections.docx")
        backup.write_bytes(FILE.read_bytes())
        with temporary_path.open("rb") as incoming, FILE.open("r+b") as destination:
            destination.seek(0)
            destination.truncate(0)
            destination.write(incoming.read())
            destination.flush()
    finally:
        if temporary_path.exists():
            temporary_path.unlink()

print("Restored scholarly Related Works subsections and updated References.")
