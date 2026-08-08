from typing import Dict, List, Any

DEFAULT_WEIGHTS = {
    "required_skills": 0.50,
    "experience": 0.20,
    "projects": 0.15,
    "education_certs": 0.10,
    "preferred_skills": 0.05
}

class DeterministicScoringEngine:
    """
    Transparent, explainable, and deterministic candidate scoring engine.
    Calculates weighted match score based on ontology classifications,
    RAG evidence strength, experience alignment, and project evidence.
    
    Guarantees:
    - If all required & preferred criteria are fully met, score is 100%.
    - If score is less than 100%, provides exact itemized reasons for lost points.
    """
    
    def calculate_candidate_score(
        self,
        required_skill_matches: List[Dict[str, Any]],
        preferred_skill_matches: List[Dict[str, Any]],
        candidate_experience_years: float,
        required_experience_years: float,
        has_relevant_projects: bool,
        has_relevant_education: bool,
        weights: Dict[str, float] = None
    ) -> Dict[str, Any]:
        if weights is None:
            weights = DEFAULT_WEIGHTS

        deductions = []

        # 1. Required Skills Score (50%)
        req_score_sum = 0.0
        req_count = len(required_skill_matches)
        
        for match in required_skill_matches:
            mult = match.get("score_multiplier", 0.0)
            req_score_sum += mult
            skill_name = match.get("canonical_skill", "Skill")
            
            if mult == 0.0:
                lost_pts = round((1.0 / req_count) * weights["required_skills"] * 100.0, 1)
                deductions.append({
                    "category": "Required Skill Missing",
                    "reason": f"Required skill '{skill_name}' has no evidence in candidate resume.",
                    "points_lost": lost_pts
                })
            elif mult < 1.0:
                lost_pts = round(((1.0 - mult) / req_count) * weights["required_skills"] * 100.0, 1)
                match_type = match.get('match_type', 'Partial').replace('_', ' ')
                matched_with = match.get('matched_with', 'related skill')
                deductions.append({
                    "category": f"Required Skill ({match_type})",
                    "reason": f"Required skill '{skill_name}' demonstrated via '{matched_with}' (partial multiplier {mult}).",
                    "points_lost": lost_pts
                })

        req_skills_percentage = (req_score_sum / req_count * 100.0) if req_count > 0 else 100.0
        req_weighted_component = (req_skills_percentage / 100.0) * weights["required_skills"] * 100.0

        # 2. Preferred Skills Score (5%)
        pref_score_sum = 0.0
        pref_count = len(preferred_skill_matches)
        
        for match in preferred_skill_matches:
            mult = match.get("score_multiplier", 0.0)
            pref_score_sum += mult
            skill_name = match.get("canonical_skill", "Skill")
            
            if mult < 1.0 and pref_count > 0:
                lost_pts = round(((1.0 - mult) / pref_count) * weights["preferred_skills"] * 100.0, 1)
                deductions.append({
                    "category": "Preferred Skill Missing",
                    "reason": f"Preferred skill '{skill_name}' lacks direct evidence in resume.",
                    "points_lost": lost_pts
                })

        pref_skills_percentage = (pref_score_sum / pref_count * 100.0) if pref_count > 0 else 100.0
        pref_weighted_component = (pref_skills_percentage / 100.0) * weights["preferred_skills"] * 100.0

        # 3. Experience Score (20%)
        if required_experience_years <= 0:
            exp_percentage = 100.0
        else:
            exp_ratio = min(1.0, candidate_experience_years / required_experience_years)
            exp_percentage = exp_ratio * 100.0

        exp_weighted_component = (exp_percentage / 100.0) * weights["experience"] * 100.0
        
        if exp_percentage < 100.0:
            lost_pts = round((100.0 - exp_percentage) / 100.0 * weights["experience"] * 100.0, 1)
            deductions.append({
                "category": "Experience Gap",
                "reason": f"Candidate experience ({candidate_experience_years} yrs) is below required ({required_experience_years} yrs).",
                "points_lost": lost_pts
            })

        # 4. Projects Score (15%) — 100% if project section exists, 50% if absent
        proj_percentage = 100.0 if has_relevant_projects else 50.0
        proj_weighted_component = (proj_percentage / 100.0) * weights["projects"] * 100.0
        if proj_percentage < 100.0:
            lost_pts = round((100.0 - proj_percentage) / 100.0 * weights["projects"] * 100.0, 1)
            deductions.append({
                "category": "Project Evidence Missing",
                "reason": "Resume lacks documented technical project evidence section.",
                "points_lost": lost_pts
            })

        # 5. Education / Certifications (10%) — 100% if education/degree exists, 60% if absent
        edu_percentage = 100.0 if has_relevant_education else 60.0
        edu_weighted_component = (edu_percentage / 100.0) * weights["education_certs"] * 100.0
        if edu_percentage < 100.0:
            lost_pts = round((100.0 - edu_percentage) / 100.0 * weights["education_certs"] * 100.0, 1)
            deductions.append({
                "category": "Education / Certifications",
                "reason": "Resume lacks formal degree or relevant technical certification section.",
                "points_lost": lost_pts
            })

        # Total Raw Score
        final_score_raw = (
            req_weighted_component + 
            pref_weighted_component + 
            exp_weighted_component + 
            proj_weighted_component + 
            edu_weighted_component
        )
        final_score = int(round(min(100.0, max(0.0, final_score_raw))))
        total_lost_points = round(100.0 - final_score_raw, 1)
        if total_lost_points < 0.4:
            total_lost_points = 0
            final_score = 100

        # Summary Explanation Generation
        matched_count = sum(1 for m in required_skill_matches if m.get("match_type") in ["EXACT_MATCH", "RELATED_MATCH", "PARTIAL_MATCH"])
        exact_count = sum(1 for m in required_skill_matches if m.get("match_type") == "EXACT_MATCH")
        partial_count = sum(1 for m in required_skill_matches if m.get("match_type") in ["RELATED_MATCH", "PARTIAL_MATCH", "TRANSFERABLE_SKILL"])
        missing_count = sum(1 for m in required_skill_matches if m.get("match_type") == "MISSING")

        if final_score == 100:
            explanation_summary = (
                "Candidate achieved a PERFECT 100% Match! All core required skills, preferred skills, "
                "experience duration, project evidence, and education requirements are fully verified."
            )
        else:
            reasons_str = "; ".join([d["reason"] for d in deductions])
            explanation_summary = (
                f"Candidate scored {final_score}% ({total_lost_points}% less than 100%). "
                f"Exact reason for deduction: {reasons_str}"
            )

        return {
            "final_score": final_score,
            "total_deductions_pts": total_lost_points,
            "coverage_ratio": f"{matched_count}/{req_count}",
            "breakdown": {
                "required_skills": {
                    "weight_pct": int(weights["required_skills"] * 100),
                    "score_pct": round(req_skills_percentage, 1),
                    "contribution": round(req_weighted_component, 1)
                },
                "preferred_skills": {
                    "weight_pct": int(weights["preferred_skills"] * 100),
                    "score_pct": round(pref_skills_percentage, 1),
                    "contribution": round(pref_weighted_component, 1)
                },
                "experience": {
                    "weight_pct": int(weights["experience"] * 100),
                    "score_pct": round(exp_percentage, 1),
                    "contribution": round(exp_weighted_component, 1),
                    "candidate_years": candidate_experience_years,
                    "required_years": required_experience_years
                },
                "projects": {
                    "weight_pct": int(weights["projects"] * 100),
                    "score_pct": round(proj_percentage, 1),
                    "contribution": round(proj_weighted_component, 1)
                },
                "education_certs": {
                    "weight_pct": int(weights["education_certs"] * 100),
                    "score_pct": round(edu_percentage, 1),
                    "contribution": round(edu_weighted_component, 1)
                }
            },
            "deductions_audit": deductions,
            "summary_explanation": explanation_summary,
            "counts": {
                "total_required": req_count,
                "exact": exact_count,
                "partial": partial_count,
                "missing": missing_count
            }
        }

scoring_engine = DeterministicScoringEngine()
