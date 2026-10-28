import type { QuizChoice, QuizDifficulty } from "@workspace/db";

export type QuizCatalogEntry = {
  slug: string;
  title: string;
  category: string;
  description: string;
  difficulty: QuizDifficulty;
  estimatedMinutes: number;
  featured: boolean;
  questions: {
    prompt: string;
    choices: QuizChoice[];
    correctChoiceId: string;
    explanation: string;
  }[];
};

type RawQuestion = readonly [
  prompt: string,
  correctAnswer: string,
  distractor1: string,
  distractor2: string,
  distractor3: string,
];

type RawQuiz = {
  readonly slug: string;
  readonly title: string;
  readonly category: string;
  readonly description: string;
  readonly difficulty: QuizDifficulty;
  readonly estimatedMinutes: number;
  readonly featured: boolean;
  readonly questions: readonly RawQuestion[];
};

// Imported from scripts/seed-quiz-content.js in the connected GitHub repository.
const githubSourceQuizzes = [
  {
    slug: "football-basics-points-penalties",
    title: "Football Basics: Points & Penalties",
    category: "Rules Basics",
    description: "The simple stuff — how points work and what penalties mean.",
    difficulty: "Rookie",
    estimatedMinutes: 5,
    featured: true,
    questions: [
      ["How many points is a touchdown worth?", "6", "3", "7", "2"],
      ["After a touchdown, how many points does an extra point kick add?", "1", "2", "3", "6"],
      ["How many points is a field goal worth?", "3", "2", "6", "7"],
      ["How many points does a safety give the scoring team?", "2", "3", "6", "1"],
      ["How many points is a two-point conversion worth?", "2", "1", "3", "6"],
      ["How many yards is a typical penalty for holding?", "10", "5", "15", "20"],
      ["How many yards is the penalty for roughing the passer?", "15", "10", "5", "25"],
      ["How many yards is the penalty for a facemask foul?", "15", "5", "10", "20"],
      ["What is the maximum number of yards needed for a first down?", "10", "5", "15", "20"],
      ["How many yards is the penalty for a false start?", "5", "10", "15", "loss of down"],
    ],
  },
  {
    slug: "jersey-numbers-guess-the-number",
    title: "Jersey Numbers: Guess the Number",
    category: "Jersey Numbers",
    description: "Match the star player to their famous jersey number.",
    difficulty: "Pro",
    estimatedMinutes: 5,
    featured: false,
    questions: [
      ["Tom Brady wore which famous jersey number?", "12", "10", "7", "9"],
      ["Patrick Mahomes wears which jersey number?", "15", "12", "5", "16"],
      ["Which number did Peyton Manning wear?", "18", "16", "12", "20"],
      ["Joe Montana wore which jersey number?", "16", "19", "8", "12"],
      ["Jerry Rice, the greatest receiver ever, wore which number?", "80", "88", "85", "19"],
      ["Emmitt Smith, the all-time rushing leader, wore which number?", "22", "28", "21", "32"],
      ["Lions legend Barry Sanders wore which number?", "20", "21", "30", "23"],
      ["Giants great Lawrence Taylor wore which number?", "56", "58", "52", "99"],
      ["Odell Beckham Jr. made his famous one-handed catch wearing which number?", "13", "11", "80", "17"],
      ["Tight end Rob Gronkowski wore which number?", "87", "85", "82", "88"],
    ],
  },
  {
    slug: "all-time-stat-leaders",
    title: "All-Time Stat Leaders",
    category: "Records",
    description: "The greatest statistical careers in NFL history.",
    difficulty: "Hall of Fame",
    estimatedMinutes: 5,
    featured: false,
    questions: [
      ["Who holds the NFL record for career passing yards?", "Tom Brady", "Drew Brees", "Peyton Manning", "Brett Favre"],
      ["Who is the NFL’s all-time leading rusher?", "Emmitt Smith", "Walter Payton", "Barry Sanders", "Frank Gore"],
      ["Who holds the record for career receiving touchdowns?", "Randy Moss", "Jerry Rice", "Terrell Owens", "Antonio Gates"],
      ["Who threw the most career touchdown passes?", "Tom Brady", "Peyton Manning", "Drew Brees", "Aaron Rodgers"],
      ["Who kicked the longest field goal in NFL history (66 yards)?", "Justin Tucker", "Matt Prater", "Tom Dempsey", "Jason Elam"],
      ["Who holds the record for most career receptions?", "Larry Fitzgerald", "Jerry Rice", "Tony Gonzalez", "Jason Witten"],
      ["Which quarterback has the most career rushing yards?", "Lamar Jackson", "Michael Vick", "Cam Newton", "Randall Cunningham"],
      ["Who holds the single-season sack record (22.5)?", "T.J. Watt", "Michael Strahan", "Aaron Donald", "J.J. Watt"],
      ["Who holds the record for most career interceptions?", "Paul Krause", "Ed Reed", "Rod Woodson", "Night Train Lane"],
      ["Who scored the most total touchdowns in NFL history?", "Jerry Rice", "Emmitt Smith", "LaDainian Tomlinson", "Jim Brown"],
    ],
  },
  {
    slug: "franchises-stadiums-rivalries",
    title: "Franchises, Stadiums & Rivalries",
    category: "Teams",
    description: "Teams, their homes, and the rivalries that define them.",
    difficulty: "Pro",
    estimatedMinutes: 5,
    featured: false,
    questions: [
      ["What is the home stadium of the Green Bay Packers?", "Lambeau Field", "Soldier Field", "Ford Field", "U.S. Bank Stadium"],
      ["Which division contains the Cowboys, Eagles, Giants, and Commanders?", "NFC East", "NFC North", "AFC East", "NFC South"],
      ["Which team plays its home games at Lumen Field?", "Seattle Seahawks", "Denver Broncos", "Arizona Cardinals", "Las Vegas Raiders"],
      ["Which two teams share the NFL’s longest-running rivalry?", "Bears and Packers", "Cowboys and Eagles", "Chiefs and Raiders", "Giants and Eagles"],
      ["What feature celebrates touchdowns at the Buccaneers’ home stadium?", "A pirate ship", "A lighthouse", "A steamboat", "A bull statue"],
      ["Which team is known as \"Da Bears\"?", "Chicago Bears", "Cincinnati Bengals", "Chicago Cardinals", "Detroit Lions"],
      ["Which stadium is nicknamed \"The Frozen Tundra\"?", "Lambeau Field", "Highmark Stadium", "Soldier Field", "Gillette Stadium"],
      ["Which team moved from San Diego to Los Angeles?", "Chargers", "Rams", "Raiders", "49ers"],
      ["Which team plays at Arrowhead Stadium?", "Kansas City Chiefs", "Buffalo Bills", "Tennessee Titans", "Houston Texans"],
      ["The \"Battle of Texas\" is between the Cowboys and which team?", "Houston Texans", "Tennessee Titans", "Kansas City Chiefs", "New Orleans Saints"],
    ],
  },
  {
    slug: "nfl-draft-franchise-legends",
    title: "NFL Draft & Franchise Legends",
    category: "Draft",
    description: "Draft history and the players who defined franchises.",
    difficulty: "Pro",
    estimatedMinutes: 5,
    featured: false,
    questions: [
      ["Who was the #1 overall pick of the 1998 NFL Draft?", "Peyton Manning", "Ryan Leaf", "Charles Woodson", "Marshall Faulk"],
      ["What is the nickname given to the last pick of the NFL Draft?", "Mr. Irrelevant", "Mr. Underdog", "The Final Pick", "Rookie Zero"],
      ["In which round was Tom Brady drafted?", "6th round", "1st round", "3rd round", "Undrafted"],
      ["Which coach holds the record for most career wins?", "Don Shula", "Bill Belichick", "George Halas", "Tom Landry"],
      ["Which linebacker is widely considered the greatest defensive player ever?", "Lawrence Taylor", "Ray Lewis", "Reggie White", "Dick Butkus"],
      ["Which team drafted Brett Favre before trading him to Green Bay?", "Atlanta Falcons", "Green Bay Packers", "New York Jets", "Denver Broncos"],
      ["Who was the #1 overall pick in the 2023 NFL Draft?", "Bryce Young", "C.J. Stroud", "Will Anderson Jr.", "Anthony Richardson"],
      ["Which running back did the Chargers draft #5 overall in 2001?", "LaDainian Tomlinson", "Priest Holmes", "Shaun Alexander", "Adrian Peterson"],
      ["Which team drafted Joe Montana and later traded him to the Chiefs in 1993?", "San Francisco 49ers", "Kansas City Chiefs", "Dallas Cowboys", "Chicago Bears"],
      ["What is the name of the event where draft prospects show off their skills before the Draft?", "The NFL Scouting Combine", "The Rookie Showcase", "Draft Camp", "Pro Day Finals"],
    ],
  },
] as const satisfies readonly RawQuiz[];

export const githubQuizCatalog: QuizCatalogEntry[] = githubSourceQuizzes.map((quiz) => ({
  ...quiz,
  questions: quiz.questions.map(([prompt, correctAnswer, ...distractors]) => {
    const labels = [correctAnswer, ...distractors];
    return {
      prompt,
      choices: labels.map((label, index) => ({ id: String.fromCharCode(97 + index), label })),
      correctChoiceId: "a",
      explanation: "The correct answer is " + correctAnswer + ".",
    };
  }),
}));
