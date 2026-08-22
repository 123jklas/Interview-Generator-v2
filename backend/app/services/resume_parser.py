import re
import fitz

def extract_text(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    text = "\n".join(page.get_text() for page in doc)
    doc.close()
    return text

SECTION_PATTERN = re.compile(
    r"^\s*(experience|work experience|education|skills|projects|summary|certifications|publications|awards)\s*$",
    re.IGNORECASE | re.MULTILINE,
)

def split_into_sections(text: str) -> list[tuple[str, str]]:
    matches = list(SECTION_PATTERN.finditer(text))
    if not matches:
        return [("general", text)]
    sections = []
    for i, m in enumerate(matches):
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        sections.append((m.group(1).lower(), text[start:end].strip()))
    return sections

def chunk_text(text: str, chunk_size: int = 800, overlap: int = 120) -> list[str]:
    text = text.strip()
    if not text:
        return []
    if len(text) <= chunk_size:
        return [text]
    chunks, start = [], 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks

def chunk_resume(text: str) -> list[dict]:
    result = []
    for section, content in split_into_sections(text):
        for chunk in chunk_text(content):
            if chunk.strip():
                result.append({"section": section, "content": chunk})
    return result