import { describe, it, expect } from "vitest";
import { assessment } from "../data/content";
import { summarizeAssessment } from "./assessment";
import type { AssessmentResponse } from "../engine/types";
describe("paired learning assessment", () => {
  it("keeps decision/reason scores separate; skipping is unmeasured", () => {
    expect(summarizeAssessment(assessment.pre, [])).toBeNull();
    const responses: AssessmentResponse[] = assessment.pre.map((q, i) => ({
      questionId: q.id,
      pairId: q.pairId,
      selectedOption: q.options.find((a) => a.isCorrect)!.key,
      selectedReason: q.reasonOptions.find((a) => !a.isCorrect)!.key,
      confidenceLevel: 2,
      responseTimeSeconds: [9, 2, 7, 4, 5][i],
    }));
    expect(summarizeAssessment(assessment.pre, responses)).toEqual({
      decisionScore: 100,
      reasonScore: 0,
      confidence: [0, 5, 0],
      medianActiveSeconds: 5,
    });
  });
});
