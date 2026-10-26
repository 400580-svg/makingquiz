// scripts/seed-quiz-content.js
// QA seed for 5 playbooks x 10 questions (Phase 2 scope).
// Idempotent: wipes existing quiz content and re-inserts it.
// The FIRST option in each question's array is the correct answer; the API
// shuffles option order when serving, so position does not leak answers.
require('dotenv').config();
const { pool, query } = require('../db');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM quizzes'); // cascades to questions + options

    // ---- Quiz 1: Football Basics: Points & Penalties ----
    const quiz0 = await client.query(
      `INSERT INTO quizzes (creator_id, title, category, description, is_public)
       SELECT id, 'Football Basics: Points & Penalties', 'Rules Basics', 'The simple stuff — how points work and what penalties mean.', TRUE
       FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1
       RETURNING id`
    );
    { // Q1.1
      const q0_0 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'How many points is a touchdown worth?', TRUE) RETURNING id`,
        [quiz0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '6', TRUE)`,
        [q0_0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '3', FALSE)`,
        [q0_0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '7', FALSE)`,
        [q0_0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '2', FALSE)`,
        [q0_0.rows[0].id]
      );
    }
    { // Q1.2
      const q0_1 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'After a touchdown, how many points does an extra point kick add?', TRUE) RETURNING id`,
        [quiz0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '1', TRUE)`,
        [q0_1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '2', FALSE)`,
        [q0_1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '3', FALSE)`,
        [q0_1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '6', FALSE)`,
        [q0_1.rows[0].id]
      );
    }
    { // Q1.3
      const q0_2 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'How many points is a field goal worth?', TRUE) RETURNING id`,
        [quiz0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '3', TRUE)`,
        [q0_2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '2', FALSE)`,
        [q0_2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '6', FALSE)`,
        [q0_2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '7', FALSE)`,
        [q0_2.rows[0].id]
      );
    }
    { // Q1.4
      const q0_3 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'How many points does a safety give the scoring team?', TRUE) RETURNING id`,
        [quiz0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '2', TRUE)`,
        [q0_3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '3', FALSE)`,
        [q0_3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '6', FALSE)`,
        [q0_3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '1', FALSE)`,
        [q0_3.rows[0].id]
      );
    }
    { // Q1.5
      const q0_4 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'How many points is a two-point conversion worth?', TRUE) RETURNING id`,
        [quiz0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '2', TRUE)`,
        [q0_4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '1', FALSE)`,
        [q0_4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '3', FALSE)`,
        [q0_4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '6', FALSE)`,
        [q0_4.rows[0].id]
      );
    }
    { // Q1.6
      const q0_5 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'How many yards is a typical penalty for holding?', TRUE) RETURNING id`,
        [quiz0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '10', TRUE)`,
        [q0_5.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '5', FALSE)`,
        [q0_5.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '15', FALSE)`,
        [q0_5.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '20', FALSE)`,
        [q0_5.rows[0].id]
      );
    }
    { // Q1.7
      const q0_6 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'How many yards is the penalty for roughing the passer?', TRUE) RETURNING id`,
        [quiz0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '15', TRUE)`,
        [q0_6.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '10', FALSE)`,
        [q0_6.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '5', FALSE)`,
        [q0_6.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '25', FALSE)`,
        [q0_6.rows[0].id]
      );
    }
    { // Q1.8
      const q0_7 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'How many yards is the penalty for a facemask foul?', TRUE) RETURNING id`,
        [quiz0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '15', TRUE)`,
        [q0_7.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '5', FALSE)`,
        [q0_7.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '10', FALSE)`,
        [q0_7.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '20', FALSE)`,
        [q0_7.rows[0].id]
      );
    }
    { // Q1.9
      const q0_8 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'What is the maximum number of yards needed for a first down?', TRUE) RETURNING id`,
        [quiz0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '10', TRUE)`,
        [q0_8.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '5', FALSE)`,
        [q0_8.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '15', FALSE)`,
        [q0_8.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '20', FALSE)`,
        [q0_8.rows[0].id]
      );
    }
    { // Q1.10
      const q0_9 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'How many yards is the penalty for a false start?', TRUE) RETURNING id`,
        [quiz0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '5', TRUE)`,
        [q0_9.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '10', FALSE)`,
        [q0_9.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '15', FALSE)`,
        [q0_9.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'loss of down', FALSE)`,
        [q0_9.rows[0].id]
      );
    }

    // ---- Quiz 2: Jersey Numbers: Guess the Number ----
    const quiz1 = await client.query(
      `INSERT INTO quizzes (creator_id, title, category, description, is_public)
       SELECT id, 'Jersey Numbers: Guess the Number', 'Jersey Numbers', 'Match the star player to their famous jersey number.', TRUE
       FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1
       RETURNING id`
    );
    { // Q2.1
      const q1_0 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Tom Brady wore which famous jersey number?', TRUE) RETURNING id`,
        [quiz1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '12', TRUE)`,
        [q1_0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '10', FALSE)`,
        [q1_0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '7', FALSE)`,
        [q1_0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '9', FALSE)`,
        [q1_0.rows[0].id]
      );
    }
    { // Q2.2
      const q1_1 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Patrick Mahomes wears which jersey number?', TRUE) RETURNING id`,
        [quiz1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '15', TRUE)`,
        [q1_1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '12', FALSE)`,
        [q1_1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '5', FALSE)`,
        [q1_1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '16', FALSE)`,
        [q1_1.rows[0].id]
      );
    }
    { // Q2.3
      const q1_2 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Which number did Peyton Manning wear?', TRUE) RETURNING id`,
        [quiz1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '18', TRUE)`,
        [q1_2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '16', FALSE)`,
        [q1_2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '12', FALSE)`,
        [q1_2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '20', FALSE)`,
        [q1_2.rows[0].id]
      );
    }
    { // Q2.4
      const q1_3 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Joe Montana wore which jersey number?', TRUE) RETURNING id`,
        [quiz1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '16', TRUE)`,
        [q1_3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '19', FALSE)`,
        [q1_3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '8', FALSE)`,
        [q1_3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '12', FALSE)`,
        [q1_3.rows[0].id]
      );
    }
    { // Q2.5
      const q1_4 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Jerry Rice, the greatest receiver ever, wore which number?', TRUE) RETURNING id`,
        [quiz1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '80', TRUE)`,
        [q1_4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '88', FALSE)`,
        [q1_4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '85', FALSE)`,
        [q1_4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '19', FALSE)`,
        [q1_4.rows[0].id]
      );
    }
    { // Q2.6
      const q1_5 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Emmitt Smith, the all-time rushing leader, wore which number?', TRUE) RETURNING id`,
        [quiz1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '22', TRUE)`,
        [q1_5.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '28', FALSE)`,
        [q1_5.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '21', FALSE)`,
        [q1_5.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '32', FALSE)`,
        [q1_5.rows[0].id]
      );
    }
    { // Q2.7
      const q1_6 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Lions legend Barry Sanders wore which number?', TRUE) RETURNING id`,
        [quiz1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '20', TRUE)`,
        [q1_6.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '21', FALSE)`,
        [q1_6.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '30', FALSE)`,
        [q1_6.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '23', FALSE)`,
        [q1_6.rows[0].id]
      );
    }
    { // Q2.8
      const q1_7 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Giants great Lawrence Taylor wore which number?', TRUE) RETURNING id`,
        [quiz1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '56', TRUE)`,
        [q1_7.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '58', FALSE)`,
        [q1_7.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '52', FALSE)`,
        [q1_7.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '99', FALSE)`,
        [q1_7.rows[0].id]
      );
    }
    { // Q2.9
      const q1_8 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Odell Beckham Jr. made his famous one-handed catch wearing which number?', TRUE) RETURNING id`,
        [quiz1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '13', TRUE)`,
        [q1_8.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '11', FALSE)`,
        [q1_8.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '80', FALSE)`,
        [q1_8.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '17', FALSE)`,
        [q1_8.rows[0].id]
      );
    }
    { // Q2.10
      const q1_9 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Tight end Rob Gronkowski wore which number?', TRUE) RETURNING id`,
        [quiz1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '87', TRUE)`,
        [q1_9.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '85', FALSE)`,
        [q1_9.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '82', FALSE)`,
        [q1_9.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '88', FALSE)`,
        [q1_9.rows[0].id]
      );
    }

    // ---- Quiz 3: All-Time Stat Leaders ----
    const quiz2 = await client.query(
      `INSERT INTO quizzes (creator_id, title, category, description, is_public)
       SELECT id, 'All-Time Stat Leaders', 'Records', 'The greatest statistical careers in NFL history.', TRUE
       FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1
       RETURNING id`
    );
    { // Q3.1
      const q2_0 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Who holds the NFL record for career passing yards?', TRUE) RETURNING id`,
        [quiz2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Tom Brady', TRUE)`,
        [q2_0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Drew Brees', FALSE)`,
        [q2_0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Peyton Manning', FALSE)`,
        [q2_0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Brett Favre', FALSE)`,
        [q2_0.rows[0].id]
      );
    }
    { // Q3.2
      const q2_1 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Who is the NFL’s all-time leading rusher?', TRUE) RETURNING id`,
        [quiz2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Emmitt Smith', TRUE)`,
        [q2_1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Walter Payton', FALSE)`,
        [q2_1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Barry Sanders', FALSE)`,
        [q2_1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Frank Gore', FALSE)`,
        [q2_1.rows[0].id]
      );
    }
    { // Q3.3
      const q2_2 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Who holds the record for career receiving touchdowns?', TRUE) RETURNING id`,
        [quiz2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Randy Moss', TRUE)`,
        [q2_2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Jerry Rice', FALSE)`,
        [q2_2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Terrell Owens', FALSE)`,
        [q2_2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Antonio Gates', FALSE)`,
        [q2_2.rows[0].id]
      );
    }
    { // Q3.4
      const q2_3 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Who threw the most career touchdown passes?', TRUE) RETURNING id`,
        [quiz2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Tom Brady', TRUE)`,
        [q2_3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Peyton Manning', FALSE)`,
        [q2_3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Drew Brees', FALSE)`,
        [q2_3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Aaron Rodgers', FALSE)`,
        [q2_3.rows[0].id]
      );
    }
    { // Q3.5
      const q2_4 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Who kicked the longest field goal in NFL history (66 yards)?', TRUE) RETURNING id`,
        [quiz2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Justin Tucker', TRUE)`,
        [q2_4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Matt Prater', FALSE)`,
        [q2_4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Tom Dempsey', FALSE)`,
        [q2_4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Jason Elam', FALSE)`,
        [q2_4.rows[0].id]
      );
    }
    { // Q3.6
      const q2_5 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Who holds the record for most career receptions?', TRUE) RETURNING id`,
        [quiz2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Larry Fitzgerald', TRUE)`,
        [q2_5.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Jerry Rice', FALSE)`,
        [q2_5.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Tony Gonzalez', FALSE)`,
        [q2_5.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Jason Witten', FALSE)`,
        [q2_5.rows[0].id]
      );
    }
    { // Q3.7
      const q2_6 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Which quarterback has the most career rushing yards?', TRUE) RETURNING id`,
        [quiz2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Lamar Jackson', TRUE)`,
        [q2_6.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Michael Vick', FALSE)`,
        [q2_6.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Cam Newton', FALSE)`,
        [q2_6.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Randall Cunningham', FALSE)`,
        [q2_6.rows[0].id]
      );
    }
    { // Q3.8
      const q2_7 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Who holds the single-season sack record (22.5)?', TRUE) RETURNING id`,
        [quiz2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'T.J. Watt', TRUE)`,
        [q2_7.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Michael Strahan', FALSE)`,
        [q2_7.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Aaron Donald', FALSE)`,
        [q2_7.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'J.J. Watt', FALSE)`,
        [q2_7.rows[0].id]
      );
    }
    { // Q3.9
      const q2_8 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Who holds the record for most career interceptions?', TRUE) RETURNING id`,
        [quiz2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Paul Krause', TRUE)`,
        [q2_8.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Ed Reed', FALSE)`,
        [q2_8.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Rod Woodson', FALSE)`,
        [q2_8.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Night Train Lane', FALSE)`,
        [q2_8.rows[0].id]
      );
    }
    { // Q3.10
      const q2_9 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Who scored the most total touchdowns in NFL history?', TRUE) RETURNING id`,
        [quiz2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Jerry Rice', TRUE)`,
        [q2_9.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Emmitt Smith', FALSE)`,
        [q2_9.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'LaDainian Tomlinson', FALSE)`,
        [q2_9.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Jim Brown', FALSE)`,
        [q2_9.rows[0].id]
      );
    }

    // ---- Quiz 4: Franchises, Stadiums & Rivalries ----
    const quiz3 = await client.query(
      `INSERT INTO quizzes (creator_id, title, category, description, is_public)
       SELECT id, 'Franchises, Stadiums & Rivalries', 'Teams', 'Teams, their homes, and the rivalries that define them.', TRUE
       FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1
       RETURNING id`
    );
    { // Q4.1
      const q3_0 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'What is the home stadium of the Green Bay Packers?', TRUE) RETURNING id`,
        [quiz3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Lambeau Field', TRUE)`,
        [q3_0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Soldier Field', FALSE)`,
        [q3_0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Ford Field', FALSE)`,
        [q3_0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'U.S. Bank Stadium', FALSE)`,
        [q3_0.rows[0].id]
      );
    }
    { // Q4.2
      const q3_1 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Which division contains the Cowboys, Eagles, Giants, and Commanders?', TRUE) RETURNING id`,
        [quiz3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'NFC East', TRUE)`,
        [q3_1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'NFC North', FALSE)`,
        [q3_1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'AFC East', FALSE)`,
        [q3_1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'NFC South', FALSE)`,
        [q3_1.rows[0].id]
      );
    }
    { // Q4.3
      const q3_2 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Which team plays its home games at Lumen Field?', TRUE) RETURNING id`,
        [quiz3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Seattle Seahawks', TRUE)`,
        [q3_2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Denver Broncos', FALSE)`,
        [q3_2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Arizona Cardinals', FALSE)`,
        [q3_2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Las Vegas Raiders', FALSE)`,
        [q3_2.rows[0].id]
      );
    }
    { // Q4.4
      const q3_3 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Which two teams share the NFL’s longest-running rivalry?', TRUE) RETURNING id`,
        [quiz3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Bears and Packers', TRUE)`,
        [q3_3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Cowboys and Eagles', FALSE)`,
        [q3_3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Chiefs and Raiders', FALSE)`,
        [q3_3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Giants and Eagles', FALSE)`,
        [q3_3.rows[0].id]
      );
    }
    { // Q4.5
      const q3_4 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'What feature celebrates touchdowns at the Buccaneers’ home stadium?', TRUE) RETURNING id`,
        [quiz3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'A pirate ship', TRUE)`,
        [q3_4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'A lighthouse', FALSE)`,
        [q3_4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'A steamboat', FALSE)`,
        [q3_4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'A bull statue', FALSE)`,
        [q3_4.rows[0].id]
      );
    }
    { // Q4.6
      const q3_5 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Which team is known as "Da Bears"?', TRUE) RETURNING id`,
        [quiz3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Chicago Bears', TRUE)`,
        [q3_5.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Cincinnati Bengals', FALSE)`,
        [q3_5.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Chicago Cardinals', FALSE)`,
        [q3_5.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Detroit Lions', FALSE)`,
        [q3_5.rows[0].id]
      );
    }
    { // Q4.7
      const q3_6 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Which stadium is nicknamed "The Frozen Tundra"?', TRUE) RETURNING id`,
        [quiz3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Lambeau Field', TRUE)`,
        [q3_6.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Highmark Stadium', FALSE)`,
        [q3_6.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Soldier Field', FALSE)`,
        [q3_6.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Gillette Stadium', FALSE)`,
        [q3_6.rows[0].id]
      );
    }
    { // Q4.8
      const q3_7 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Which team moved from San Diego to Los Angeles?', TRUE) RETURNING id`,
        [quiz3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Chargers', TRUE)`,
        [q3_7.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Rams', FALSE)`,
        [q3_7.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Raiders', FALSE)`,
        [q3_7.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '49ers', FALSE)`,
        [q3_7.rows[0].id]
      );
    }
    { // Q4.9
      const q3_8 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Which team plays at Arrowhead Stadium?', TRUE) RETURNING id`,
        [quiz3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Kansas City Chiefs', TRUE)`,
        [q3_8.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Buffalo Bills', FALSE)`,
        [q3_8.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Tennessee Titans', FALSE)`,
        [q3_8.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Houston Texans', FALSE)`,
        [q3_8.rows[0].id]
      );
    }
    { // Q4.10
      const q3_9 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'The "Battle of Texas" is between the Cowboys and which team?', TRUE) RETURNING id`,
        [quiz3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Houston Texans', TRUE)`,
        [q3_9.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Tennessee Titans', FALSE)`,
        [q3_9.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Kansas City Chiefs', FALSE)`,
        [q3_9.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'New Orleans Saints', FALSE)`,
        [q3_9.rows[0].id]
      );
    }

    // ---- Quiz 5: NFL Draft & Franchise Legends ----
    const quiz4 = await client.query(
      `INSERT INTO quizzes (creator_id, title, category, description, is_public)
       SELECT id, 'NFL Draft & Franchise Legends', 'Draft', 'Draft history and the players who defined franchises.', TRUE
       FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1
       RETURNING id`
    );
    { // Q5.1
      const q4_0 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Who was the #1 overall pick of the 1998 NFL Draft?', TRUE) RETURNING id`,
        [quiz4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Peyton Manning', TRUE)`,
        [q4_0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Ryan Leaf', FALSE)`,
        [q4_0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Charles Woodson', FALSE)`,
        [q4_0.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Marshall Faulk', FALSE)`,
        [q4_0.rows[0].id]
      );
    }
    { // Q5.2
      const q4_1 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'What is the nickname given to the last pick of the NFL Draft?', TRUE) RETURNING id`,
        [quiz4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Mr. Irrelevant', TRUE)`,
        [q4_1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Mr. Underdog', FALSE)`,
        [q4_1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'The Final Pick', FALSE)`,
        [q4_1.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Rookie Zero', FALSE)`,
        [q4_1.rows[0].id]
      );
    }
    { // Q5.3
      const q4_2 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'In which round was Tom Brady drafted?', TRUE) RETURNING id`,
        [quiz4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '6th round', TRUE)`,
        [q4_2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '1st round', FALSE)`,
        [q4_2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, '3rd round', FALSE)`,
        [q4_2.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Undrafted', FALSE)`,
        [q4_2.rows[0].id]
      );
    }
    { // Q5.4
      const q4_3 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Which coach holds the record for most career wins?', TRUE) RETURNING id`,
        [quiz4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Don Shula', TRUE)`,
        [q4_3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Bill Belichick', FALSE)`,
        [q4_3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'George Halas', FALSE)`,
        [q4_3.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Tom Landry', FALSE)`,
        [q4_3.rows[0].id]
      );
    }
    { // Q5.5
      const q4_4 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Which linebacker is widely considered the greatest defensive player ever?', TRUE) RETURNING id`,
        [quiz4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Lawrence Taylor', TRUE)`,
        [q4_4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Ray Lewis', FALSE)`,
        [q4_4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Reggie White', FALSE)`,
        [q4_4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Dick Butkus', FALSE)`,
        [q4_4.rows[0].id]
      );
    }
    { // Q5.6
      const q4_5 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Which team drafted Brett Favre before trading him to Green Bay?', TRUE) RETURNING id`,
        [quiz4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Atlanta Falcons', TRUE)`,
        [q4_5.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Green Bay Packers', FALSE)`,
        [q4_5.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'New York Jets', FALSE)`,
        [q4_5.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Denver Broncos', FALSE)`,
        [q4_5.rows[0].id]
      );
    }
    { // Q5.7
      const q4_6 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Who was the #1 overall pick in the 2023 NFL Draft?', TRUE) RETURNING id`,
        [quiz4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Bryce Young', TRUE)`,
        [q4_6.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'C.J. Stroud', FALSE)`,
        [q4_6.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Will Anderson Jr.', FALSE)`,
        [q4_6.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Anthony Richardson', FALSE)`,
        [q4_6.rows[0].id]
      );
    }
    { // Q5.8
      const q4_7 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Which running back did the Chargers draft #5 overall in 2001?', TRUE) RETURNING id`,
        [quiz4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'LaDainian Tomlinson', TRUE)`,
        [q4_7.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Priest Holmes', FALSE)`,
        [q4_7.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Shaun Alexander', FALSE)`,
        [q4_7.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Adrian Peterson', FALSE)`,
        [q4_7.rows[0].id]
      );
    }
    { // Q5.9
      const q4_8 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'Which team drafted Joe Montana and later traded him to the Chiefs in 1993?', TRUE) RETURNING id`,
        [quiz4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'San Francisco 49ers', TRUE)`,
        [q4_8.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Kansas City Chiefs', FALSE)`,
        [q4_8.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Dallas Cowboys', FALSE)`,
        [q4_8.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Chicago Bears', FALSE)`,
        [q4_8.rows[0].id]
      );
    }
    { // Q5.10
      const q4_9 = await client.query(
        `INSERT INTO questions (quiz_id, question_text, is_active)
         VALUES ($1, 'What is the name of the event where draft prospects show off their skills before the Draft?', TRUE) RETURNING id`,
        [quiz4.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'The NFL Scouting Combine', TRUE)`,
        [q4_9.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'The Rookie Showcase', FALSE)`,
        [q4_9.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Draft Camp', FALSE)`,
        [q4_9.rows[0].id]
      );
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, 'Pro Day Finals', FALSE)`,
        [q4_9.rows[0].id]
      );
    }

    await client.query('COMMIT');
    const { rows } = await client.query('SELECT COUNT(*)::int AS quizzes FROM quizzes');
    const q = await client.query('SELECT COUNT(*)::int AS questions FROM questions');
    console.log(`Seeded ${rows[0].quizzes} quizzes and ${q.rows[0].questions} questions.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
