"use server";

import { getCurrentUser } from "@/lib/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isInstitutionalEmail } from "@/lib/utils";

const allowedImageTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const maxImageSize = 5 * 1024 * 1024;

type ActionResult = {
  error?: string;
  success?: string;
  id?: string;
};

async function requireAdminContext() {
  const session = await getCurrentUser();
  if (!session || session.role !== "admin") {
    return { error: "Acesso restrito ao administrador." } as const;
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { error: "Configuração do Supabase ausente." } as const;
  }

  return { session, supabase } as const;
}

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function asBoolean(value: FormDataEntryValue | null, fallback = false) {
  if (typeof value !== "string") return fallback;
  return value === "true" || value === "1" || value === "on";
}

function parseNumber(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(asString(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function ensureQuestionImagesBucket() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data: bucket } = await supabase.storage.getBucket("question-images");
  if (!bucket) {
    await supabase.storage.createBucket("question-images", { public: true });
  }

  return supabase;
}

export async function saveQuestionAction(formData: FormData): Promise<ActionResult> {
  const context = await requireAdminContext();
  if ("error" in context) return { error: context.error };

  const { supabase } = context;
  const id = asString(formData.get("id")) || crypto.randomUUID();
  const statement = asString(formData.get("statement"));
  const optionA = asString(formData.get("option_a"));
  const optionB = asString(formData.get("option_b"));
  const optionC = asString(formData.get("option_c"));
  const optionD = asString(formData.get("option_d"));
  const optionE = asString(formData.get("option_e"));
  const correctOption = asString(formData.get("correct_option"));
  const explanation = asString(formData.get("explanation"));
  const examYear = parseNumber(formData.get("exam_year"), 2024) || null;
  const knowledgeArea = asString(formData.get("knowledge_area"));
  const subject = asString(formData.get("subject"));
  const topic = asString(formData.get("topic"));
  const difficulty = asString(formData.get("difficulty"));
  const active = asBoolean(formData.get("active"), true);
  const imageAlt = asString(formData.get("image_alt"));
  const removeImage = asBoolean(formData.get("remove_image"), false);
  const existingImageUrl = asString(formData.get("existing_image_url")) || null;
  const existingImageAlt = asString(formData.get("existing_image_alt")) || null;
  const imageEntry = formData.get("image");

  if (
    !statement ||
    !optionA ||
    !optionB ||
    !optionC ||
    !optionD ||
    !optionE ||
    !correctOption ||
    !explanation ||
    !knowledgeArea ||
    !subject ||
    !topic ||
    !difficulty
  ) {
    return { error: "Preencha todos os campos obrigatórios da questão." };
  }

  let imageUrl: string | null = removeImage ? null : existingImageUrl;
  let finalImageAlt: string | null = removeImage ? null : imageAlt || existingImageAlt || null;

  if (imageEntry instanceof File && imageEntry.size > 0) {
    if (!allowedImageTypes.has(imageEntry.type)) {
      return { error: "Use uma imagem JPG, PNG ou WEBP." };
    }
    if (imageEntry.size > maxImageSize) {
      return { error: "A imagem deve ter no máximo 5MB." };
    }

    const storage = await ensureQuestionImagesBucket();
    if (!storage) return { error: "Storage de imagens indisponível." };

    const ext = imageEntry.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await storage.storage.from("question-images").upload(path, imageEntry, {
      upsert: true,
      contentType: imageEntry.type,
    });

    if (uploadError) {
      return { error: uploadError.message || "Não foi possível enviar a imagem." };
    }

    const { data } = storage.storage.from("question-images").getPublicUrl(path);
    imageUrl = data.publicUrl;
    finalImageAlt = imageAlt || statement;
  }

  const { error } = await supabase.from("questions").upsert({
    id,
    statement,
    image_url: imageUrl,
    image_alt: finalImageAlt,
    option_a: optionA,
    option_b: optionB,
    option_c: optionC,
    option_d: optionD,
    option_e: optionE,
    correct_option: correctOption,
    explanation,
    exam_year: examYear,
    knowledge_area: knowledgeArea,
    subject,
    topic,
    difficulty,
    active,
  });

  if (error) return { error: error.message };

  return { id, success: "Questão salva com sucesso." };
}

export async function saveExamAction(formData: FormData): Promise<ActionResult> {
  const context = await requireAdminContext();
  if ("error" in context) return { error: context.error };

  const { supabase } = context;
  const id = asString(formData.get("id")) || crypto.randomUUID();
  const title = asString(formData.get("title"));
  const description = asString(formData.get("description")) || null;
  const knowledgeArea = asString(formData.get("knowledge_area")) || null;
  const examYear = parseNumber(formData.get("exam_year"), 2025) || null;
  const timeLimitMinutes = parseNumber(formData.get("time_limit_minutes"), 60);
  const active = asBoolean(formData.get("active"), false);
  const selectedQuestionIds = Array.from(
    new Set(
      formData
        .getAll("question_ids")
        .map((item) => (typeof item === "string" ? item : ""))
        .filter(Boolean),
    ),
  );

  if (!title) {
    return { error: "Informe o título do simulado." };
  }

  const { error } = await supabase.from("exams").upsert({
    id,
    title,
    description,
    knowledge_area: knowledgeArea,
    exam_year: examYear,
    time_limit_minutes: timeLimitMinutes,
    active,
  });

  if (error) return { error: error.message };

  const { error: deleteError } = await supabase.from("exam_questions").delete().eq("exam_id", id);
  if (deleteError) return { error: deleteError.message };

  if (selectedQuestionIds.length) {
    const rows = selectedQuestionIds.map((questionId, index) => ({
      exam_id: id,
      question_id: questionId,
      position: index + 1,
    }));

    const { error: insertError } = await supabase.from("exam_questions").insert(rows);
    if (insertError) return { error: insertError.message };
  }

  return { id, success: "Simulado salvo com sucesso." };
}

export async function saveStudentAction(formData: FormData): Promise<ActionResult> {
  const context = await requireAdminContext();
  if ("error" in context) return { error: context.error };

  const { supabase } = context;
  const id = asString(formData.get("id"));
  const fullName = asString(formData.get("full_name"));
  const email = asString(formData.get("email")).toLowerCase();
  const classId = asString(formData.get("class_id")) || null;
  const role = asString(formData.get("role")) === "admin" ? "admin" : "student";
  const active = asBoolean(formData.get("active"), true);
  const password = asString(formData.get("password"));

  console.info("[Base ENEM] saveStudentAction", {
    mode: id ? "update" : "create",
    email,
    role,
    hasClass: Boolean(classId),
    active,
  });

  if (!fullName || !email) {
    return { error: "Informe nome e e-mail do usuário." };
  }

  if (!email.endsWith("@santamarcelina.edu.br") || !isInstitutionalEmail(email)) {
    return { error: "Use um e-mail institucional @santamarcelina.edu.br." };
  }

  if (!classId) {
    return { error: "Selecione uma turma para o aluno." };
  }

  if (!id && password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }

  if (id && password && password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }

  if (id) {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        email,
        class_id: classId,
        role,
        active,
      })
      .eq("id", id);

    if (error) {
      console.error("[Base ENEM] profile update failed", {
        userId: id,
        email,
        message: error.message,
      });
      return { error: error.message };
    }

    const authUpdatePayload: {
      password?: string;
      email?: string;
      user_metadata?: { full_name: string; role: "student" | "admin" };
    } = {
      email,
      user_metadata: {
        full_name: fullName,
        role,
      },
    };

    if (password) {
      authUpdatePayload.password = password;
    }

    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(id, authUpdatePayload);
    if (authUpdateError) {
      console.error("[Base ENEM] auth update failed", {
        userId: id,
        email,
        message: authUpdateError.message,
      });
      return { error: authUpdateError.message };
    }

    return { id, success: "Aluno atualizado com sucesso." };
  }

  const { data, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role,
    },
  });

  if (authError || !data.user) {
    console.error("[Base ENEM] auth create failed", {
      email,
      message: authError?.message ?? "missing_user",
    });
    return {
      error:
        authError?.message === "User already registered"
          ? "Este e-mail já está cadastrado."
          : authError?.message || "Não foi possível criar o usuário no Auth.",
    };
  }

  const userId = data.user.id;
  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    email,
    full_name: fullName,
    role,
    class_id: classId,
    active,
  });

  if (profileError) {
    console.error("[Base ENEM] profile insert failed after auth create", {
      userId,
      email,
      message: profileError.message,
    });
    await supabase.auth.admin.deleteUser(userId);
    return { error: "Não foi possível criar o perfil do aluno. O usuário Auth foi revertido." };
  }

  return { id: userId, success: "Aluno cadastrado com sucesso." };
}
