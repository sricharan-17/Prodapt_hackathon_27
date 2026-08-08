import json
import os
from typing import Dict, List, Any, Optional

ONTOLOGY_PATH = os.path.join(os.path.dirname(__file__), "skills.json")

class SkillOntology:
    def __init__(self):
        self.data = self._load_ontology()
        self.skills_map = self.data.get("skills", {})
        self.synonym_to_canonical = {}
        self._build_synonym_index()

    def _load_ontology(self) -> Dict[str, Any]:
        if os.path.exists(ONTOLOGY_PATH):
            with open(ONTOLOGY_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        return {"categories": [], "skills": {}}

    def _build_synonym_index(self):
        for canonical, info in self.skills_map.items():
            self.synonym_to_canonical[canonical.lower()] = canonical
            for syn in info.get("synonyms", []):
                self.synonym_to_canonical[syn.lower()] = canonical

    def normalize_skill(self, raw_skill: str) -> str:
        cleaned = raw_skill.strip()
        lower = cleaned.lower()
        if lower in self.synonym_to_canonical:
            return self.synonym_to_canonical[lower]
        # Partial substring matching for synonyms
        for syn, canonical in self.synonym_to_canonical.items():
            if syn in lower or lower in syn:
                return canonical
        return cleaned

    def get_skill_info(self, skill_name: str) -> Optional[Dict[str, Any]]:
        canonical = self.normalize_skill(skill_name)
        return self.skills_map.get(canonical)

    def classify_skill_match(
        self, req_skill: str, candidate_skills: List[str], evidence_snippets: List[str]
    ) -> Dict[str, Any]:
        """
        Classifies relationship between JD requirement and candidate skills/evidence.
        Returns:
          - match_type: EXACT_MATCH | PARTIAL_MATCH | RELATED_MATCH | TRANSFERABLE_SKILL | MISSING
          - score_multiplier: 1.0 | 0.7 | 0.5 | 0.5 | 0.0
          - canonical_skill: str
          - matched_with: str or None
          - category: str
          - explanation: str
        """
        req_canonical = self.normalize_skill(req_skill)
        req_info = self.get_skill_info(req_canonical) or {}
        req_category = req_info.get("category", "General")
        req_synonyms = [s.lower() for s in req_info.get("synonyms", [])] + [req_canonical.lower()]
        req_related = [s.lower() for s in req_info.get("related", [])]

        norm_candidate_skills = [self.normalize_skill(s) for s in candidate_skills]
        norm_candidate_lower = [s.lower() for s in norm_candidate_skills]

        # 1. EXACT MATCH (Direct match or exact synonym match)
        if req_canonical.lower() in norm_candidate_lower or req_canonical in norm_candidate_skills:
            return {
                "match_type": "EXACT_MATCH",
                "score_multiplier": 1.0,
                "canonical_skill": req_canonical,
                "matched_with": req_canonical,
                "category": req_category,
                "explanation": f"Exact match found for {req_canonical}."
            }
        
        for cand_s in norm_candidate_skills:
            cand_lower = cand_s.lower()
            if cand_lower in req_synonyms:
                return {
                    "match_type": "EXACT_MATCH",
                    "score_multiplier": 1.0,
                    "canonical_skill": req_canonical,
                    "matched_with": cand_s,
                    "category": req_category,
                    "explanation": f"Exact synonym match: candidate has '{cand_s}' matching required '{req_canonical}'."
                }

        # Check evidence text for direct exact mentions
        combined_evidence = " ".join(evidence_snippets).lower()
        if any(syn in combined_evidence for syn in req_synonyms):
            return {
                "match_type": "EXACT_MATCH",
                "score_multiplier": 1.0,
                "canonical_skill": req_canonical,
                "matched_with": req_canonical,
                "category": req_category,
                "explanation": f"Resume text explicitly demonstrates direct evidence for {req_canonical}."
            }

        # 2. RELATED MATCH (Parent/Child/Related skill in candidate list)
        for cand_s in norm_candidate_skills:
            cand_info = self.get_skill_info(cand_s) or {}
            cand_parent = cand_info.get("parent", "").lower()
            cand_related = [r.lower() for r in cand_info.get("related", [])]
            
            # If candidate skill lists required skill as parent or related
            if (req_canonical.lower() in cand_related or 
                req_canonical.lower() == cand_parent or 
                cand_s.lower() in req_related):
                return {
                    "match_type": "RELATED_MATCH",
                    "score_multiplier": 0.7,
                    "canonical_skill": req_canonical,
                    "matched_with": cand_s,
                    "category": req_category,
                    "explanation": f"Related skill match: candidate demonstrates '{cand_s}' which is closely related to '{req_canonical}' in the ontology."
                }

        # 3. PARTIAL MATCH (Evidence mentions related API or technology without full stack depth)
        if combined_evidence and any(rel in combined_evidence for rel in req_related):
            rel_found = [rel for rel in req_related if rel in combined_evidence][0].title()
            return {
                "match_type": "PARTIAL_MATCH",
                "score_multiplier": 0.6,
                "canonical_skill": req_canonical,
                "matched_with": rel_found,
                "category": req_category,
                "explanation": f"Partial evidence found: resume mentions related context '{rel_found}', but '{req_canonical}' is not explicitly verified."
            }

        # 4. TRANSFERABLE SKILL (Same category skill present)
        for cand_s in norm_candidate_skills:
            cand_info = self.get_skill_info(cand_s) or {}
            if cand_info.get("category") == req_category and req_category != "General":
                return {
                    "match_type": "TRANSFERABLE_SKILL",
                    "score_multiplier": 0.5,
                    "canonical_skill": req_canonical,
                    "matched_with": cand_s,
                    "category": req_category,
                    "explanation": f"Transferable skill match: candidate has background in '{cand_s}' within the same {req_category} category."
                }

        # 5. MISSING (No evidence or ontology correlation)
        return {
            "match_type": "MISSING",
            "score_multiplier": 0.0,
            "canonical_skill": req_canonical,
            "matched_with": None,
            "category": req_category,
            "explanation": f"No relevant evidence or related ontology skills found in resume for '{req_canonical}'."
        }

# Global singleton
ontology_service = SkillOntology()
