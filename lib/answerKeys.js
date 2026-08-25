// ============================================================================
// lib/answerKeys.js
// ============================================================================
// *** SINGLE SOURCE OF TRUTH FOR ALL CORRECT ANSWERS AND QUESTION CONTENT ***
// ============================================================================

export const TOTAL_ROUNDS = 4;

export const ROUND_TITLES = {
  1: "Guess the Song",
  2: "Pookalam Pattern Match",
  3: "Onasadya Sequencing",
  4: "Mahabali Riddles",
};

// ---------------------------------------------------------------------------
// ROUND 1 — Guess the Song (All 5 questions are now songs using a shared video)
// ---------------------------------------------------------------------------
export const ROUND1 = {
  questions: [
    {
      type: "song",
      prompt: "Guess the song",
      options: ["Jimmiki Kammal", "Pistah", "Onappatin Thalam", "Mangalangal"],
      answer: 0,
      bgVideo: "/media/round1/common-bg.mp4", // Shared background video
      audio: "/media/round1/song1-full.mp3",
      teaserStart: 30,
      teaserEnd: 35,
      rewardStart: 30,
      rewardEnd: 45,
      wrongAudio: "/media/round1/error.mp3",
    },
    {
      type: "song",
      prompt: "Guess the song",
      options: ["Onakampany", "Aranne Aranne", "Onam rap", "Rockaankuthu"],
      answer: 0,
      bgVideo: "/media/round1/common-bg.mp4", // Shared background video
      audio: "/media/round1/song2-full.mp3",
      teaserStart: 15,
      teaserEnd: 20,
      rewardStart: 15,
      rewardEnd: 30,
      wrongAudio: "/media/round1/error.mp3",
    },
    {
      type: "song",
      prompt: "Guess the song",
      options: ["Aarppo", "Paapam", "Onam Mood", "Onappattin thalam"],
      answer: 3,
      bgVideo: "/media/round1/common-bg.mp4", // Shared background video
      audio: "/media/round1/song3-full.mp3",
      teaserStart: 45,
      teaserEnd: 50,
      rewardStart: 45,
      rewardEnd: 60,
      wrongAudio: "/media/round1/error.mp3",
    },
    {
      type: "song",
      prompt: "Guess the song",
      options: ["Thiruvonappularitham", "Kuttanadan Punjayile", "Engane Njan", "Thiruvavani Raav"],
      answer: 3,
      bgVideo: "/media/round1/common-bg.mp4", // Shared background video
      audio: "/media/round1/song4-full.mp3",
      teaserStart: 10,
      teaserEnd: 15,
      rewardStart: 10,
      rewardEnd: 25,
      wrongAudio: "/media/round1/error.mp3",
    },
    {
      type: "song",
      prompt: "Guess the song",
      options: ["Podipaarana", "Onavillin", "Poovili Ponnonam", "Oru Vachi Paatu"],
      answer: 1,
      bgVideo: "/media/round1/common-bg.mp4", // Shared background video
      audio: "/media/round1/song5-full.mp3",
      teaserStart: 20,
      teaserEnd: 25,
      rewardStart: 20,
      rewardEnd: 35,
      wrongAudio: "/media/round1/error.mp3",
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
  dishes: [
    { name: "Thoran", icon: "/media/dishes/dish1.png", dialogue: "/media/dishes/dish1.mp3" },
    { name: "Olan", icon: "/media/dishes/dish2.png", dialogue: "/media/dishes/dish2.mp3" },
    { name: "Kalan", icon: "/media/dishes/dish3.png", dialogue: "/media/dishes/dish3.mp3" },
    { name: "Avial", icon: "/media/dishes/dish4.png", dialogue: "/media/dishes/dish4.mp3" },
    { name: "Erishery", icon: "/media/dishes/dish5.png", dialogue: "/media/dishes/dish5.mp3" },
    { name: "Choru", icon: "/media/dishes/dish6.png", dialogue: "/media/dishes/dish6.mp3" },
    { name: "Sambar", icon: "/media/dishes/dish7.png", dialogue: "/media/dishes/dish7.mp3" },
    { name: "Payasam", icon: "/media/dishes/dish8.png", dialogue: "/media/dishes/dish8.mp3" },
  ],
  leafImage: "/media/dishes/leaf.png",
  correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
};

// ---------------------------------------------------------------------------
// ROUND 4 — Mahabali's Onam Challenge
// ---------------------------------------------------------------------------
export const ROUND4 = {
  riddles: [
    {
      prompt:
        "In a strictly traditional Onasadya, where on the plantain leaf are the crispy items like Upperi (banana chips) and Pappadam traditionally placed?",
      options: ["Bottom Right", "Bottom Left", "Top Left", "Center"],
      answer: 1,
      explanation:
        "In the customary Sadya serving sequence, the salty and crispy items like pappadam and upperi are placed on the top left of the leaf.",
    },
    {
      prompt:
        "Onam is celebrated in the Malayalam month of Chingam. On which specific Nakshatra (lunar mansion) does the main Thiruvonam festival culminate?",
      options: ["Rohini", "Vishaka", "Shravana", "Ayilyam"],
      answer: 2,
      explanation:
        "Thiruvonam corresponds to the Shravana nakshatra in Vedic astrology, which is associated with Lord Vishnu.",
    },
    {
      prompt:
        "Which traditional Onam celebration features performers dressed and painted like tigers dancing to the rhythm of drums?",
      options: ["Thiruvathira", "Pulikali", "Kummattikali", "Kaikottikali"],
      answer: 1,
      explanation:
        "Pulikali, meaning tiger play, is a colourful folk performance associated with Onam celebrations.",
    },
    {
      prompt:
        "I am a flower essential to the grand carpet, but tradition dictates I must never be used on the first day (Atham), only joining the design from Chodi onwards. Which flower am I?",
      options: ["Thumba", "Mukkutti", "Chemparathi ", "Jamanthi"],
      answer: 2,
      explanation:
        "The red hibiscus is traditionally excluded on the very first day of making the Pookalam.",
    },
    {
      prompt:
        "I am the specific day of the ten-day festival when the iconic snake boat race (Vallamkali) takes place on the Pampa River at Aranmula. Which day am I?",
      options: ["Atham", "Uthradam", "Thiruvonam", " Avittom"],
      answer: 3,
      explanation:
        "The historic Aranmula Uthruttathi Boat Race occurs on the Uthruttathi asterism, closely following the main Thiruvonam day, corresponding here to the post-Thiruvonam festivities like Avittom.",
    },
    {
      prompt:
        "Which day is traditionally considered the most important day of the ten-day Onam celebrations?",
      options: ["Atham", "Chithira", "Thiruvonam", "Avittam"],
      answer: 2,
      explanation:
        "Thiruvonam is traditionally regarded as the most important day of the Onam celebrations.",
    },
    {
      prompt:
        "What is the small clay figure traditionally associated with Mahabali and placed as part of some Onam decorations?",
      options: ["Onathappan", "Kuttichathan", "Guruvayoorappan", "Ayyappan"],
      answer: 0,
      explanation:
        "Onathappan is a traditional clay representation associated with Onam decorations in some parts of Kerala.",
    },
    {
      prompt:
        "Which sweet preparation made from banana is commonly included in a traditional Sadya?",
      options: ["Sharkara Varatti", "Unniyappam", "Modakam", "Achappam"],
      answer: 0,
      explanation:
        "Sharkara Varatti is a sweet banana preparation traditionally served as part of Sadya.",
    },
    {
      prompt:
        "King Mahabali was the grandson of which famous devotee of Lord Vishnu?",
      options: ["Arjuna", "Dhruva", "Prahlada", "Yudhishthira"],
      answer: 2,
      explanation:
        "According to Hindu tradition, Mahabali was the grandson of Prahlada, a renowned devotee of Lord Vishnu.",
    },
    {
      prompt:
        "The famous Athachamayam procession is historically associated with the royal family of which kingdom?",
      options: [
        "Kingdom of Cochin",
        "Travancore Kingdom",
        "Zamorin of Calicut",
        "Kolathiri Kingdom",
      ],
      answer: 0,
      explanation:
        "Athachamayam is historically associated with the royal traditions of the Kingdom of Cochin and the royal procession from Tripunithura.",
    },
  ],
};
