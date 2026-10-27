import {
  type QuizChoice,
  type ScoredQuizAnswer,
  db,
  quizAttemptsTable,
  quizQuestionsTable,
  quizzesTable,
} from "@workspace/db";
import {
  GetAttemptParams,
  GetAttemptResponse,
  GetDashboardSummaryResponse,
  GetLeaderboardQueryParams,
  GetLeaderboardResponse,
  GetMyAttemptsResponse,
  GetQuizParams,
  GetQuizQuestionsParams,
  GetQuizQuestionsResponse,
  GetQuizResponse,
  ListQuizzesResponse,
  SubmitAttemptBody,
  SubmitAttemptResponse,
} from "@workspace/api-zod";
import { getAuth } from "@clerk/express";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { Router, type IRouter, type RequestHandler } from "express";

const router: IRouter = Router();

const requireSignedIn: RequestHandler = (req, res, next) => {
  if (!getAuth(req).userId) {
    res.status(401).json({ error: "Sign in to access this quiz" });
    return;
  }
  next();
};

async function quizWithQuestionCount(quizId: number) {
  const [quiz] = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.id, quizId))
    .limit(1);
  if (!quiz) return undefined;

  const [counts] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.quizId, quizId));

  return { ...quiz, questionCount: counts?.count ?? 0 };
}

router.get("/quizzes", async (_req, res): Promise<void> => {
  const quizzes = await db
    .select()
    .from(quizzesTable)
    .orderBy(desc(quizzesTable.featured), asc(quizzesTable.id));
  const counts = await db
    .select({
      quizId: quizQuestionsTable.quizId,
      count: sql<number>`count(*)::int`,
    })
    .from(quizQuestionsTable)
    .groupBy(quizQuestionsTable.quizId);
  const countByQuizId = new Map(counts.map((row) => [row.quizId, row.count]));

  res.json(
    ListQuizzesResponse.parse(
      quizzes.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        category: quiz.category,
        description: quiz.description,
        difficulty: quiz.difficulty,
        questionCount: countByQuizId.get(quiz.id) ?? 0,
        estimatedMinutes: quiz.estimatedMinutes,
        featured: quiz.featured,
      })),
    ),
  );
});

router.get("/quizzes/:quizId", async (req, res): Promise<void> => {
  const params = GetQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const quiz = await quizWithQuestionCount(params.data.quizId);
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  res.json(
    GetQuizResponse.parse({
      id: quiz.id,
      title: quiz.title,
      category: quiz.category,
      description: quiz.description,
      difficulty: quiz.difficulty,
      questionCount: quiz.questionCount,
      estimatedMinutes: quiz.estimatedMinutes,
      featured: quiz.featured,
    }),
  );
});

router.get("/quizzes/:quizId/questions", requireSignedIn, async (req, res): Promise<void> => {
  const params = GetQuizQuestionsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const quiz = await db
    .select({ id: quizzesTable.id })
    .from(quizzesTable)
    .where(eq(quizzesTable.id, params.data.quizId))
    .limit(1);
  if (!quiz[0]) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  const questions = await db
    .select({
      id: quizQuestionsTable.id,
      position: quizQuestionsTable.position,
      prompt: quizQuestionsTable.prompt,
      choices: quizQuestionsTable.choices,
    })
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.quizId, params.data.quizId))
    .orderBy(asc(quizQuestionsTable.position));

  res.json(GetQuizQuestionsResponse.parse(questions));
});

router.post("/attempts", async (req, res): Promise<void> => {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Sign in before submitting a score" });
    return;
  }

  const parsed = SubmitAttemptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { quizId, durationSeconds, answers } = parsed.data;
  const displayName = parsed.data.displayName.trim().slice(0, 24) || "Guest";
  const questions = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.quizId, quizId))
    .orderBy(asc(quizQuestionsTable.position));

  if (questions.length === 0) {
    const [quiz] = await db
      .select({ id: quizzesTable.id })
      .from(quizzesTable)
      .where(eq(quizzesTable.id, quizId))
      .limit(1);
    res.status(quiz ? 400 : 404).json({
      error: quiz ? "This quiz does not have any questions yet" : "Quiz not found",
    });
    return;
  }

  const questionById = new Map(questions.map((question) => [question.id, question]));
  const submittedIds = new Set<number>();
  const scoredAnswers: ScoredQuizAnswer[] = [];

  for (const answer of answers) {
    const question = questionById.get(answer.questionId);
    const choices = question?.choices as QuizChoice[] | undefined;
    if (
      !question ||
      submittedIds.has(question.id) ||
      !choices?.some((choice) => choice.id === answer.selectedChoiceId)
    ) {
      res.status(400).json({ error: "One or more submitted answers are invalid" });
      return;
    }
    submittedIds.add(question.id);
    scoredAnswers.push({
      questionId: question.id,
      selectedChoiceId: answer.selectedChoiceId,
      correctChoiceId: question.correctChoiceId,
      isCorrect: answer.selectedChoiceId === question.correctChoiceId,
      explanation: question.explanation,
    });
  }

  if (submittedIds.size !== questions.length) {
    res.status(400).json({ error: "Answer every question before submitting" });
    return;
  }

  const correctAnswers = scoredAnswers.filter((answer) => answer.isCorrect).length;
  const [quiz] = await db
    .select({ title: quizzesTable.title })
    .from(quizzesTable)
    .where(eq(quizzesTable.id, quizId))
    .limit(1);
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  const [attempt] = await db
    .insert(quizAttemptsTable)
    .values({
      quizId,
      clerkUserId: userId,
      displayName,
      correctAnswers,
      totalQuestions: questions.length,
      percentCorrect: Math.round((correctAnswers / questions.length) * 100),
      durationSeconds,
      answers: scoredAnswers,
    })
    .returning();

  res.status(201).json(
    SubmitAttemptResponse.parse({
      id: attempt.id,
      quizId,
      quizTitle: quiz.title,
      displayName,
      correctAnswers,
      totalQuestions: questions.length,
      percentCorrect: attempt.percentCorrect,
      durationSeconds,
      completedAt: attempt.completedAt,
      answers: scoredAnswers,
    }),
  );
});

