from copy import deepcopy
from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree


SOURCE = Path(r"C:\Users\pvntr\OneDrive\Desktop\Final 1\COMP-1682-Final Year Project.docx")
OUTPUT = SOURCE.with_name("COMP-1682-Final Year Project - citations standardised.docx")
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W}

REFERENCES = [
    "Amazon Web Services (2026) 'What's the difference between frontend and backend in application development?'. Available at: https://aws.amazon.com/compare/the-difference-between-frontend-and-backend/ (Accessed: 4 October 2026).",
    "Atlassian (2025) 'What is version control?'. Available at: https://www.atlassian.com/git/tutorials/what-is-version-control (Accessed: 4 October 2026).",
    "Competition and Markets Authority (2025) 'What businesses need to know about unfair commercial practices'. Available at: https://www.gov.uk/government/publications/what-businesses-need-to-know-about-unfair-commercial-practices/what-businesses-need-to-know-about-unfair-commercial-practices (Accessed: 4 October 2026).",
    "Conway, L. (2025) 'Consumer Rights Act 2015'. UK Parliament. Available at: https://commonslibrary.parliament.uk/research-briefings/sn06588/ (Accessed: 4 October 2026).",
    "GeeksforGeeks (2025) 'Front-end development'. Available at: https://www.geeksforgeeks.org/blogs/front-end-development/ (Accessed: 4 October 2026).",
    "Government Digital Service (2025) 'Find data ethics guidance, standards and frameworks'. GOV.UK. Available at: https://www.gov.uk/guidance/find-data-ethics-guidance-standards-and-frameworks (Accessed: 4 October 2026).",
    "GOV.UK (2026) 'Data protection: The UK's data protection legislation'. Available at: https://www.gov.uk/data-protection (Accessed: 4 October 2026).",
    "Oracle (2025) 'Java documentation'. Available at: https://docs.oracle.com/en/java/index.html (Accessed: 4 October 2026).",
    "Oracle (2026) 'MySQL 8.0 Reference Manual'. Available at: https://dev.mysql.com/doc/refman/8.0/en/ (Accessed: 4 October 2026).",
    "Ruparelia, N. B. (2010) 'Software development lifecycle models', ACM SIGSOFT Software Engineering Notes, 35(3), pp. 8-13. Available at: https://doi.org/10.1145/1764810.1764814.",
    "Solicitors Regulation Authority (2026) 'Upholding professional ethics'. Available at: https://guidance.sra.org.uk/home/hot-topics/upholding-professional-ethics/ (Accessed: 4 October 2026).",
    "Spring (2026) 'Spring Boot Reference Documentation'. Available at: https://docs.spring.io/spring-boot/reference/ (Accessed: 4 October 2026).",
    "Umbraco (2025) 'Development environment'. Available at: https://umbraco.com/knowledge-base/development-environment/ (Accessed: 4 October 2026).",
    "Zalando (2026) 'Building the ecosystem for fashion and lifestyle e-commerce'. Available at: https://corporate.zalando.com/en/about-us/holistic-strategy-connected-fashion-world (Accessed: 4 October 2026).",
]


def paragraph_text(paragraph):
    return "".join(paragraph.xpath(".//w:t/text()", namespaces=NS))


def run_properties(paragraph):
    run = paragraph.find("w:r", NS)
    if run is None:
        return None
    properties = run.find("w:rPr", NS)
    return deepcopy(properties) if properties is not None else None


def set_paragraph_text(paragraph, text, source_properties=None):
    properties = source_properties if source_properties is not None else run_properties(paragraph)
    ppr = paragraph.find("w:pPr", NS)
    for child in list(paragraph):
        if child is not ppr:
            paragraph.remove(child)
    run = etree.SubElement(paragraph, f"{{{W}}}r")
    if properties is not None:
        run.append(deepcopy(properties))
    content = etree.SubElement(run, f"{{{W}}}t")
    if text.startswith(" ") or text.endswith(" "):
        content.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    content.text = text


def find_paragraph(root, starts_with):
    for paragraph in root.xpath("//w:p", namespaces=NS):
        if paragraph_text(paragraph).startswith(starts_with):
            return paragraph
    raise ValueError(f"Paragraph not found: {starts_with}")


def replace_terminal_with_citation(root, starts_with, citation):
    paragraph = find_paragraph(root, starts_with)
    current = paragraph_text(paragraph).strip()
    if current.endswith("."):
        current = current[:-1]
    set_paragraph_text(paragraph, f"{current} ({citation}).")


