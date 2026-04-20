// JSON War — GameShell: routing + root render
;(() => {

function GameShell() {
  const { state } = useGame();
  const { screen, showVictory, level, replayNonce } = state;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0818', color: '#f5efe0' }}>
      {screen === 'opening' && <OpeningCrawl />}
      {screen === 'boss-intro' && <BossIntro />}
      {screen === 'battle' && (
        <>
          <BattleScene key={`${level}-${replayNonce || 0}`} />
          {showVictory && <VictoryModal />}
        </>
      )}
      {screen === 'settlement' && <SettlementPage />}
      {screen === 'deepdive' && <DeepDive />}
    </div>
  );
}

// Root render
const rootEl = document.getElementById('root');
const root = ReactDOM.createRoot(rootEl);
root.render(
  React.createElement(GameProvider, null,
    React.createElement(GameShell, null)
  )
);
})();
