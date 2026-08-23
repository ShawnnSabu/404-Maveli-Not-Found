// ============================================================================
// lib/answerKeys.js
// ============================================================================
// *** SINGLE SOURCE OF TRUTH FOR ALL CORRECT ANSWERS AND QUESTION CONTENT ***
//
// EVERY correct answer / target pattern / correct ordering in this game lives
// in THIS file and nowhere else. Route handlers import from here; round pages
// (server components) import ONLY the public "question" fields below and pass
// them as props — answer values themselves are never serialized to the client.
//
// All values currently in this file are PLACEHOLDERS. Search for
// "PLACEHOLDER" comments and replace them with real content.
// ============================================================================

export const TOTAL_ROUNDS = 4;

export const ROUND_TITLES = {
  1: "Guess the Song and Movie",
  2: "Pookalam Pattern Match",
  3: "Onasadya Sequencing",
  4: "Mahabali Riddles",
};

// ---------------------------------------------------------------------------
// ROUND 1 — Guess the Song and Movie
// ---------------------------------------------------------------------------
export const ROUND1 = {
  // PLACEHOLDER: replace with real song/movie questions.
  // Each entry:
  //   prompt : question text shown to the player (public)
  //   options: multiple-choice options shown to the player (public)
  //   answer : index into `options` of the single correct option (SECRET,
  //            used only server-side in app/api/submit-answer/route.js)
  questions: [
    {
      prompt: "PLACEHOLDER Q1 — Which movie is this song from?",
      options: ["Movie A", "Movie B", "Movie C", "Movie D"],
      answer: 0,
    },
    {
      prompt: "PLACEHOLDER Q2 — Name the song/movie pair",
      options: ["Song A / Movie A", "Song B / Movie B", "Song C / Movie C", "Song D / Movie D"],
      answer: 2,
    },
    {
      prompt: "PLACEHOLDER Q3",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      answer: 1,
    },
    {
      prompt: "PLACEHOLDER Q4",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      answer: 3,
    },
    {
      prompt: "PLACEHOLDER Q5",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      answer: 1,
    },
  ],
};

// ---------------------------------------------------------------------------
// ROUND 2 — Pookalam Pattern Match
// ---------------------------------------------------------------------------
export const ROUND2 = {
  gridSize: 5, // 5x5 grid

  // Palette players cycle through when clicking tiles (public).
  palette: ["#f87171", "#fbbf24", "#34d399", "#60a5fa", "#c084fc"],

  // Empty-tile color before any click.
  emptyColor: "#e5e7eb",

  // Seconds the target pattern is displayed before being hidden.
  revealSeconds: 8,

  // PLACEHOLDER: replace with your real pookalam pattern.
  // It is a gridSize x gridSize array of palette INDEXES (0-based).
  // This is compared server-side against the submitted final grid.
  targetPattern: [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 1, 4, 1, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
  ],
};

// ---------------------------------------------------------------------------
// ROUND 3 — Onasadya Sequencing
// ---------------------------------------------------------------------------
export const ROUND3 = {
  // PLACEHOLDER dish names — swap for your real dishes.
  dishes: [
    "Dish One",
    "Dish Two",
    "Dish Three",
    "Dish Four",
    "Dish Five",
    "Dish Six",
    "Dish Seven",
    "Dish Eight",
  ],

  // !!! NEEDS YOUR REAL INPUT !!!
  // PLACEHOLDER correct serving order, expressed as indexes into `dishes`
  // above. This is NOT a real Onasadya order — it is obviously fake on
  // purpose. Replace with the real serving order.
  correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
};

// ---------------------------------------------------------------------------
// ROUND 4 — Mahabali Riddles
// ---------------------------------------------------------------------------
export const ROUND4 = {
  // PLACEHOLDER riddles — swap text and answers for real ones.
  // Answers are lowercase-compared (trimmed) server-side.
  riddles: [
    {
      prompt: "PLACEHOLDER RIDDLE 1 — text goes here?",
      answer: "riddle one answer",
    },
    {
      prompt: "PLACEHOLDER RIDDLE 2 — text goes here?",
      answer: "riddle two answer",
    },
  ],
};
