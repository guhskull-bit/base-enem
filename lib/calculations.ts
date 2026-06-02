import type {
  Achievement,
  Profile,
  Question,
  StudentAnswer,
  StudentAttempt,
} from "@/lib/types";

export function calculateScore(correctAnswers: number, totalQuestions: number) {
  if (!totalQuestions) return 0;
  return (correctAnswers / totalQuestions) * 100;
}

export function calculateAreaPerformance(answers: StudentAnswer[], questions: Question[]) {
  const grouped = new Map<string, { correct: number; total: number }>();

  for (const answer of answers) {
    const question = questions.find((item) => item.id === answer.question_id);
    if (!question) continue;

    const current = grouped.get(question.knowledge_area) ?? { correct: 0, total: 0 };
    current.total += 1;
    current.correct += answer.is_correct ? 1 : 0;
    grouped.set(question.knowledge_area, current);
  }

  return Array.from(grouped.entries()).map(([area, metrics]) => ({
    area,
    total: metrics.total,
    correct: metrics.correct,
    percent: metrics.total ? (metrics.correct / metrics.total) * 100 : 0,
  }));
}

export function calculateSubjectPerformance(answers: StudentAnswer[], questions: Question[]) {
  const grouped = new Map<string, { correct: number; total: number; area: string }>();

  for (const answer of answers) {
    const question = questions.find((item) => item.id === answer.question_id);
    if (!question) continue;

    const current = grouped.get(question.subject) ?? {
      correct: 0,
      total: 0,
      area: question.knowledge_area,
    };
    current.total += 1;
    current.correct += answer.is_correct ? 1 : 0;
    grouped.set(question.subject, current);
  }

  return Array.from(grouped.entries())
    .map(([subject, metrics]) => ({
      subject,
      area: metrics.area,
      total: metrics.total,
      correct: metrics.correct,
      percent: metrics.total ? (metrics.correct / metrics.total) * 100 : 0,
    }))
    .sort((a, b) => a.percent - b.percent);
}

export function calculateTopicDifficulties(answers: StudentAnswer[], questions: Question[]) {
  const grouped = new Map<string, { correct: number; total: number; subject: string; area: string }>();

  for (const answer of answers) {
    const question = questions.find((item) => item.id === answer.question_id);
    if (!question) continue;

    const current = grouped.get(question.topic) ?? {
      correct: 0,
      total: 0,
      subject: question.subject,
      area: question.knowledge_area,
    };
    current.total += 1;
    current.correct += answer.is_correct ? 1 : 0;
    grouped.set(question.topic, current);
  }

  return Array.from(grouped.entries())
    .map(([topic, metrics]) => ({
      topic,
      subject: metrics.subject,
      area: metrics.area,
      total: metrics.total,
      correct: metrics.correct,
      percent: metrics.total ? (metrics.correct / metrics.total) * 100 : 0,
    }))
    .sort((a, b) => a.percent - b.percent);
}

export function calculateRanking(
  profiles: Profile[],
  attempts: StudentAttempt[],
  classId?: string | null,
) {
  return profiles
    .filter((profile) => profile.role === "student" && profile.active)
    .filter((profile) => (classId ? profile.class_id === classId : true))
    .map((profile) => {
      const studentAttempts = attempts.filter((attempt) => attempt.student_id === profile.id);
      const totalQuestions = studentAttempts.reduce((sum, item) => sum + item.total_questions, 0);
      const correct = studentAttempts.reduce((sum, item) => sum + item.correct_answers, 0);
      const percent = calculateScore(correct, totalQuestions);
      return {
        profile,
        attempts: studentAttempts.length,
        totalQuestions,
        correct,
        percent,
      };
    })
    .sort((a, b) => b.percent - a.percent || b.totalQuestions - a.totalQuestions);
}

export function calculateAttemptTime(attempt: StudentAttempt) {
  return attempt.total_questions ? attempt.total_time_seconds / attempt.total_questions : 0;
}

export function buildAchievements(
  profileId: string,
  attempts: StudentAttempt[],
  answers: StudentAnswer[],
  questions: Question[],
  achievements: Achievement[],
) {
  const studentAttempts = attempts.filter((attempt) => attempt.student_id === profileId);
  const studentAnswers = answers.filter((answer) => answer.student_id === profileId);
  const correct = studentAttempts.reduce((sum, item) => sum + item.correct_answers, 0);
  const totalQuestions = studentAttempts.reduce((sum, item) => sum + item.total_questions, 0);
  const scorePercent = calculateScore(correct, totalQuestions);
  const questionCount = studentAnswers.length;
  const streakDays = calculateCurrentStreakDays(studentAnswers);
  const areaSummary = calculateAreaPerformance(studentAnswers, questions);
  const mathPercent = areaSummary.find((item) => item.area === "Matemática")?.percent ?? 0;
  const naturePercent = areaSummary.find((item) => item.area === "Ciências da Natureza")?.percent ?? 0;

  const unlocked = new Set<string>();

  for (const achievement of achievements) {
    if (!achievement.active) continue;

    if (achievement.trigger_type === "questions_answered" && achievement.trigger_value) {
      if (questionCount >= achievement.trigger_value) unlocked.add(achievement.id);
    }
    if (achievement.trigger_type === "attempts_finished" && achievement.trigger_value) {
      if (studentAttempts.length >= achievement.trigger_value) unlocked.add(achievement.id);
    }
    if (achievement.trigger_type === "score_percent" && achievement.trigger_value) {
      if (scorePercent >= achievement.trigger_value) unlocked.add(achievement.id);
    }
    if (achievement.trigger_type === "streak_days" && achievement.trigger_value) {
      if (streakDays >= achievement.trigger_value) unlocked.add(achievement.id);
    }
    if (achievement.trigger_type === "math_progress" && achievement.trigger_value) {
      if (mathPercent >= achievement.trigger_value) unlocked.add(achievement.id);
    }
    if (achievement.trigger_type === "nature_progress" && achievement.trigger_value) {
      if (naturePercent >= achievement.trigger_value) unlocked.add(achievement.id);
    }
  }

  return achievements.filter((achievement) => unlocked.has(achievement.id));
}

export function statusFromScore(scorePercent: number) {
  if (scorePercent >= 70) return "Em dia";
  if (scorePercent >= 50) return "Desenvolvimento";
  return "Atenção";
}

export function areaStatus(scorePercent: number) {
  return scorePercent >= 60 ? "Em dia" : "Atenção";
}

export function getStudentAttention(areas: Array<{ area: string; percent: number }>) {
  return areas.filter((entry) => entry.percent < 60).map((entry) => entry.area);
}

function calculateCurrentStreakDays(answers: StudentAnswer[]) {
  const dates = Array.from(
    new Set(answers.map((answer) => new Date(answer.answered_at).toISOString().slice(0, 10))),
  ).sort((a, b) => b.localeCompare(a));

  if (!dates.length) return 0;

  let streak = 1;
  for (let index = 1; index < dates.length; index += 1) {
    const previous = new Date(dates[index - 1]);
    const current = new Date(dates[index]);
    const difference = previous.getTime() - current.getTime();
    if (difference === 24 * 60 * 60 * 1000) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}
