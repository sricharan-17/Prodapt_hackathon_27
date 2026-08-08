import os
import json
import requests
from typing import Dict, List, Any

class LLMExplanationService:
    """
    AI Candidate Summary & Grounded Reasoning Engine.
    Strictly uses retrieved RAG evidence and Skill Ontology matching results.
    Never invents unverified candidate experience.
    """

    def generate_candidate_summary(
        self,
        candidate_name: str,
        job_title: str,
        required_matches: List[Dict[str, Any]],
        preferred_matches: List[Dict[str, Any]],
        overall_score: int
    ) -> str:
        """
        Generates an evidence-grounded executive summary of candidate fit.
        """
        exact_skills = [m["canonical_skill"] for m in required_matches if m.get("match_type") == "EXACT_MATCH"]
        related_skills = [f"{m['canonical_skill']} (via {m.get('matched_with')})" for m in required_matches if m.get("match_type") in ["RELATED_MATCH", "PARTIAL_MATCH", "TRANSFERABLE_SKILL"]]
        missing_skills = [m["canonical_skill"] for m in required_matches if m.get("match_type") == "MISSING"]

        exact_str = ", ".join(exact_skills) if exact_skills else "none"
        related_str = ", ".join(related_skills) if related_skills else "none"
        missing_str = ", ".join(missing_skills) if missing_skills else "none"

        summary = (
            f"{candidate_name} demonstrates a {overall_score}% match alignment for the '{job_title}' position. "
            f"Strong verified evidence was found for required skills: {exact_str}. "
        )

        if related_skills:
            summary += f"Partial and related ontology alignment was identified for: {related_str}. "

        if missing_skills:
            summary += f"Key skill gaps where no direct resume evidence was found include: {missing_str}. "
        else:
            summary += "No critical skill gaps were identified against core job requirements. "

        summary += (
            "All match classifications are grounded strictly in retrieved resume section evidence "
            "and normalized skill ontology relationships."
        )

        return summary

    def analyze_skill_gap_severity(
        self, missing_skill: str, candidate_skills: List[str]
    ) -> Dict[str, Any]:
        """
        Analyzes severity and transferable skills for a missing JD skill requirement.
        """
        from app.ontology.ontology_service import ontology_service
        info = ontology_service.get_skill_info(missing_skill) or {}
        category = info.get("category", "General")
        related = info.get("related", [])

        candidate_norm = [ontology_service.normalize_skill(s) for s in candidate_skills]
        found_related = [r for r in related if ontology_service.normalize_skill(r) in candidate_norm]

        if found_related:
            severity = "Medium"
            reason = f"Candidate lacks direct '{missing_skill}' evidence, but possesses related skill(s): {', '.join(found_related)}."
        else:
            severity = "High"
            reason = f"No direct or related skills found in candidate profile for '{missing_skill}' within {category} domain."

        return {
            "skill": missing_skill,
            "severity": severity,
            "category": category,
            "related_candidate_skills": found_related,
            "explanation": reason
        }

llm_service = LLMExplanationService()
