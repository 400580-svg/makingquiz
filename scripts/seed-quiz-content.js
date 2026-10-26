// QA quiz-content seeder: creates the 5 required playbooks with 10 questions each.
// Idempotent: skips quizzes that already exist (matched by title).
// Usage: npm run seed:quizzes   (run against the QA DATABASE_URL only)
require('dotenv').config();
const { pool, query } = require('../db');

const QUIZZES = [
  {
    "title": "Super Bowl History & Champions",
    "category": "Super Bowl",
    "description": "From SB I to the modern era — champions, MVPs, and memorable moments.",
    "questions": [
      {
        "text": "Which team won the very first Super Bowl (January 1967)?",
        "opts": [
          "Green Bay Packers",
          "Kansas City Chiefs",
          "Baltimore Colts",
          "Dallas Cowboys"
        ],
        "correctIdx": 0
      },
      {
        "text": "What is the name of the trophy awarded to the Super Bowl winner?",
        "opts": [
          "Lombardi Trophy",
          "Halas Trophy",
          "Commissioner’s Trophy",
          "Heisman Trophy"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which quarterback has won the most Super Bowl MVP awards?",
        "opts": [
          "Tom Brady",
          "Patrick Mahomes",
          "Joe Montana",
          "Terry Bradshaw"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which team finished the 1972 season undefeated and won Super Bowl VII?",
        "opts": [
          "Miami Dolphins",
          "New England Patriots",
          "Chicago Bears",
          "San Francisco 49ers"
        ],
        "correctIdx": 0
      },
      {
        "text": "Who headlined the Super Bowl LVII halftime show in 2023?",
        "opts": [
          "Rihanna",
          "The Weeknd",
          "Dr. Dre",
          "Shakira"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which Super Bowl was the lowest-scoring in history (13–9 final score)?",
        "opts": [
          "LIII (Patriots–Rams)",
          "XXV (Giants–Bills)",
          "50 (Broncos–Panthers)",
          "XXXV (Ravens–Giants)"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which two franchises share the record for most Super Bowl wins (6)?",
        "opts": [
          "Patriots and Steelers",
          "Cowboys and 49ers",
          "Packers and Giants",
          "Broncos and Raiders"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which quarterback holds the record for most Super Bowl wins as a starter?",
        "opts": [
          "Tom Brady",
          "Joe Montana",
          "Terry Bradshaw",
          "John Elway"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which team is famous for losing four consecutive Super Bowls in the early 1990s?",
        "opts": [
          "Buffalo Bills",
          "Minnesota Vikings",
          "Cleveland Browns",
          "Detroit Lions"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which team was the first wild-card team to win a Super Bowl (SB XV)?",
        "opts": [
          "Oakland Raiders",
          "Denver Broncos",
          "Baltimore Ravens",
          "Washington Commanders"
        ],
        "correctIdx": 0
      }
    ]
  },
  {
    "title": "All-Time Stat Leaders",
    "category": "Statistics",
    "description": "The record holders of NFL history — yards, touchdowns, and legends.",
    "questions": [
      {
        "text": "Who is the NFL’s all-time leader in career passing yards?",
        "opts": [
          "Tom Brady",
          "Drew Brees",
          "Peyton Manning",
          "Brett Favre"
        ],
        "correctIdx": 0
      },
      {
        "text": "Who holds the NFL record for career rushing yards?",
        "opts": [
          "Emmitt Smith",
          "Walter Payton",
          "Barry Sanders",
          "Adrian Peterson"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which receiver is second all-time in career receiving touchdowns?",
        "opts": [
          "Randy Moss",
          "Jerry Rice",
          "Terrell Owens",
          "Cris Carter"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which quarterback set the single-season passing touchdown record (55 in 2013)?",
        "opts": [
          "Peyton Manning",
          "Tom Brady",
          "Aaron Rodgers",
          "Patrick Mahomes"
        ],
        "correctIdx": 0
      },
      {
        "text": "Who kicked the longest field goal in NFL history (66 yards)?",
        "opts": [
          "Justin Tucker",
          "Matt Prater",
          "Brett Maher",
          "Tom Dempsey"
        ],
        "correctIdx": 0
      },
      {
        "text": "Who holds the NFL record for career rushing touchdowns?",
        "opts": [
          "Emmitt Smith",
          "LaDainian Tomlinson",
          "Marcus Allen",
          "Jim Brown"
        ],
        "correctIdx": 0
      },
      {
        "text": "Who is the NFL’s all-time leader in receiving yards?",
        "opts": [
          "Jerry Rice",
          "Larry Fitzgerald",
          "Terrell Owens",
          "Randy Moss"
        ],
        "correctIdx": 0
      },
      {
        "text": "Who is the official all-time leader in career sacks?",
        "opts": [
          "Bruce Smith",
          "Reggie White",
          "Kevin Greene",
          "J.J. Watt"
        ],
        "correctIdx": 0
      },
      {
        "text": "Who holds the NFL record for career interceptions?",
        "opts": [
          "Paul Krause",
          "Night Train Lane",
          "Ed Reed",
          "Rod Woodson"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which player recorded the most 1,000-yard receiving seasons in NFL history?",
        "opts": [
          "Jerry Rice",
          "Randy Moss",
          "Tony Gonzalez",
          "Marvin Harrison"
        ],
        "correctIdx": 0
      }
    ]
  },
  {
    "title": "Franchises, Stadiums & Rivalries",
    "category": "Franchises",
    "description": "Teams, iconic venues, and the rivalries that define football.",
    "questions": [
      {
        "text": "Which iconic stadium is the home of the Green Bay Packers?",
        "opts": [
          "Lambeau Field",
          "Soldier Field",
          "Arrowhead Stadium",
          "Heinz Field"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which four teams make up the NFC East?",
        "opts": [
          "Cowboys, Giants, Eagles, Commanders",
          "Cowboys, Bears, Eagles, Falcons",
          "Giants, Jets, Eagles, Ravens",
          "Commanders, Panthers, Cowboys, Bills"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which rivalry is the oldest in the NFL, dating to 1921?",
        "opts": [
          "Bears–Packers",
          "Cowboys–Giants",
          "Steelers–Ravens",
          "Chiefs–Raiders"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which Seattle stadium is famous for its deafening crowd noise?",
        "opts": [
          "Lumen Field",
          "CenturyLink Park",
          "Space Needle Stadium",
          "Emerald Field"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which team’s stadium features a pirate ship that fires cannons after touchdowns?",
        "opts": [
          "Tampa Bay Buccaneers",
          "Oakland Raiders",
          "Jacksonville Jaguars",
          "Las Vegas Raiders"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which franchise is named after a poem by Edgar Allan Poe?",
        "opts": [
          "Baltimore Ravens",
          "Seattle Seahawks",
          "Philadelphia Eagles",
          "Arizona Cardinals"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which team hosts at least one home game in London nearly every season?",
        "opts": [
          "Jacksonville Jaguars",
          "Miami Dolphins",
          "Buffalo Bills",
          "Carolina Panthers"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which franchise relocated to Las Vegas in 2020?",
        "opts": [
          "Raiders",
          "Chargers",
          "Rams",
          "Cardinals"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which team plays its home games at Arrowhead Stadium?",
        "opts": [
          "Kansas City Chiefs",
          "Dallas Cowboys",
          "Cincinnati Bengals",
          "Tennessee Titans"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which NFL city has hosted a team continuously since 1925 without ever winning a Super Bowl?",
        "opts": [
          "Detroit",
          "Buffalo",
          "Cleveland",
          "Houston"
        ],
        "correctIdx": 0
      }
    ]
  },
  {
    "title": "Rules, Formations & Tactics",
    "category": "Rules",
    "description": "Know the game — scoring, penalties, and defensive schemes.",
    "questions": [
      {
        "text": "How many points is a touchdown worth?",
        "opts": [
          "6",
          "7",
          "3",
          "5"
        ],
        "correctIdx": 0
      },
      {
        "text": "How many points does a kicked extra point add after a touchdown?",
        "opts": [
          "1",
          "2",
          "3",
          "0"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which penalty results in a 15-yard loss?",
        "opts": [
          "Roughing the passer",
          "False start",
          "Offsides",
          "Illegal formation"
        ],
        "correctIdx": 0
      },
      {
        "text": "How many points is a safety worth?",
        "opts": [
          "2",
          "3",
          "1",
          "6"
        ],
        "correctIdx": 0
      },
      {
        "text": "What is the line of scrimmage?",
        "opts": [
          "The imaginary line where a play begins",
          "The goal line",
          "The first-down marker",
          "The sideline"
        ],
        "correctIdx": 0
      },
      {
        "text": "In a 3-4 defense, what do the numbers refer to?",
        "opts": [
          "3 defensive linemen and 4 linebackers",
          "3 cornerbacks and 4 safeties",
          "3 downlinemen and 4 blitzes",
          "3rd down and 4th quarter"
        ],
        "correctIdx": 0
      },
      {
        "text": "How many points is a made field goal worth?",
        "opts": [
          "3",
          "2",
          "4",
          "1"
        ],
        "correctIdx": 0
      },
      {
        "text": "How many points is a successful two-point conversion worth?",
        "opts": [
          "2",
          "1",
          "3",
          "6"
        ],
        "correctIdx": 0
      },
      {
        "text": "In NFL overtime, what happens if the receiving team scores a touchdown on its first possession?",
        "opts": [
          "The game immediately ends",
          "The other team gets the ball",
          "Play continues to a second OT series",
          "A coin toss decides"
        ],
        "correctIdx": 0
      },
      {
        "text": "How many offensive downs does a team get to earn a first down?",
        "opts": [
          "4",
          "3",
          "5",
          "2"
        ],
        "correctIdx": 0
      }
    ]
  },
  {
    "title": "NFL Draft & Franchise Legends",
    "category": "Draft",
    "description": "Draft history and the players who became franchise icons.",
    "questions": [
      {
        "text": "Which quarterback was drafted #1 overall by the Colts in 1998?",
        "opts": [
          "Peyton Manning",
          "Ryan Leaf",
          "Akili Smith",
          "Tim Couch"
        ],
        "correctIdx": 0
      },
      {
        "text": "What nickname is given to the final pick of the NFL Draft?",
        "opts": [
          "Mr. Irrelevant",
          "Mr. Irreplaceable",
          "The Finalist",
          "Mr. Number One"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which quarterback was drafted 199th overall in the 2000 Draft?",
        "opts": [
          "Tom Brady",
          "Aaron Rodgers",
          "Dak Prescott",
          "Russell Wilson"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which head coach holds the NFL record for most career wins?",
        "opts": [
          "Don Shula",
          "Bill Belichick",
          "George Halas",
          "Tom Landry"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which linebacker is widely considered the greatest defensive player in NFL history?",
        "opts": [
          "Lawrence Taylor",
          "Ray Lewis",
          "Reggie White",
          "Dick Butkus"
        ],
        "correctIdx": 0
      },
      {
        "text": "How many rounds does the modern NFL Draft have?",
        "opts": [
          "7",
          "5",
          "6",
          "12"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which team drafted Tom Brady in 2000?",
        "opts": [
          "New England Patriots",
          "Green Bay Packers",
          "New York Giants",
          "San Francisco 49ers"
        ],
        "correctIdx": 0
      },
      {
        "text": "With which franchise did Joe Montana win four Super Bowls?",
        "opts": [
          "San Francisco 49ers",
          "Kansas City Chiefs",
          "Dallas Cowboys",
          "Oakland Raiders"
        ],
        "correctIdx": 0
      },
      {
        "text": "Which franchise is Dan Marino most associated with?",
        "opts": [
          "Miami Dolphins",
          "Buffalo Bills",
          "New York Jets",
          "Pittsburgh Steelers"
        ],
        "correctIdx": 0
      },
      {
        "text": "In which city is the NFL Scouting Combine held each year?",
        "opts": [
          "Indianapolis",
          "Chicago",
          "New York",
          "Atlanta"
        ],
        "correctIdx": 0
      }
    ]
  }
];

(async () => {
  const admin = await query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  if (admin.rows.length === 0) {
    console.error('No admin user found. Run seed.sql first.'); process.exit(1);
  }
  const creatorId = admin.rows[0].id;

  for (const quiz of QUIZZES) {
    const exists = await query('SELECT id FROM quizzes WHERE title = $1', [quiz.title]);
    if (exists.rows.length > 0) {
      console.log('skip (exists):', quiz.title);
      continue;
    }
    const created = await query(
      `INSERT INTO quizzes (creator_id, title, category, description, is_public)
       VALUES ($1, $2, $3, $4, TRUE) RETURNING id`,
      [creatorId, quiz.title, quiz.category, quiz.description]
    );
    const quizId = created.rows[0].id;
    for (const question of quiz.questions) {
      const inserted = await query(
        `INSERT INTO questions (quiz_id, question_text) VALUES ($1, $2) RETURNING id`,
        [quizId, question.text]
      );
      const questionId = inserted.rows[0].id;
      for (let i = 0; i < question.opts.length; i++) {
        await query(
          'INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, $2, $3)',
          [questionId, question.opts[i], i === question.correctIdx]
        );
      }
    }
    console.log('seeded:', quiz.title);
  }
  await pool.end();
  console.log('Quiz content seeding complete.');
})().catch((err) => { console.error(err.message); process.exit(1); });