router.get("/attempts/mine", requireSignedIn, async (req, res): Promise<void> => {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Sign in to view saved scores" });
    return;
  }

  const attempts = await db
    .select({
      attemptId: quizAttemptsTable.id,
      quizId: quizAttemptsTable.quizId,
      quizTitle: quizzesTable.title,
      correctAnswers: quizAttemptsTable.correctAnswers,
      totalQuestions: quizAttemptsTable.totalQuestions,
      percentCorrect: quizAttemptsTable.percentCorrect,
      durationSeconds: quizAttemptsTable.durationSeconds,
      completedAt: quizAttemptsTable.completedAt,
    })
    .from(quizAttemptsTable)
    .innerJoin(quizzesTable, eq(quizAttemptsTable.quizId, quizzesTable.id))
    .where(eq(quizAttemptsTable.clerkUserId, userId))
    .orderBy(desc(quizAttemptsTable.completedAt), desc(quizAttemptsTable.id));

  res.json(GetMyAttemptsResponse.parse(attempts));
});

router.get("/attempts/:attemptId", requireSignedIn, async (req, res): Promise<void> => {
  const params = GetAttemptParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Sign in to view quiz results" });
    return;
  }

  const [attempt] = await db
    .select({
      id: quizAttemptsTable.id,
      quizId: quizAttemptsTable.quizId,
      quizTitle: quizzesTable.title,
      displayName: quizAttemptsTable.displayName,
      correctAnswers: quizAttemptsTable.correctAnswers,
      totalQuestions: quizAttemptsTable.totalQuestions,
      percentCorrect: quizAttemptsTable.percentCorrect,
      durationSeconds: quizAttemptsTable.durationSeconds,
      completedAt: quizAttemptsTable.completedAt,
      answers: quizAttemptsTable.answers,
    })
    .from(quizAttemptsTable)
    .innerJoin(quizzesTable, eq(quizAttemptsTable.quizId, quizzesTable.id))
    .where(
      and(
        eq(quizAttemptsTable.id, params.data.attemptId),
        eq(quizAttemptsTable.clerkUserId, userId),
      ),
    )
    .limit(1);

  if (!attempt) {
    res.status(404).json({ error: "Attempt not found" });
    return;
  }

  res.json(GetAttemptResponse.parse(attempt));
});

router.get("/leaderboard", async (req, res): Promise<void> => {
  const params = GetLeaderboardQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const query = db
    .select({
      attemptId: quizAttemptsTable.id,
      displayName: quizAttemptsTable.displayName,
      quizTitle: quizzesTable.title,
      correctAnswers: quizAttemptsTable.correctAnswers,
      totalQuestions: quizAttemptsTable.totalQuestions,
      percentCorrect: quizAttemptsTable.percentCorrect,
      durationSeconds: quizAttemptsTable.durationSeconds,
      completedAt: quizAttemptsTable.completedAt,
    })
    .from(quizAttemptsTable)
    .innerJoin(quizzesTable, eq(quizAttemptsTable.quizId, quizzesTable.id));

  const rows = params.data.quizId
    ? await query
        .where(eq(quizAttemptsTable.quizId, params.data.quizId))
        .orderBy(
          desc(quizAttemptsTable.percentCorrect),
          desc(quizAttemptsTable.correctAnswers),
          asc(quizAttemptsTable.durationSeconds),
          desc(quizAttemptsTable.completedAt),
        )
        .limit(20)
    : await query
        .orderBy(
          desc(quizAttemptsTable.percentCorrect),
          desc(quizAttemptsTable.correctAnswers),
          asc(quizAttemptsTable.durationSeconds),
          desc(quizAttemptsTable.completedAt),
        )
        .limit(20);

  res.json(
    GetLeaderboardResponse.parse(
      rows.map((row, index) => ({
        rank: index + 1,
        ...row,
      })),
    ),
  );
});

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [quizzes, questionTotals, attemptTotals] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(quizzesTable),
    db.select({ count: sql<number>`count(*)::int` }).from(quizQuestionsTable),
    db
      .select({
        gamesPlayed: sql<number>`count(*)::int`,
        averageScore: sql<number>`coalesce(round(avg(${quizAttemptsTable.percentCorrect})), 0)::int`,
        topScore: sql<number>`coalesce(max(${quizAttemptsTable.percentCorrect}), 0)::int`,
      })
      .from(quizAttemptsTable),
  ]);

  res.json(
    GetDashboardSummaryResponse.parse({
      quizzesAvailable: quizzes[0]?.count ?? 0,
      totalQuestions: questionTotals[0]?.count ?? 0,
      gamesPlayed: attemptTotals[0]?.gamesPlayed ?? 0,
      averageScore: attemptTotals[0]?.averageScore ?? 0,
      topScore: attemptTotals[0]?.topScore ?? 0,
    }),
  );
});

export default router;
