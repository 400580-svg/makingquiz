import { db } from "@workspace/db";
import { quizQuestionsTable, quizzesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { githubQuizCatalog } from "./github-quiz-catalog";

const catalog = [
  {
    slug: "nfl-foundations",
    title: "NFL Foundations",
    category: "The basics",
    description: "The rules, numbers, and moments every football fan knows.",
    difficulty: "Rookie" as const,
    estimatedMinutes: 3,
    featured: true,
    questions: [
      {
        prompt: "How many players from each team are on the field during a play?",
        choices: [
          { id: "a", label: "9" },
          { id: "b", label: "10" },
          { id: "c", label: "11" },
          { id: "d", label: "12" },
        ],
        correctChoiceId: "c",
        explanation: "Each team fields 11 players at a time.",
      },
      {
        prompt: "How long is the playing field between the goal lines?",
        choices: [
          { id: "a", label: "80 yards" },
          { id: "b", label: "100 yards" },
          { id: "c", label: "110 yards" },
          { id: "d", label: "120 yards" },
        ],
        correctChoiceId: "b",
        explanation: "The field is 100 yards from goal line to goal line, with a 10-yard end zone at each end.",
      },
      {
        prompt: "How long is one quarter in an NFL regular-season game?",
        choices: [
          { id: "a", label: "12 minutes" },
          { id: "b", label: "14 minutes" },
          { id: "c", label: "15 minutes" },
          { id: "d", label: "20 minutes" },
        ],
        correctChoiceId: "c",
        explanation: "An NFL game has four 15-minute quarters.",
      },
      {
        prompt: "How many points is a touchdown worth before any extra-point attempt?",
        choices: [
          { id: "a", label: "3" },
          { id: "b", label: "6" },
          { id: "c", label: "7" },
          { id: "d", label: "8" },
        ],
        correctChoiceId: "b",
        explanation: "A touchdown is worth six points; the try afterward can add more.",
      },
      {
        prompt: "In what year was the league that became the NFL founded?",
        choices: [
          { id: "a", label: "1920" },
          { id: "b", label: "1925" },
          { id: "c", label: "1933" },
          { id: "d", label: "1946" },
        ],
        correctChoiceId: "a",
        explanation: "The American Professional Football Association was founded in 1920 and later became the NFL.",
      },
    ],
  },
  {
    slug: "super-bowl-legends",
    title: "Super Bowl Legends",
    category: "Championship history",
    description: "Champions, dynasties, and unforgettable title-game moments.",
    difficulty: "Pro" as const,
    estimatedMinutes: 3,
    featured: false,
    questions: [
      {
        prompt: "Which team won the first two Super Bowls?",
        choices: [
          { id: "a", label: "Green Bay Packers" },
          { id: "b", label: "Kansas City Chiefs" },
          { id: "c", label: "Dallas Cowboys" },
          { id: "d", label: "Miami Dolphins" },
        ],
        correctChoiceId: "a",
        explanation: "Green Bay won Super Bowl I and Super Bowl II.",
      },
      {
        prompt: "How many Super Bowls did Joe Montana win with the 49ers?",
        choices: [
          { id: "a", label: "Three" },
          { id: "b", label: "Four" },
          { id: "c", label: "Five" },
          { id: "d", label: "Six" },
        ],
        correctChoiceId: "b",
        explanation: "Montana led San Francisco to four Super Bowl titles.",
      },
      {
        prompt: "Which team did the 1985 Chicago Bears defeat in Super Bowl XX?",
        choices: [
          { id: "a", label: "Denver Broncos" },
          { id: "b", label: "Washington Redskins" },
          { id: "c", label: "New England Patriots" },
          { id: "d", label: "San Francisco 49ers" },
        ],
        correctChoiceId: "c",
        explanation: "Chicago beat New England 46–10 in Super Bowl XX.",
      },
      {
        prompt: "Which team completed the largest comeback in Super Bowl history?",
        choices: [
          { id: "a", label: "New York Giants" },
          { id: "b", label: "Philadelphia Eagles" },
          { id: "c", label: "New England Patriots" },
          { id: "d", label: "Kansas City Chiefs" },
        ],
        correctChoiceId: "c",
        explanation: "New England came back from a 28–3 deficit to beat Atlanta in Super Bowl LI.",
      },
      {
        prompt: "Who did the New York Giants beat to end the Patriots' perfect-season bid?",
        choices: [
          { id: "a", label: "Denver Broncos" },
          { id: "b", label: "New England Patriots" },
          { id: "c", label: "Green Bay Packers" },
          { id: "d", label: "Buffalo Bills" },
        ],
        correctChoiceId: "b",
        explanation: "The Giants beat New England in Super Bowl XLII, handing the Patriots their only loss of the 2007 season.",
      },
    ],
  },
  {
    slug: "records-and-milestones",
    title: "Records & Milestones",
    category: "For the stat heads",
    description: "Put your all-time NFL record book knowledge to the test.",
    difficulty: "Hall of Fame" as const,
    estimatedMinutes: 3,
    featured: false,
    questions: [
      {
        prompt: "Who holds the NFL career record for receiving yards?",
        choices: [
          { id: "a", label: "Jerry Rice" },
          { id: "b", label: "Larry Fitzgerald" },
          { id: "c", label: "Randy Moss" },
          { id: "d", label: "Terrell Owens" },
        ],
        correctChoiceId: "a",
        explanation: "Jerry Rice finished his career with 22,895 receiving yards.",
      },
      {
        prompt: "Who is the NFL's all-time leading rusher?",
        choices: [
          { id: "a", label: "Walter Payton" },
          { id: "b", label: "Emmitt Smith" },
          { id: "c", label: "Barry Sanders" },
          { id: "d", label: "Frank Gore" },
        ],
        correctChoiceId: "b",
        explanation: "Emmitt Smith holds the career rushing record with 18,355 yards.",
      },
      {
        prompt: "Which quarterback threw 55 touchdown passes in the 2013 regular season?",
        choices: [
          { id: "a", label: "Tom Brady" },
          { id: "b", label: "Drew Brees" },
          { id: "c", label: "Peyton Manning" },
          { id: "d", label: "Aaron Rodgers" },
        ],
        correctChoiceId: "c",
        explanation: "Peyton Manning set the single-season record with 55 touchdown passes in 2013.",
      },
      {
        prompt: "Who set the single-season rushing record with 2,105 yards in 1984?",
        choices: [
          { id: "a", label: "Eric Dickerson" },
          { id: "b", label: "Adrian Peterson" },
          { id: "c", label: "Barry Sanders" },
          { id: "d", label: "LaDainian Tomlinson" },
        ],
        correctChoiceId: "a",
        explanation: "Eric Dickerson's 2,105 rushing yards in 1984 remain the NFL single-season record.",
      },
      {
        prompt: "Which kicker made the longest field goal in NFL history at 66 yards?",
        choices: [
          { id: "a", label: "Justin Tucker" },
          { id: "b", label: "Matt Prater" },
          { id: "c", label: "Sebastian Janikowski" },
          { id: "d", label: "Adam Vinatieri" },
        ],
        correctChoiceId: "a",
        explanation: "Justin Tucker set the NFL record with a 66-yard field goal in 2021.",
      },
    ],
  },
  ...githubQuizCatalog,
];

export async function seedQuizCatalog(): Promise<void> {
  await db.transaction(async (tx) => {
    for (const quiz of catalog) {
      await tx
        .insert(quizzesTable)
        .values({
          slug: quiz.slug,
          title: quiz.title,
          category: quiz.category,
          description: quiz.description,
          difficulty: quiz.difficulty,
          estimatedMinutes: quiz.estimatedMinutes,
          featured: quiz.featured,
        })
        .onConflictDoNothing({ target: quizzesTable.slug });

      const [savedQuiz] = await tx
        .select({ id: quizzesTable.id })
        .from(quizzesTable)
        .where(eq(quizzesTable.slug, quiz.slug));

      if (!savedQuiz) continue;

      await tx
        .insert(quizQuestionsTable)
        .values(
          quiz.questions.map((question, index) => ({
            quizId: savedQuiz.id,
            position: index + 1,
            prompt: question.prompt,
            choices: question.choices,
            correctChoiceId: question.correctChoiceId,
            explanation: question.explanation,
          })),
        )
        .onConflictDoNothing();
    }
  });
}