with ZipFile(SOURCE, "r") as source_zip:
    document_xml = source_zip.read("word/document.xml")
    root = etree.fromstring(document_xml)

    # Update in-text citations to one Harvard author-date style.
    mysql = find_paragraph(root, "MySQL is an open source")
    mysql_text = paragraph_text(mysql)
    mysql_text = mysql_text.split(" (Manual, 2024)")[0]
    set_paragraph_text(mysql, f"{mysql_text} (Oracle, 2026).")

    replace_terminal_with_citation(root, "Front-end Development is", "GeeksforGeeks, 2025")
    replace_terminal_with_citation(root, "The development environment is often", "Umbraco, 2025")
    replace_terminal_with_citation(root, "Version control, also known as source control", "Atlassian, 2025")
    replace_terminal_with_citation(root, "The backend (or server side)", "Amazon Web Services, 2026")

    technology = find_paragraph(root, "Web-based systems are suitable for e-commerce")
    set_paragraph_text(
        technology,
        "Web-based systems are suitable for e-commerce because users can access the system directly through a web browser. "
        "For this project, Java is selected as the main programming language because it supports object-oriented programming "
        "and is widely used for web and enterprise applications (Oracle, 2025). Spring Boot is used as the main development "
        "framework because it simplifies Java web development and supports database access, security, and application structure "
        "(Spring, 2026). A relational database such as MySQL can also be used to store information about users, products, "
        "categories, product variants, shopping carts, orders, and inventory (Oracle, 2026). These technologies provide a suitable "
        "technical foundation for developing a structured online fashion store.",
    )

    waterfall = find_paragraph(root, "The project will use the Waterfall Model")
    set_paragraph_text(
        waterfall,
        "The project will use the Waterfall Model as the software development methodology. Waterfall follows a sequential process "
        "that normally includes requirements analysis, system design, implementation, testing, deployment, and maintenance "
        "(Ruparelia, 2010). This model is suitable for the project because the main requirements are identified before development "
        "begins. Major changes after the requirements phase should be limited because changes can affect system design, development "
        "time, testing, and project cost. The project is planned to be completed within six months following these phases.",
    )

    methodology = find_paragraph(root, "The Waterfall Model is used as the main software")
    set_paragraph_text(
        methodology,
        "The Waterfall Model is used as the main software development methodology for the Fashion Store E-Commerce Website. "
        "This methodology follows a structured and sequential process, where each development phase is completed before proceeding "
        "to the next phase. The project consists of six main phases: Requirements Analysis, System Design, Implementation, Testing, "
        "Deployment, and Maintenance (Ruparelia, 2010).",
    )

    replace_terminal_with_citation(root, "Legal issues in an e-commerce system", "Conway, 2025; GOV.UK, 2026")
    replace_terminal_with_citation(root, "Social issues in e-commerce", "Competition and Markets Authority, 2025")
    replace_terminal_with_citation(root, "Ethical issues in e-commerce", "Government Digital Service, 2025")
    replace_terminal_with_citation(root, "Professional issues in e-commerce", "Solicitors Regulation Authority, 2026")

    # Replace every existing reference entry with a single alphabetized Harvard-style list.
    first_reference = find_paragraph(root, "atlassian.")
    reference_parent = first_reference.getparent()
    reference_position = reference_parent.index(first_reference)
    old_reference_starts = (
        "atlassian.", "Authority, C. a.", "Authority, S. R.", "aws.amazon.", "Conway, L.",
        "geeksforgeeks.", "gov.uk.", "Manual, O. M.", "Overview, O. M.", "Service, G. D.", "umbraco.",
    )
    old_entries = [
        paragraph for paragraph in reference_parent.xpath("./w:p", namespaces=NS)
        if paragraph_text(paragraph).startswith(old_reference_starts)
    ]
    ref_properties = run_properties(first_reference)
    ref_ppr = deepcopy(first_reference.find("w:pPr", NS))
    for paragraph in old_entries:
        reference_parent.remove(paragraph)
    for offset, entry in enumerate(REFERENCES):
        paragraph = etree.Element(f"{{{W}}}p")
        if ref_ppr is not None:
            paragraph.append(deepcopy(ref_ppr))
        set_paragraph_text(paragraph, entry, ref_properties)
        reference_parent.insert(reference_position + offset, paragraph)

    updated_xml = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)
    with NamedTemporaryFile(delete=False, suffix=".docx", dir=SOURCE.parent) as temporary:
        temporary_path = Path(temporary.name)
    try:
        with ZipFile(temporary_path, "w", ZIP_DEFLATED) as output_zip:
            for item in source_zip.infolist():
                output_zip.writestr(item, updated_xml if item.filename == "word/document.xml" else source_zip.read(item.filename))
        temporary_path.replace(OUTPUT)
    finally:
        if temporary_path.exists():
            temporary_path.unlink()
