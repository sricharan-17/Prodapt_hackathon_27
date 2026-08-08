import re
import math
from typing import List, Dict, Any, Tuple
from collections import Counter

class VectorRAGService:
    """
    RAG & Vector Retrieval Engine for Resume Evidence Mining.
    Handles text extraction, chunking, embedding generation, vector search,
    and evidence ranking.
    """
    
    def extract_text_from_file(self, content_bytes: bytes, filename: str) -> str:
        """Extracts plain text from PDF, DOCX, or TXT content."""
        ext = filename.split(".")[-1].lower() if "." in filename else ""
        
        if ext == "pdf":
            try:
                import pypdf
                import io
                reader = pypdf.PdfReader(io.BytesIO(content_bytes))
                text = "\n".join([page.extract_text() or "" for page in reader.pages])
                if text.strip():
                    return text
            except Exception as e:
                print(f"pypdf extraction failed: {e}")

        elif ext in ["docx", "doc"]:
            try:
                import docx
                import io
                doc = docx.Document(io.BytesIO(content_bytes))
                text = "\n".join([para.text for para in doc.paragraphs if para.text])
                if text.strip():
                    return text
            except Exception as e:
                print(f"docx extraction failed: {e}")

        # Fallback to text decoding
        try:
            return content_bytes.decode("utf-8")
        except Exception:
            return content_bytes.decode("latin-1", errors="ignore")

    def chunk_text(self, text: str, chunk_size: int = 300, overlap: int = 50) -> List[Dict[str, Any]]:
        """
        Chunks text into logical sentences/paragraphs with overlapping boundaries.
        Returns list of chunks with metadata.
        """
        paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
        chunks = []
        chunk_id = 0
        
        for p in paragraphs:
            # If paragraph is long, split by sentences or chunks
            sentences = re.split(r'(?<=[.!?])\s+', p)
            current_chunk = ""
            
            for s in sentences:
                if len(current_chunk) + len(s) > chunk_size and current_chunk:
                    chunks.append({
                        "id": chunk_id,
                        "text": current_chunk.strip(),
                        "word_count": len(current_chunk.split())
                    })
                    chunk_id += 1
                    # Retain overlap
                    words = current_chunk.split()
                    overlap_words = words[-max(1, overlap // 10):]
                    current_chunk = " ".join(overlap_words) + " " + s
                else:
                    current_chunk += " " + s if current_chunk else s
            
            if current_chunk.strip():
                chunks.append({
                    "id": chunk_id,
                    "text": current_chunk.strip(),
                    "word_count": len(current_chunk.split())
                })
                chunk_id += 1
                
        return chunks

    def _text_to_vector(self, text: str) -> Dict[str, float]:
        """Converts text into a normalized term-frequency vector for cosine similarity."""
        words = re.findall(r'\w+', text.lower())
        stopwords = {"a", "an", "the", "in", "on", "at", "to", "for", "with", "and", "or", "is", "was", "be", "of"}
        filtered = [w for w in words if w not in stopwords and len(w) > 1]
        counts = Counter(filtered)
        length = math.sqrt(sum(c * c for c in counts.values())) or 1.0
        return {word: count / length for word, count in counts.items()}

    def _cosine_similarity(self, vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
        """Calculates cosine similarity between two vector representations."""
        common = set(vec1.keys()) & set(vec2.keys())
        return sum(vec1[w] * vec2[w] for w in common)

    def retrieve_relevant_evidence(
        self, chunks: List[Dict[str, Any]], query_requirement: str, top_k: int = 2
    ) -> List[Dict[str, Any]]:
        """
        RAG Vector Retrieval: finds the top_k most relevant resume chunks for a given requirement.
        """
        if not chunks:
            return []
            
        query_vec = self._text_to_vector(query_requirement)
        req_words = set(re.findall(r'\w+', query_requirement.lower()))
        
        scored_chunks = []
        for chunk in chunks:
            chunk_vec = self._text_to_vector(chunk["text"])
            similarity = self._cosine_similarity(query_vec, chunk_vec)
            
            # Boost if exact keyword/synonym match is present in chunk
            chunk_lower = chunk["text"].lower()
            exact_hits = sum(1 for w in req_words if len(w) > 2 and w in chunk_lower)
            boosted_score = similarity + (exact_hits * 0.25)
            
            # Cap confidence score between 0.0 and 0.98
            confidence = min(0.98, max(0.15, boosted_score if exact_hits > 0 else similarity * 1.5))
            
            if boosted_score > 0.1:
                scored_chunks.append({
                    "chunk_id": chunk["id"],
                    "text": chunk["text"],
                    "similarity": round(float(similarity), 3),
                    "confidence": round(float(confidence), 2)
                })
                
        # Sort by confidence descending
        scored_chunks.sort(key=lambda x: x["confidence"], reverse=True)
        return scored_chunks[:top_k]

rag_service = VectorRAGService()
