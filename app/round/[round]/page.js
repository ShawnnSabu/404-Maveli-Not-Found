import { notFound } from "next/navigation";
import RoundShell from "@/components/rounds/RoundShell";
import Round1 from "@/components/rounds/Round1";
import Round2 from "@/components/rounds/Round2";
import Round3 from "@/components/rounds/Round3";
import Round4 from "@/components/rounds/Round4";
import {
  ROUND_TITLES,
  ROUND1,
  ROUND2,
  ROUND3,
  ROUND4,
  TOTAL_ROUNDS,
} from "@/lib/answerKeys";

// Server component: reads lib/answerKeys.js and forwards ONLY the public
// fields (prompts, options, palette, dish names, riddle text). Correct
// answers / target pattern / correct order are never passed here.
export default async function RoundPage({ params }) {
  const { round } = await params;
  const roundNumber = Number(round);

  if (
    !Number.isInteger(roundNumber) ||
    roundNumber < 1 ||
    roundNumber > TOTAL_ROUNDS
  ) {
    notFound();
  }

  let content = null;

  if (roundNumber === 1) {
    content = (
      <Round1
        backgroundVideo={ROUND1.backgroundVideo}
        questions={ROUND1.questions.map(({ prompt, options, clipSrc, fullSrc }) => ({
          prompt,
          options,
          clipSrc,
          fullSrc,
        }))}
      />
    );
  } else if (roundNumber === 2) {
    // The target pattern is required client-side only for the timed reveal;
    // correctness is always judged server-side in /api/submit-answer.
    content = (
      <Round2
        gridSize={ROUND2.gridSize}
        palette={ROUND2.palette}
        emptyColor={ROUND2.emptyColor}
        revealSeconds={ROUND2.revealSeconds}
        targetPattern={ROUND2.targetPattern}
      />
    );
  } else if (roundNumber === 3) {
    content = <Round3 dishes={ROUND3.dishes} leafImage={ROUND3.leafImage} />;
  } else if (roundNumber === 4) {
    content = (
      <Round4 riddles={ROUND4.riddles.map(({ prompt }) => ({ prompt }))} />
    );
  }

  return (
    <RoundShell round={roundNumber}>
      <p className="mt-6 text-center text-sm font-semibold tracking-wide text-stone-400 uppercase">
        Round {roundNumber} · {ROUND_TITLES[roundNumber]}
      </p>
      <div className="mt-6 flex flex-1 flex-col items-center">{content}</div>
    </RoundShell>
  );
}