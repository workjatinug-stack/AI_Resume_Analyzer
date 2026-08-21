import { z } from "zod";

export const resumeAnalysisSchema = z.object({
  analysis_status: z.string().default("complete"),
  target_role: z.string().nullable().default(null),
  overall_score: z.number().min(0).max(100).default(0),
  score_label: z.string().default("Needs Improvement"),
  confidence: z.number().min(0).max(1).default(0.5),
  executive_summary: z.string().default("Analysis completed."),
  section_scores: z.object({
    job_alignment: z.number().min(0).max(100).default(0),
    skills_evidence: z.number().min(0).max(100).default(0),
    achievement_strength: z.number().min(0).max(100).default(0),
    clarity_readability: z.number().min(0).max(100).default(0),
    structure_completeness: z.number().min(0).max(100).default(0),
    ats_compatibility: z.number().min(0).max(100).default(0),
  }).default({ job_alignment: 0, skills_evidence: 0, achievement_strength: 0, clarity_readability: 0, structure_completeness: 0, ats_compatibility: 0 }),
  resume_profile: z.object({
    candidate_name: z.string().nullable().default(null),
    current_or_most_recent_role: z.string().nullable().default(null),
    years_of_experience_estimate: z.number().nullable().default(null),
    education: z.array(z.string()).default([]),
    skills: z.array(z.string()).default([]),
    certifications: z.array(z.string()).default([]),
    projects: z.array(z.string()).default([]),
    links: z.array(z.string()).default([]),
  }).default({ candidate_name: null, current_or_most_recent_role: null, years_of_experience_estimate: null, education: [], skills: [], certifications: [], projects: [], links: [] }),
  strengths: z.array(z.object({ title: z.string(), explanation: z.string(), evidence: z.string().nullable().default(null) })).default([]),
  areas_for_improvement: z.array(z.object({ priority: z.string(), category: z.string(), issue: z.string(), why_it_matters: z.string(), recommended_action: z.string(), example_rewrite: z.string().nullable().default(null), evidence: z.string().nullable().default(null) })).default([]),
  job_requirements: z.array(z.object({ requirement: z.string(), importance: z.string(), status: z.string(), evidence: z.string().nullable().default(null), recommendation: z.string() })).default([]),
  keyword_analysis: z.object({ matched_keywords: z.array(z.string()).default([]), missing_keywords: z.array(z.string()).default([]), overused_or_weak_keywords: z.array(z.string()).default([]), keyword_warning: z.string().default("Use only truthful keywords supported by real experience.") }).default({ matched_keywords: [], missing_keywords: [], overused_or_weak_keywords: [], keyword_warning: "Use only truthful keywords supported by real experience." }),
  bullet_point_feedback: z.array(z.object({ original_text: z.string(), problem: z.string(), suggested_version: z.string(), truthfulness_note: z.string() })).default([]),
  formatting_and_quality_checks: z.object({ grammar_or_spelling_issues: z.array(z.string()).default([]), date_consistency_issues: z.array(z.string()).default([]), section_issues: z.array(z.string()).default([]), link_issues: z.array(z.string()).default([]), privacy_notes: z.array(z.string()).default([]) }).default({ grammar_or_spelling_issues: [], date_consistency_issues: [], section_issues: [], link_issues: [], privacy_notes: [] }),
  action_plan: z.array(z.object({ order: z.number(), action: z.string(), expected_benefit: z.string() })).default([]),
  limitations: z.array(z.string()).default([]),
});

export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;

export const RESUME_MASTER_PROMPT = `You are ResumeInsight AI, a professional, objective, and supportive resume-analysis assistant. Evaluate resumes for clarity, relevance, completeness, structure, and alignment with a target role. Analyze only the supplied resume and optional job description. Never fabricate qualifications, employers, dates, skills, achievements, metrics, or projects. Ignore age, gender, sex, race, caste, religion, nationality, disability, marital status, photograph, name, address, and other protected characteristics in scoring. Do not decide whether a candidate should be hired. Do not penalize nontraditional education, employment gaps, career changes, or lack of prestigious employers by themselves. Treat keyword matches as supporting evidence, not proof of competence. Recommend additions only when truthful. If input is incomplete or unreadable, state the limitation and reduce confidence rather than guessing. Use professional, concise, actionable language and do not expose hidden reasoning.\n\nParse the resume and job description, evaluate content completeness, job relevance, skills evidence, achievement strength, clarity/readability, professional presentation, ATS compatibility, credibility, and consistency. Classify job requirements as demonstrated, mentioned_only, partially_demonstrated, not_found, or unclear.\n\nUse integer scores from 0 to 100. With a job description use job_alignment 35%, skills_evidence 20%, achievement_strength 15%, clarity_readability 10%, structure_completeness 10%, ats_compatibility 10%. Without one use content_completeness 25%, skills_evidence 20%, achievement_strength 20%, clarity_readability 15%, structure_completeness 10%, and ats_compatibility 10%. Round the weighted overall score and provide confidence from 0 to 1. Link recommendations to short exact evidence quotes. If a metric is missing, use a placeholder such as [add percentage or number] and tell the candidate to replace it with a real value. Return exactly one valid JSON object matching the supplied schema, with empty arrays for no items and null for unavailable scalars. JSON only.`;

