import { useEffect, useRef, useState } from "react";
import { assessment } from "../data/content";
import type { AssessmentResponse, ChoiceKey } from "../engine/types";
interface Props {
  phase: "pre" | "post";
  responses: AssessmentResponse[];
  onAnswer: (r: AssessmentResponse) => void;
  onDone: () => void;
}
export function Assessment({ phase, responses, onAnswer, onDone }: Props) {
  const questions = assessment[phase];
  const question = questions.find(
    (q) => !responses.some((r) => r.questionId === q.id),
  );
  if (!question)
    return (
      <section className="panel narrow">
        <h1>{phase === "pre" ? "Pre-test" : "Post-test"} selesai</h1>
        <p>
          Jawaban tersimpan dalam sesi ini. Skor keputusan dan alasan
          ditampilkan terpisah pada rapor.
        </p>
        <button className="primary" onClick={onDone}>
          Lanjut
        </button>
      </section>
    );
  return (
    <Question
      key={question.id}
      question={question}
      index={responses.length}
      onAnswer={onAnswer}
      onSkip={onDone}
    />
  );
}
function Question({
  question,
  index,
  onAnswer,
  onSkip,
}: {
  question: (typeof assessment.pre)[number];
  index: number;
  onAnswer: Props["onAnswer"];
  onSkip: () => void;
}) {
  const [selected, setSelected] = useState<ChoiceKey | null>(null);
  const [reason, setReason] = useState<ChoiceKey | null>(null);
  const [confidence, setConfidence] = useState<1 | 2 | 3>(2);
  const started = useRef(document.hidden ? null : performance.now());
  const elapsed = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
    const onVisibility = () => {
      if (document.hidden) {
        if (started.current !== null)
          elapsed.current += performance.now() - started.current;
        started.current = null;
      } else started.current = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);
  const submit = () => {
    if (!selected || !reason) return;
    const ms =
      elapsed.current +
      (started.current === null ? 0 : performance.now() - started.current);
    onAnswer({
      questionId: question.id,
      pairId: question.pairId,
      selectedOption: selected,
      selectedReason: reason,
      confidenceLevel: confidence,
      responseTimeSeconds: Math.round(ms / 100) / 10,
    });
  };
  return (
    <section className="panel narrow assessment">
      <p className="muted">
        {question.phase === "pre" ? "Sebelum bermain" : "Setelah bermain"} ·
        Pertanyaan {index + 1} dari 5
      </p>
      <progress value={index} max={5} aria-label="Progres pertanyaan" />
      <h1 ref={heading} tabIndex={-1}>
        {question.scenarioText}
      </h1>
      <fieldset>
        <legend>Pilih jawaban</legend>
        {question.options.map((a) => (
          <label
            className={`choice ${selected === a.key ? "selected" : ""}`}
            key={a.key}
          >
            <input
              type="radio"
              name="answer"
              checked={selected === a.key}
              onChange={() => setSelected(a.key)}
            />
            <span>{a.text}</span>
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Apa alasannya?</legend>
        {question.reasonOptions.map((a) => (
          <label
            className={`choice ${reason === a.key ? "selected" : ""}`}
            key={a.key}
          >
            <input
              type="radio"
              name="reason"
              checked={reason === a.key}
              onChange={() => setReason(a.key)}
            />
            <span>{a.text}</span>
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Seberapa yakin kamu?</legend>
        <div className="segments">
          {([1, 2, 3] as const).map((v, i) => (
            <button
              key={v}
              aria-pressed={confidence === v}
              className={confidence === v ? "selected" : ""}
              onClick={() => setConfidence(v)}
            >
              {["Belum yakin", "Cukup yakin", "Yakin"][i]}
            </button>
          ))}
        </div>
      </fieldset>
      <button
        className="primary"
        disabled={!selected || !reason}
        onClick={submit}
      >
        Simpan jawaban
      </button>
      <button className="text-button" onClick={onSkip}>
        Lewati tes — hasil belum diukur
      </button>
      <p className="caption">
        Pertanyaan latihan buatan tim; belum menjadi instrumen penelitian
        tervalidasi.
      </p>
    </section>
  );
}
