import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const now = new Date().toISOString();

const classSeed = [
  { id: crypto.randomUUID(), name: "2A EM", year: "2026", active: true, created_at: now },
  { id: crypto.randomUUID(), name: "2B EM", year: "2026", active: true, created_at: now },
  { id: crypto.randomUUID(), name: "3A EM", year: "2026", active: true, created_at: now },
];

const achievementSeed = [
  ["Primeira questão respondida", "Marcou presença na Base ENEM.", "sparkles", "questions_answered", 1],
  ["10 questões respondidas", "Começou a ganhar ritmo.", "target", "questions_answered", 10],
  ["50 questões respondidas", "Volume consistente de treino.", "target", "questions_answered", 50],
  ["100 questões respondidas", "Forte rotina de estudos.", "target", "questions_answered", 100],
  ["7 dias seguidos estudando", "Consistência acima da média.", "flame", "streak_days", 7],
  ["70% de acerto geral", "Bom caminho para a aprovação.", "award", "score_percent", 70],
  ["80% de acerto geral", "Desempenho muito forte.", "award", "score_percent", 80],
  ["Primeiro simulado concluído", "Primeiro passo do ciclo de estudos.", "check-circle-2", "attempts_finished", 1],
  ["Melhorando em Matemática", "Sua base em Matemática está ficando mais forte.", "trending-up", "math_progress", 60],
  ["Melhorando em Natureza", "Sua base em Natureza está crescendo.", "trending-up", "nature_progress", 60],
];

function buildQuestions() {
  const base = [
    {
      statement: "Em uma leitura de gráfico, a variação percentual de uma grandeza é dada por...",
      option_a: "diferença entre o maior e o menor valor",
      option_b: "razão entre variação e valor inicial",
      option_c: "soma dos valores observados",
      option_d: "produto entre a média e o desvio",
      option_e: "mediana da distribuição",
      correct_option: "B",
      explanation: "A variação percentual relaciona a diferença ao valor inicial.",
      exam_year: 2024,
      knowledge_area: "Matemática",
      subject: "Matemática",
      topic: "Porcentagem",
      difficulty: "media",
    },
    {
      statement: "A função da linguagem predominante em um texto publicitário é...",
      option_a: "emotiva",
      option_b: "referencial",
      option_c: "poética",
      option_d: "conativa",
      option_e: "metalinguística",
      correct_option: "D",
      explanation: "Textos publicitários buscam persuadir o leitor.",
      exam_year: 2023,
      knowledge_area: "Linguagens",
      subject: "Português",
      topic: "Funções da linguagem",
      difficulty: "facil",
    },
    {
      statement: "A Revolução Industrial alterou principalmente a relação entre...",
      option_a: "campo e cidade",
      option_b: "alfabetização e imprensa",
      option_c: "religião e ciência",
      option_d: "nobreza e clero",
      option_e: "língua e gramática",
      correct_option: "A",
      explanation: "A industrialização intensificou a urbanização e o êxodo rural.",
      exam_year: 2022,
      knowledge_area: "Ciências Humanas",
      subject: "História",
      topic: "Revolução Industrial",
      difficulty: "media",
    },
    {
      statement: "A base da cadeia alimentar é formada, em geral, por...",
      option_a: "consumidores terciários",
      option_b: "decompositores",
      option_c: "produtores",
      option_d: "predadores de topo",
      option_e: "parasitas",
      correct_option: "C",
      explanation: "Os produtores transformam energia para sustentar a cadeia.",
      exam_year: 2024,
      knowledge_area: "Ciências da Natureza",
      subject: "Biologia",
      topic: "Ecologia",
      difficulty: "facil",
    },
    {
      statement: "O gráfico de posição versus tempo com inclinação positiva constante representa...",
      option_a: "repouso",
      option_b: "movimento uniforme",
      option_c: "aceleração negativa",
      option_d: "movimento circular",
      option_e: "variação instantânea nula",
      correct_option: "B",
      explanation: "Inclinação constante em s x t indica velocidade constante.",
      exam_year: 2021,
      knowledge_area: "Ciências da Natureza",
      subject: "Física",
      topic: "Cinemática",
      difficulty: "media",
    },
  ];

  const extras = [];
  for (let i = 6; i <= 20; i += 1) {
    extras.push({
      statement: `Questão fictícia ENEM ${i}: interpretação, análise e raciocínio contextual.`,
      option_a: `Alternativa A ${i}`,
      option_b: `Alternativa B ${i}`,
      option_c: `Alternativa C ${i}`,
      option_d: `Alternativa D ${i}`,
      option_e: `Alternativa E ${i}`,
      correct_option: ["A", "B", "C", "D", "E"][i % 5],
      explanation: "Resposta comentada de forma resumida para o estudante revisar o conteúdo.",
      exam_year: 2020 + (i % 5),
      knowledge_area: ["Linguagens", "Ciências Humanas", "Ciências da Natureza", "Matemática"][i % 4],
      subject: ["Português", "História", "Biologia", "Matemática"][i % 4],
      topic: ["Leitura", "Urbanização", "Ecologia", "Funções"][i % 4],
      difficulty: ["facil", "media", "dificil"][i % 3],
    });
  }

  return [...base, ...extras].map((question) => ({
    id: crypto.randomUUID(),
    active: true,
    created_at: now,
    ...question,
  }));
}

