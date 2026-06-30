import fitz
import re


def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text += page.get_text()
        doc.close()
        return clean_text(text)
    except Exception as e:
        raise ValueError(f"Could not read PDF: {str(e)}")


def clean_text(text: str) -> str:
    text = re.sub(r'\n\s*\n', '\n\n', text)
    text = re.sub(r' +', ' ', text)
    return text.strip()


def chunk_text(text: str, chunk_size: int = 2000) -> list[str]:
    words = text.split()
    chunks = []
    current_chunk = []
    current_size = 0
    for word in words:
        current_chunk.append(word)
        current_size += len(word) + 1
        if current_size >= chunk_size:
            chunks.append(' '.join(current_chunk))
            current_chunk = []
            current_size = 0
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    return chunks