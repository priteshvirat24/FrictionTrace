import { z } from 'zod';

export const structuredFrictionEventSchema = z.object({
  environmentalFactors: z.array(z.string()).describe("Specific environmental triggers, e.g. 'loud cafeteria', 'substitute teacher'"),
  categories: z.array(z.string()).describe("Best matching categories"),
  contextSignals: z.array(z.string()).describe("Important context, e.g. 'Monday morning', 'Math class'"),
  uncertaintySignals: z.array(z.string()).describe("Things that were unclear or unexpected"),
  socialContext: z.string().optional().describe("Social environment details"),
  supportMentioned: z.array(z.string()).optional().describe("Any supports the student mentioned they used or needed"),
  confidence: z.number().min(0).max(1).describe("Confidence in this extraction"),
});

export const evidenceBackedPatternSchema = z.object({
  statement: z.string().describe("The core pattern statement, e.g. '3 of 4 high-friction moments followed unexpected schedule changes.'"),
  supportingMomentIds: z.array(z.string()).describe("IDs of moments supporting this pattern"),
  contradictoryMomentIds: z.array(z.string()).optional().describe("IDs of moments contradicting this pattern"),
  sampleSize: z.number(),
  evidenceStrength: z.enum(["insufficient", "weak", "moderate", "strong"]),
  comparison: z.object({
    conditionA: z.string(),
    conditionB: z.string(),
    observedDifference: z.string().optional(),
  }).optional(),
  limitations: z.array(z.string()).describe("Limitations of this pattern, e.g. 'Only 3 data points'"),
  languageMode: z.enum(["observation", "association"]).describe("Must be observation or association, NEVER causal or diagnostic"),
});

export const evidenceAssessmentSchema = z.object({
  strength: z.enum(["insufficient", "weak", "moderate", "strong"]),
  supportingCount: z.number(),
  contradictoryCount: z.number(),
  confidence: z.number().min(0).max(1),
  limitations: z.array(z.string()),
  recommendation: z.enum(["do_not_surface", "surface_as_observation"]),
});

export const frictionInsightSchema = z.object({
  summary: z.string(),
  patterns: z.array(evidenceBackedPatternSchema),
  helpfulPreferences: z.array(z.string()),
});

export const safetyAssessmentSchema = z.object({
  isSafe: z.boolean(),
  flags: z.array(z.string()).describe("Any safety violations found"),
  reasoning: z.string(),
});
