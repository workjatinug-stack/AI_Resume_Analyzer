import { describe, expect, it } from "vitest";
import { normalizeResumeAnalysis } from "./resumePrompt";

describe("resume analysis contract", () => {
  it("preserves all six score dimensions from a structured response", () => {
    const result = normalizeResumeAnalysis({
      analysis_status: "complete",
      overall_score: 74,
      score_label: "Strong",
      confidence: 0.9,
      executive_summary: "Clear profile with measurable impact.",
      section_scores: {
        job_alignment: 80,
        skills_evidence: 72,
        achievement_strength: 68,
        clarity_readability: 76,
        structure_completeness: 70,
        ats_compatibility: 84,
      },
    });
    expect(result.section_scores).toEqual({
      job_alignment: 80,
      skills_evidence: 72,
      achievement_strength: 68,
      clarity_readability: 76,
      structure_completeness: 70,
      ats_compatibility: 84,
    });
  });

  it("returns a safe insufficient-data result for malformed model output", () => {
    const result = normalizeResumeAnalysis({ overall_score: "not-a-number" });
    expect(result.analysis_status).toBe("insufficient_data");
    expect(result.score_label).toBe("Insufficient Data");
    expect(result.limitations.length).toBeGreaterThan(0);
  });
});
