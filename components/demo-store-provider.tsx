"use client";

import { demoStore } from "@/lib/seed";
import type {
  Achievement,
  ClassGroup,
  DemoStore,
  Exam,
  ExamQuestion,
  Profile,
  Question,
  StudentAchievement,
  StudentAnswer,
  StudentAttempt,
} from "@/lib/types";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const storageKey = "base-enem-demo-store";

type DemoStoreContextValue = {
  store: DemoStore;
  currentUserId: string | null;
  setCurrentUserId: (value: string | null) => void;
  upsertProfile: (profile: Profile) => void;
  toggleProfileActive: (id: string) => void;
  upsertClass: (item: ClassGroup) => void;
  toggleClassActive: (id: string) => void;
  upsertQuestion: (item: Question) => void;
  toggleQuestionActive: (id: string) => void;
  upsertExam: (item: Exam) => void;
  toggleExamActive: (id: string) => void;
  upsertExamQuestions: (examId: string, items: ExamQuestion[]) => void;
  addAttempt: (attempt: StudentAttempt) => void;
  addAnswer: (answer: StudentAnswer) => void;
  addAchievement: (achievement: Achievement) => void;
  addStudentAchievement: (item: StudentAchievement) => void;
  resetDemo: () => void;
};

const DemoStoreContext = createContext<DemoStoreContextValue | null>(null);

function loadStore(): DemoStore {
  if (typeof window === "undefined") return demoStore;
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return demoStore;
  try {
    return JSON.parse(raw) as DemoStore;
  } catch {
    return demoStore;
  }
}

function persistStore(store: DemoStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(store));
}

export function DemoStoreProvider({
  children,
  initialCurrentUserId = null,
}: {
  children: ReactNode;
  initialCurrentUserId?: string | null;
}) {
  const [store, setStore] = useState<DemoStore>(demoStore);
  const [currentUserId, setCurrentUserId] = useState<string | null>(initialCurrentUserId);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  useEffect(() => {
    persistStore(store);
  }, [store]);

  const value = useMemo<DemoStoreContextValue>(
    () => ({
      store,
      currentUserId,
      setCurrentUserId,
      upsertProfile: (profile) =>
        setStore((current) => ({
          ...current,
          profiles: current.profiles.some((item) => item.id === profile.id)
            ? current.profiles.map((item) => (item.id === profile.id ? profile : item))
            : [profile, ...current.profiles],
        })),
      toggleProfileActive: (id) =>
        setStore((current) => ({
          ...current,
          profiles: current.profiles.map((item) =>
            item.id === id ? { ...item, active: !item.active } : item,
          ),
        })),
      upsertClass: (item) =>
        setStore((current) => ({
          ...current,
          classes: current.classes.some((entry) => entry.id === item.id)
            ? current.classes.map((entry) => (entry.id === item.id ? item : entry))
            : [item, ...current.classes],
        })),
      toggleClassActive: (id) =>
        setStore((current) => ({
          ...current,
          classes: current.classes.map((entry) =>
            entry.id === id ? { ...entry, active: !entry.active } : entry,
          ),
        })),
      upsertQuestion: (item) =>
        setStore((current) => ({
          ...current,
          questions: current.questions.some((entry) => entry.id === item.id)
            ? current.questions.map((entry) => (entry.id === item.id ? item : entry))
            : [item, ...current.questions],
        })),
      toggleQuestionActive: (id) =>
        setStore((current) => ({
          ...current,
          questions: current.questions.map((entry) =>
            entry.id === id ? { ...entry, active: !entry.active } : entry,
          ),
        })),
      upsertExam: (item) =>
        setStore((current) => ({
          ...current,
          exams: current.exams.some((entry) => entry.id === item.id)
            ? current.exams.map((entry) => (entry.id === item.id ? item : entry))
            : [item, ...current.exams],
        })),
      toggleExamActive: (id) =>
        setStore((current) => ({
          ...current,
          exams: current.exams.map((entry) =>
            entry.id === id ? { ...entry, active: !entry.active } : entry,
          ),
        })),
      upsertExamQuestions: (examId, items) =>
        setStore((current) => ({
          ...current,
          examQuestions: [...current.examQuestions.filter((entry) => entry.exam_id !== examId), ...items],
        })),
      addAttempt: (attempt) =>
        setStore((current) => ({
          ...current,
          attempts: current.attempts.some((entry) => entry.id === attempt.id)
            ? current.attempts.map((entry) => (entry.id === attempt.id ? attempt : entry))
            : [attempt, ...current.attempts],
        })),
      addAnswer: (answer) =>
        setStore((current) => ({
          ...current,
          answers: current.answers.some((entry) => entry.id === answer.id)
            ? current.answers.map((entry) => (entry.id === answer.id ? answer : entry))
            : [answer, ...current.answers],
        })),
      addAchievement: (achievement) =>
        setStore((current) => ({
          ...current,
          achievements: current.achievements.some((entry) => entry.id === achievement.id)
            ? current.achievements.map((entry) => (entry.id === achievement.id ? achievement : entry))
            : [achievement, ...current.achievements],
        })),
      addStudentAchievement: (item) =>
        setStore((current) => ({
          ...current,
          studentAchievements: current.studentAchievements.some((entry) => entry.id === item.id)
            ? current.studentAchievements.map((entry) => (entry.id === item.id ? item : entry))
            : [item, ...current.studentAchievements],
        })),
      resetDemo: () => setStore(demoStore),
    }),
    [currentUserId, store],
  );

  return <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>;
}

export function useDemoStore() {
  const context = useContext(DemoStoreContext);
  if (!context) throw new Error("useDemoStore must be used within DemoStoreProvider");
  return context;
}
