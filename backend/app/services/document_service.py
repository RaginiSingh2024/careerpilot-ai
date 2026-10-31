import fitz  # PyMuPDF
import io
import re

class DocumentService:
    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes) -> str:
        """Extracts text from PDF bytes safely using PyMuPDF."""
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            extracted_pages = []
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text("text")
                if text:
                    extracted_pages.append(text)
            doc.close()
            full_text = "\n\n".join(extracted_pages).strip()
            
            # Clean up excessive whitespace while preserving structure
            full_text = re.sub(r'\n{3,}', '\n\n', full_text)
            return full_text
        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")

    @staticmethod
    def sanitize_text(text: str, max_chars: int = 50000) -> str:
        """Sanitizes text and caps character count for LLM prompt safety."""
        if not text:
            return ""
        # Remove null bytes and non-printable characters
        cleaned = "".join(char for char in text if char.isprintable() or char in "\n\r\t")
        return cleaned[:max_chars].strip()

document_service = DocumentService()

