export type Role = "student" | "admin";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  class_id: string | null;
  active: boolean;
  created_at: string;
};

export type ClassGroup = {
  id: string;
  name: string;
  year: string;
  active: boolean;
  created_at: string;
};

export type Question = {
  id: string;
  statement: string;
  image_url?: string | null;
  image_alt?: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_option: "A" | "B" | "C" | "D" | "E";
  explanation: string;
  exam_year: number | null;
  knowledge_area: string;
  subject: string;
  topic: string;
  difficulty: "facil" | "media" | "dificil";
  active: boolean;
  created_at: string;
};

export type Exam = {
  id: string;
  title: string;
  description: string | null;
  knowledge_area: string | null;
  exam_year: number | null;
  time_limit_minutes: number;
  active: boolean;
  created_at: string;
};

export type ExamQuestion = {
  id: string;
  exam_id: string;
  question_id: string;
  position: number;
};

export type StudentAttempt = {
  id: string;
  student_id: string;
  exam_id: string;
  started_at: string;
  finished_at: string | null;
  total_questions: number;
  correct_answers: number;
  score_percent: number;
  total_time_seconds: number;
};

export type StudentAnswer = {
  id: string;
  attempt_id: string;
  student_id: string;
  question_id: string;
  selected_option: "A" | "B" | "C" | "D" | "E";
  is_correct: boolean;
  time_spent_seconds: number;
  answered_at: string;
};

export type Achievement = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  trigger_type: string;
  trigger_value: number | null;
  active: boolean;
};

export type StudentAchievement = {
  id: string;
  student_id: string;
  achievement_id: string;
  unlocked_at: string;
};

export type SessionUser = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  class_id: string | null;
};

export type DemoStore = {
  profiles: Profile[];
  classes: ClassGroup[];
  questions: Question[];
  exams: Exam[];
  examQuestions: ExamQuestion[];
  attempts: StudentAttempt[];
  answers: StudentAnswer[];
  achievements: Achievement[];
  studentAchievements: StudentAchievement[];
};