async function ensureAuthUser(email, password, full_name, role, class_id) {
  const { data: usersData } = await supabase.auth.admin.listUsers();
  const existing = usersData.users.find((user) => user.email === email);
  let userId = existing?.id;

  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user.id;
  }

  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    email,
    full_name,
    role,
    class_id,
    active: true,
    created_at: now,
  });
  if (error) throw error;
  return userId;
}

async function main() {
  await supabase.from("classes").upsert(classSeed);
  const adminId = await ensureAuthUser(
    "admin@santamarcelina.edu.br",
    "Admin123!",
    "Coordenação Base ENEM",
    "admin",
    null,
  );
  const student1 = await ensureAuthUser(
    "ana.beatriz@santamarcelina.edu.br",
    "Aluno123!",
    "Ana Beatriz",
    "student",
    classSeed[0].id,
  );
  const student2 = await ensureAuthUser(
    "marina.lima@santamarcelina.edu.br",
    "Aluno123!",
    "Marina Lima",
    "student",
    classSeed[0].id,
  );
  const student3 = await ensureAuthUser(
    "carlos.silva@santamarcelina.edu.br",
    "Aluno123!",
    "Carlos Silva",
    "student",
    classSeed[1].id,
  );
  const student4 = await ensureAuthUser(
    "pedro.costa@santamarcelina.edu.br",
    "Aluno123!",
    "Pedro Costa",
    "student",
    classSeed[1].id,
  );
  const student5 = await ensureAuthUser(
    "joana.ribeiro@santamarcelina.edu.br",
    "Aluno123!",
    "Joana Ribeiro",
    "student",
    classSeed[2].id,
  );

  const achievements = achievementSeed.map(([name, description, icon, trigger_type, trigger_value]) => ({
    id: crypto.randomUUID(),
    name,
    description,
    icon,
    trigger_type,
    trigger_value,
    active: true,
  }));
  await supabase.from("achievements").upsert(achievements);

  const questions = buildQuestions();
  const { data: insertedQuestions, error: questionError } = await supabase
    .from("questions")
    .insert(questions)
    .select("*");
  if (questionError) throw questionError;

  const exams = [
    {
      id: crypto.randomUUID(),
      title: "Simulado Base ENEM - Diagnóstico 1",
      description: "Avaliação inicial com foco em leitura, interpretação e resolução básica.",
      knowledge_area: null,
      exam_year: 2024,
      time_limit_minutes: 60,
      active: true,
      created_at: now,
    },
    {
      id: crypto.randomUUID(),
      title: "Simulado Base ENEM - Revisão 2",
      description: "Simulado misto com foco em recuperação de dificuldades.",
      knowledge_area: null,
      exam_year: 2025,
      time_limit_minutes: 50,
      active: true,
      created_at: now,
    },
  ];
  await supabase.from("exams").upsert(exams);

  const examQuestions = [
    ...insertedQuestions.slice(0, 10).map((question, index) => ({
      exam_id: exams[0].id,
      question_id: question.id,
      position: index + 1,
    })),
    ...insertedQuestions.slice(5, 15).map((question, index) => ({
      exam_id: exams[1].id,
      question_id: question.id,
      position: index + 1,
    })),
  ];
  await supabase.from("exam_questions").upsert(examQuestions);

  const profilesMap = {
    adminId,
    student1,
    student2,
    student3,
    student4,
    student5,
  };

  const attempts = [
    {
      id: crypto.randomUUID(),
      student_id: profilesMap.student1,
      exam_id: exams[0].id,
      started_at: new Date(Date.now() - 1000 * 60 * 78).toISOString(),
      finished_at: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
      total_questions: 10,
      correct_answers: 7,
      score_percent: 70,
      total_time_seconds: 1800,
    },
    {
      id: crypto.randomUUID(),
      student_id: profilesMap.student2,
      exam_id: exams[0].id,
      started_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      finished_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      total_questions: 10,
      correct_answers: 9,
      score_percent: 90,
      total_time_seconds: 1800,
    },
  ];
  await supabase.from("student_attempts").upsert(attempts);

  const answers = [
    {
      id: crypto.randomUUID(),
      attempt_id: attempts[0].id,
      student_id: profilesMap.student1,
      question_id: insertedQuestions[0].id,
      selected_option: "B",
      is_correct: true,
      time_spent_seconds: 120,
      answered_at: now,
    },
    {
      id: crypto.randomUUID(),
      attempt_id: attempts[0].id,
      student_id: profilesMap.student1,
      question_id: insertedQuestions[1].id,
      selected_option: "A",
      is_correct: false,
      time_spent_seconds: 100,
      answered_at: now,
    },
    {
      id: crypto.randomUUID(),
      attempt_id: attempts[1].id,
      student_id: profilesMap.student2,
      question_id: insertedQuestions[0].id,
      selected_option: "B",
      is_correct: true,
      time_spent_seconds: 90,
      answered_at: now,
    },
  ];
  await supabase.from("student_answers").upsert(answers);

  const studentAchievements = [
    {
      id: crypto.randomUUID(),
      student_id: profilesMap.student1,
      achievement_id: achievements[0].id,
      unlocked_at: now,
    },
    {
      id: crypto.randomUUID(),
      student_id: profilesMap.student1,
      achievement_id: achievements[7].id,
      unlocked_at: now,
    },
  ];
  await supabase.from("student_achievements").upsert(studentAchievements);

  console.log("Seed concluído com sucesso.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
