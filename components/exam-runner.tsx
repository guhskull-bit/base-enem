"use client";

import { AppLayout } from "@/components/app-layout";
import { AlternativeButton } from "@/components/alternative-button";
import { FeedbackBox } from "@/components/feedback-box";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Timer } from "@/components/timer";
import { useDemoStore } from "@/components/demo-store-provider";
import { calculateScore } from "@/lib/calculations";
import type { Question, StudentAttempt } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ExamRunner({ examId }: { examId: string }) {
  const router = useRouter();
  const { store, currentUserId, addAttempt, addAnswer } = useDemoStore();
  const profile = store.profiles.find((item) => item.id === currentUserId);
  const exam = store.exams.find((item) => item.id === examId);

  const examQuestions = store.examQuestions
    .filter((item) => item.exam_id === examId)
    .sort((a, b) => a.position - b.position);

  const questions = examQuestions
    .map((item) => store.questions.find((question) => question.id === item.question_id))
    .filter(Boolean) as Question[];

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Question["correct_option"] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    answer: string;
    explanation: string;
  } | null>(null);
  const [startedAt] = useState(Date.now());
  const [attemptId] = useState(() => `attempt-${Date.now()}`);

  const currentQuestion = questions[index];
  const selectedAnswer = selected ?? null;
  const progress = questions.length ? ((index + (revealed ? 1 : 0)) / questions.length) * 100 : 0;

  if (!profile || !exam || !currentQuestion) {
    return (
      <AppLayout>
        <p>Simulado indisponível.</p>
      </AppLayout>
    );
  }

  const handleAnswer = (option: Question["correct_option"]) => {
    if (revealed) return;

    const correct = option === currentQuestion.correct_option;
    setSelected(option);
    setRevealed(true);
    setFeedback({
      correct,
      answer: correct
        ? "Você marcou a alternativa correta."
        : `A resposta correta é ${currentQuestion.correct_option}.`,
      explanation: currentQuestion.explanation,
    });

    addAnswer({
      id: `answer-${Date.now()}`,
      attempt_id: attemptId,
      student_id: profile.id,
      question_id: currentQuestion.id,
      selected_option: option,
      is_correct: correct,
      time_spent_seconds: 25,
      answered_at: new Date().toISOString(),
    });
  };

  const handleNext = () => {
    if (!revealed) return;

    if (index + 1 >= questions.length) {
      const allAnswers = store.answers.filter((answer) => answer.attempt_id === attemptId);
      const correct = allAnswers.filter((answer) => answer.is_correct).length;
      const total = questions.length;

      const attempt: StudentAttempt = {
        id: attemptId,
        student_id: profile.id,
        exam_id: exam.id,
        started_at: new Date(startedAt).toISOString(),
        finished_at: new Date().toISOString(),
        total_questions: total,
        correct_answers: correct,
        score_percent: calculateScore(correct, total),
        total_time_seconds: Math.round((Date.now() - startedAt) / 1000),
      };

      addAttempt(attempt);
      router.push(`/simulados/${exam.id}/resultado`);
      return;
    }

    setIndex((value) => value + 1);
    setSelected(null);
    setRevealed(false);
    setFeedback(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="sticky top-0 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Área do conhecimento</p>
              <h1 className="text-lg font-semibold">{currentQuestion.knowledge_area}</h1>
              <p className="text-sm text-slate-500">Ano da prova {currentQuestion.exam_year}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-slate-500">Timer</p>
              <Timer durationSeconds={(exam.time_limit_minutes ?? 60) * 60} running />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Questão {index + 1} de {questions.length}
              </span>
              <span className="text-gold-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-base leading-6">{currentQuestion.statement}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["A", currentQuestion.option_a],
              ["B", currentQuestion.option_b],
              ["C", currentQuestion.option_c],
              ["D", currentQuestion.option_d],
              ["E", currentQuestion.option_e],
            ].map(([letter, text]) => (
              <AlternativeButton
                key={letter}
                letter={letter as Question["correct_option"]}
                text={text as string}
                selected={selectedAnswer === letter}
                correct={revealed && currentQuestion.correct_option === letter}
                wrong={revealed && selectedAnswer === letter && currentQuestion.correct_option !== letter}
                onClick={() => handleAnswer(letter as Question["correct_option"])}
                disabled={revealed}
              />
            ))}
          </CardContent>
        </Card>

        {feedback ? (
          <FeedbackBox
            correct={feedback.correct}
            answer={feedback.answer}
            explanation={feedback.explanation}
          />
        ) : null}

        <Button onClick={handleNext} disabled={!revealed} className="w-full md:w-auto">
          Próxima questão
        </Button>
      </div>
    </AppLayout>
  );
}
