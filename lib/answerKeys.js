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
  // Shared ambient background video for the whole round.
  // Put a royalty-free festive loop here — NOT copyrighted movie footage.
  backgroundVideo: "/media/round1-bg.mp4",

  // PLACEHOLDER: replace with real song/movie questions.
  // Each entry:
  //   prompt   : question text shown to the player (public)
  //   options  : multiple-choice options shown to the player (public)
  //   answer   : index into `options` of the single correct option (SECRET,
  //              used only server-side in app/api/submit-answer/route.js)
  //   clipSrc  : short audio clip played while the player is guessing (public)
  //   fullSrc  : longer clip played for ~10s after a correct answer (public)
  questions: [
    {
      prompt: "PLACEHOLDER Q1 — Which movie is this song from?",
      options: ["Movie A", "Movie B", "Movie C", "Movie D"],
      answer: 0,
      clipSrc: "/media/q1-clip.mp3",
      fullSrc: "/media/q1-full.mp3",
    },
    {
      prompt: "PLACEHOLDER Q2 — Name the song/movie pair",
      options: [
        "Song A / Movie A",
        "Song B / Movie B",
        "Song C / Movie C",
        "Song D / Movie D",
      ],
      answer: 2,
      clipSrc: "/media/q2-clip.mp3",
      fullSrc: "/media/q2-full.mp3",
    },
    {
      prompt: "PLACEHOLDER Q3",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      answer: 1,
      clipSrc: "/media/q3-clip.mp3",
      fullSrc: "/media/q3-full.mp3",
    },
    {
      prompt: "PLACEHOLDER Q4",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      answer: 3,
      clipSrc: "/media/q4-clip.mp3",
      fullSrc: "/media/q4-full.mp3",
    },
    {
      prompt: "PLACEHOLDER Q5",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      answer: 1,
      clipSrc: "/media/q5-clip.mp3",
      fullSrc: "/media/q5-full.mp3",
    },
  ],
};

// ---------------------------------------------------------------------------
// ROUND 2 — Athapookalam Pattern Match
// ---------------------------------------------------------------------------
export const ROUND2 = {
  imageSrc: "/media/pookalam.jpg",

  gridSize: 5,

  revealSeconds: 5,

  correctOrder: Array.from({ length: 25 }, (_, i) => i),
};
// ---------------------------------------------------------------------------
// ROUND 3 — Onasadya Sequencing
// ---------------------------------------------------------------------------
export const ROUND3 = {
  // PLACEHOLDER dish data — swap for your real dishes.
  // icon: image shown as the draggable piece (public)
  // dialogue: movie dialogue clip played when the piece is dropped on the leaf (public)
  dishes: [
    {
      name: "Dish One",
      icon: "/media/dishes/dish1.png",
      dialogue: "/media/dishes/dish1.mp3",
    },
    {
      name: "Dish Two",
      icon: "/media/dishes/dish2.png",
      dialogue: "/media/dishes/dish2.mp3",
    },
    {
      name: "Dish Three",
      icon: "/media/dishes/dish3.png",
      dialogue: "/media/dishes/dish3.mp3",
    },
    {
      name: "Dish Four",
      icon: "/media/dishes/dish4.png",
      dialogue: "/media/dishes/dish4.mp3",
    },
    {
      name: "Dish Five",
      icon: "/media/dishes/dish5.png",
      dialogue: "/media/dishes/dish5.mp3",
    },
    {
      name: "Dish Six",
      icon: "/media/dishes/dish6.png",
      dialogue: "/media/dishes/dish6.mp3",
    },
    {
      name: "Dish Seven",
      icon: "/media/dishes/dish7.png",
      dialogue: "/media/dishes/dish7.mp3",
    },
    {
      name: "Dish Eight",
      icon: "/media/dishes/dish8.png",
      dialogue: "/media/dishes/dish8.mp3",
    },
  ],

  // Shared banana leaf background image.
  leafImage: "/media/dishes/leaf.png",

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