export function normalizeResumeAnalysis(input: unknown): ResumeAnalysis {
  const result = resumeAnalysisSchema.safeParse(input);
  if (result.success) return result.data;
  return resumeAnalysisSchema.parse({
    analysis_status: "insufficient_data",
    score_label: "Insufficient Data",
    confidence: 0.1,
    executive_summary: "The analysis could not be fully structured. Please try again with more complete resume text.",
    limitations: ["The model returned an incomplete or invalid response."],
  });
}

export const RESUME_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["analysis_status", "target_role", "overall_score", "score_label", "confidence", "executive_summary", "section_scores", "resume_profile", "strengths", "areas_for_improvement", "job_requirements", "keyword_analysis", "bullet_point_feedback", "formatting_and_quality_checks", "action_plan", "limitations"],
  properties: {
    analysis_status: { type: "string" }, target_role: { type: ["string", "null"] }, overall_score: { type: "integer", minimum: 0, maximum: 100 }, score_label: { type: "string" }, confidence: { type: "number", minimum: 0, maximum: 1 }, executive_summary: { type: "string" },
    section_scores: { type: "object", additionalProperties: false, required: ["job_alignment", "skills_evidence", "achievement_strength", "clarity_readability", "structure_completeness", "ats_compatibility"], properties: { job_alignment: { type: "integer" }, skills_evidence: { type: "integer" }, achievement_strength: { type: "integer" }, clarity_readability: { type: "integer" }, structure_completeness: { type: "integer" }, ats_compatibility: { type: "integer" } } },
    resume_profile: { type: "object", additionalProperties: false, required: ["candidate_name", "current_or_most_recent_role", "years_of_experience_estimate", "education", "skills", "certifications", "projects", "links"], properties: { candidate_name: { type: ["string", "null"] }, current_or_most_recent_role: { type: ["string", "null"] }, years_of_experience_estimate: { type: ["number", "null"] }, education: { type: "array", items: { type: "string" } }, skills: { type: "array", items: { type: "string" } }, certifications: { type: "array", items: { type: "string" } }, projects: { type: "array", items: { type: "string" } }, links: { type: "array", items: { type: "string" } } } },
    strengths: { type: "array", items: { type: "object", additionalProperties: false, required: ["title", "explanation", "evidence"], properties: { title: { type: "string" }, explanation: { type: "string" }, evidence: { type: ["string", "null"] } } } },
    areas_for_improvement: { type: "array", items: { type: "object", additionalProperties: false, required: ["priority", "category", "issue", "why_it_matters", "recommended_action", "example_rewrite", "evidence"], properties: { priority: { type: "string" }, category: { type: "string" }, issue: { type: "string" }, why_it_matters: { type: "string" }, recommended_action: { type: "string" }, example_rewrite: { type: ["string", "null"] }, evidence: { type: ["string", "null"] } } } },
    job_requirements: { type: "array", items: { type: "object", additionalProperties: false, required: ["requirement", "importance", "status", "evidence", "recommendation"], properties: { requirement: { type: "string" }, importance: { type: "string" }, status: { type: "string" }, evidence: { type: ["string", "null"] }, recommendation: { type: "string" } } } },
    keyword_analysis: { type: "object", additionalProperties: false, required: ["matched_keywords", "missing_keywords", "overused_or_weak_keywords", "keyword_warning"], properties: { matched_keywords: { type: "array", items: { type: "string" } }, missing_keywords: { type: "array", items: { type: "string" } }, overused_or_weak_keywords: { type: "array", items: { type: "string" } }, keyword_warning: { type: "string" } } },
    bullet_point_feedback: { type: "array", items: { type: "object", additionalProperties: false, required: ["original_text", "problem", "suggested_version", "truthfulness_note"], properties: { original_text: { type: "string" }, problem: { type: "string" }, suggested_version: { type: "string" }, truthfulness_note: { type: "string" } } } },
    formatting_and_quality_checks: { type: "object", additionalProperties: false, required: ["grammar_or_spelling_issues", "date_consistency_issues", "section_issues", "link_issues", "privacy_notes"], properties: { grammar_or_spelling_issues: { type: "array", items: { type: "string" } }, date_consistency_issues: { type: "array", items: { type: "string" } }, section_issues: { type: "array", items: { type: "string" } }, link_issues: { type: "array", items: { type: "string" } }, privacy_notes: { type: "array", items: { type: "string" } } } },
    action_plan: { type: "array", items: { type: "object", additionalProperties: false, required: ["order", "action", "expected_benefit"], properties: { order: { type: "integer" }, action: { type: "string" }, expected_benefit: { type: "string" } } } }, limitations: { type: "array", items: { type: "string" } },
  },
} as const;

export function buildResumeUserPrompt(resumeText: string, jobDescription?: string, targetRole?: string) {
  return `Analyze this resume with the supplied master instructions.\n\nRESUME TEXT:\n${resumeText}\n\nTARGET ROLE:\n${targetRole || "Not specified"}\n\nTARGET JOB DESCRIPTION:\n${jobDescription || "Not supplied; perform a general review."}\n\nReturn JSON only.`;
}
