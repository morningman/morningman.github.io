// game/shell.jsx — GameShell: orchestrates all stages + summaries

const STAGE_ORDER = ['intro','level1','level2','level3','finish','deepdive'];
const stageIdx = s => STAGE_ORDER.indexOf(s);

function GameShell() {
  const { state } = useGame();
  const { goToStage } = useGameActions();

  // On first load, scroll to current stage after hydration
  React.useEffect(() => {
    const id = `stage-${state.stage}`;
    const t = setTimeout(() => scrollToStage(id), 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const curIdx = stageIdx(state.stage);
  const showFull    = name => state.stage === name;
  const showSummary = name => curIdx > stageIdx(name) && name !== 'finish' && name !== 'deepdive';

  function editStage(target) {
    goToStage(target);
    setTimeout(() => scrollToStage(`stage-${target}`), 60);
  }

  function summarizeL1() {
    const parts = [
      state.city    ? `City: ${state.city}`                        : null,
      state.checkIn ? `Check-in: ${state.checkIn}`                 : null,
      state.budget  ? `Budget: ${BUDGET_MAP[state.budget].label}`  : null,
    ].filter(Boolean);
    return parts.length ? `${parts.join(' · ')} · 10 shortlisted stays` : 'No selections.';
  }

  return (
    <main className="relative min-h-[100svh] w-full pt-12 sm:pt-0">
      <MatchConfidenceMobile />
      <MatchConfidence />

      {/* Intro */}
      {showFull('intro') && <Intro />}

      {/* Level 1 */}
      {showFull('level1') && <Level1 />}
      {showSummary('level1') && (
        <div className="mx-auto w-full max-w-xl px-5 pt-6">
          <StageSummary
            title="Task 01 · Structured Filter"
            checkpoint="Good Options"
            summary={summarizeL1()}
            onEdit={() => editStage('level1')}
          />
        </div>
      )}

      {/* Level 2 */}
      {showFull('level2') && <Level2 />}
      {showSummary('level2') && (
        <div className="mx-auto w-full max-w-xl px-5 pt-3">
          <StageSummary
            title="Task 02 · Parallel Recall"
            summary="Text Top 3 and Semantic Top 3 ran on the same candidate view."
            onEdit={() => editStage('level2')}
          />
        </div>
      )}

      {/* Level 3 */}
      {showFull('level3') && <Level3 />}
      {showSummary('level3') && (
        <div className="mx-auto w-full max-w-xl px-5 pt-3">
          <StageSummary
            title="Task 03 · RRF Fusion"
            checkpoint="Best Match Found"
            summary="RRF fused the two ranked lists into the final Top 3."
          />
        </div>
      )}

      {/* Finish */}
      {state.stage === 'finish' && state.hasWon && <Finish />}

      {/* Deep Dive */}
      {state.stage === 'deepdive' && <DeepDive />}

      <footer className="mx-auto w-full max-w-xl px-5 pb-16 pt-10 text-center">
        <span className="cartoon-chip cartoon-chip-primary !text-[10px]">Apache Doris · Hybrid Search Demo</span>
      </footer>
    </main>
  );
}

window.GameShell = GameShell;
