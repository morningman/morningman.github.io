// JSON War — GameShell: routing + root render
;(() => {

function GameShell() {
  const { state } = useGame();
  const { screen, battlePhase } = state;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0818', color: '#f5efe0' }}>
      {screen === 'opening' && <OpeningCrawl />}
      {screen === 'boss-intro' && <BossIntro />}
      {screen === 'battle' && (
        <>
          <BattleScene />
          {battlePhase === 'victory' && <VictoryModal />}
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
