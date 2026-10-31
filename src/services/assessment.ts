import type { AssessmentQuestion, AssessmentResponse } from "../engine/types";
export function summarizeAssessment(
  questions: AssessmentQuestion[],
  responses: AssessmentResponse[],
) {
  const valid = responses.filter((r) =>
    questions.some((q) => q.id === r.questionId && q.pairId === r.pairId),
  );
  if (valid.length !== 5) return null;
  const correct = (r: AssessmentResponse, reason = false) => {
    const q = questions.find((q) => q.id === r.questionId)!;
    return (reason ? q.reasonOptions : q.options).some(
      (a) =>
        a.key === (reason ? r.selectedReason : r.selectedOption) && a.isCorrect,
    );
  };
  const times = valid.map((r) => r.responseTimeSeconds).sort((a, b) => a - b);
  return {
    decisionScore: valid.filter((r) => correct(r)).length * 20,
    reasonScore: valid.filter((r) => correct(r, true)).length * 20,
    confidence: [1, 2, 3].map(
      (level) => valid.filter((r) => r.confidenceLevel === level).length,
    ),
    medianActiveSeconds: times[2],
  };
}
