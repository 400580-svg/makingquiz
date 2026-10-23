import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export type QuizDifficulty = "Rookie" | "Pro" | "Hall of Fame";
export type QuizChoice = { id: string; label: string };
export type ScoredQuizAnswer = {
  questionId: number;
  selectedChoiceId: string;
  correctChoiceId: string;
  isCorrect: boolean;
  explanation: string;
};

export const quizzesTable = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  title: varchar("title", { length: 120 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  description: text("description").notNull(),
  difficulty: varchar("difficulty", {
    length: 32,
    enum: ["Rookie", "Pro", "Hall of Fame"],
  }).$type<QuizDifficulty>().notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull().default(3),
  featured: boolean("featured").notNull().default(false),
});

export const quizQuestionsTable = pgTable(
  "quiz_questions",
  {
    id: serial("id").primaryKey(),
    quizId: integer("quiz_id")
      .notNull()
      .references(() => quizzesTable.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    prompt: text("prompt").notNull(),
    choices: jsonb("choices").$type<QuizChoice[]>().notNull(),
    correctChoiceId: varchar("correct_choice_id", { length: 8 }).notNull(),
    explanation: text("explanation").notNull(),
  },
  (table) => [
    uniqueIndex("quiz_questions_quiz_position_unique").on(
      table.quizId,
      table.position,
    ),
  ],
);

export const quizAttemptsTable = pgTable(
  "quiz_attempts",
  {
    id: serial("id").primaryKey(),
    quizId: integer("quiz_id")
      .notNull()
      .references(() => quizzesTable.id, { onDelete: "cascade" }),
    clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull(),
    displayName: varchar("display_name", { length: 24 }).notNull(),
    correctAnswers: integer("correct_answers").notNull(),
    totalQuestions: integer("total_questions").notNull(),
    percentCorrect: integer("percent_correct").notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    answers: jsonb("answers").$type<ScoredQuizAnswer[]>().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index("quiz_attempts_leaderboard_idx").on(
      table.quizId,
      table.percentCorrect,
      table.correctAnswers,
      table.durationSeconds,
    ),
  ],
);

export type Quiz = typeof quizzesTable.$inferSelect;
export type QuizQuestion = typeof quizQuestionsTable.$inferSelect;
export type QuizAttempt = typeof quizAttemptsTable.$inferSelect;
