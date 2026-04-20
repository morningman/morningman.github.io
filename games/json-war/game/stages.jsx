// JSON War — Opening Crawl + Boss Intro screens
;(() => {
const { useState, useEffect, useRef } = React;

// ── Opening Crawl ─────────────────────────────────────────────────────────────
function OpeningCrawl() {
  const { dispatch } = useGame();
  const [introOpacity, setIntroOpacity] = useState(0);
  const [btnOpacity, setBtnOpacity] = useState(0);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setIntroOpacity(1), 200);
    const t2 = setTimeout(() => setBtnOpacity(1), 200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleStart = () => {
    if (starting || btnOpacity < 1) return;
    setStarting(true);
    dispatch({ type: 'START_GAME' });
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', position: 'relative', zIndex: 10,
      fontFamily: 'Fredoka, sans-serif',
    }}>
      <Starfield />

      {/* Scanline overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)',
      }}/>

      {/* Intro content */}
      <div style={{
        position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 420,
        opacity: introOpacity, transition: 'opacity 0.5s ease',
        visibility: introOpacity === 0 ? 'hidden' : 'visible',
      }}>
        {/* Alert line */}
        <div style={{
          color: '#e86040', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em',
          textTransform: 'uppercase', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <span>△</span> DATA ANOMALY DETECTED <span>△</span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'Fredoka, sans-serif', fontWeight: 700,
          fontSize: 'clamp(56px, 14vw, 80px)', lineHeight: 1,
          color: '#ecd050', textShadow: '5px 5px 0 #1a1408',
          margin: '0 0 28px',
          letterSpacing: '-0.02em',
        }}>JSON WAR</h1>

        {/* Tagline */}
        <p style={{
          fontFamily: 'Fredoka, sans-serif', fontWeight: 700,
          fontSize: 'clamp(18px, 5vw, 24px)', lineHeight: 1.25,
          color: '#ecd050', marginBottom: 32,
          letterSpacing: '0.02em', textTransform: 'uppercase',
          textShadow: '2px 2px 0 #1a1408',
        }}>
          A Massive Surge of <span style={{ color: '#e86040' }}>Malformed JSON</span><br/>
          Has Overrun the Data Center
        </p>

        {/* Threat list */}
        <div style={{ marginBottom: 36 }}>
          <div style={{
            color: '#e86040', fontFamily: 'Fredoka, sans-serif', fontWeight: 700,
            fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase',
            marginBottom: 14, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
          }}>
            <span>▸</span> 5 Critical Challenges <span>◂</span>
          </div>
          {['Column Explosion','Sparse Columns','Schema Controllability','Schema & Type Evolution','Indexing'].map(item => (
            <div key={item} style={{
              color: '#ecd050', fontWeight: 600, fontSize: 11,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              marginBottom: 6, opacity: 0.85,
            }}>{item}</div>
          ))}
        </div>

        {/* Mission copy */}
        <p style={{
          fontFamily: 'Nunito, sans-serif', fontWeight: 800,
          fontSize: 'clamp(18px, 4.5vw, 22px)', color: '#ffffff', lineHeight: 1.5,
        }}>
          Your mission:<br/>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>ENGAGE AND RESTORE ORDER.</span>
        </p>
      </div>

      {/* Start button */}
      <div style={{
        position: 'relative', zIndex: 10, marginTop: 48,
        opacity: btnOpacity, transition: 'opacity 0.5s ease',
        visibility: btnOpacity === 0 ? 'hidden' : 'visible',
      }}>
        <CartoonBtn
          onClick={handleStart}
          disabled={starting || btnOpacity < 1}
          color="#e86040"
          size="lg"
          style={{
            fontSize: 18, paddingLeft: 40, paddingRight: 40,
            animation: btnOpacity >= 1 && !starting ? 'ctaAttention 1.5s ease-in-out infinite' : 'none',
          }}>
          🚀 START MISSION
        </CartoonBtn>
      </div>
    </div>
  );
}

// ── Boss Intro Screen ─────────────────────────────────────────────────────────
function BossIntro() {
  const { state, dispatch } = useGame();
  const lvl = LEVELS[state.level - 1];
  const [nameTyped, setNameTyped] = useState('');
  const [showTap, setShowTap] = useState(false);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    setNameTyped('');
    setShowTap(false);
    setOpacity(0);
    setTimeout(() => setOpacity(1), 100);

    const name = `"${lvl.bossName.toUpperCase()}"`;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setNameTyped(name.slice(0, i));
      if (i >= name.length) {
        clearInterval(iv);
        setTimeout(() => setShowTap(true), 500);
      }
    }, 50);
    return () => clearInterval(iv);
  }, [state.level]);

  const proceed = () => dispatch({ type: 'ENTER_BATTLE' });

  const BOSS_MAP = {
    giant: window.BossGiant,
    inflation: window.BossInflation,
    phantom: window.BossPhantom,
    shapeshifter: window.BossShapeshifter,
    legion: window.BossLegion,
  };
  const BossComp = BOSS_MAP[lvl.bossType];
  const defaultProps = {
    hp: lvl.maxHp, maxHp: lvl.maxHp,
    shaking: false, flash: false,
    visible: lvl.bossType !== 'phantom',
    inflation: 0, form: 0,
    unitHps: Array(9).fill(11),
  };

  return (
    <div onClick={showTap ? proceed : undefined} style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 24,
      padding: 32, position: 'relative', zIndex: 10,
      opacity, transition: 'opacity 0.4s ease',
      cursor: showTap ? 'pointer' : 'default',
    }}>
      <Starfield />

      {/* Level badge */}
      <div style={{
        position: 'relative', zIndex: 10,
        background: '#1a2535', border: '2px solid #64c8b4',
        borderRadius: 999, padding: '4px 16px',
        fontFamily: 'Fredoka, sans-serif', fontWeight: 700,
        fontSize: 13, color: '#64c8b4', letterSpacing: '0.15em',
      }}>
        BOSS {state.level} / 5
      </div>

      {/* Boss silhouette — dramatic top light */}
      <div style={{
        position: 'relative', zIndex: 10,
        filter: 'drop-shadow(0 20px 40px rgba(232,96,64,0.4))',
        animation: 'bossFloat 3s ease-in-out infinite',
      }}>
        <BossComp {...defaultProps} />
      </div>

      {/* Boss name — typewriter */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        <h2 style={{
          fontFamily: 'Fredoka, sans-serif', fontWeight: 700,
          fontSize: 'clamp(32px, 8vw, 48px)',
          color: '#ecd050', textShadow: '4px 4px 0 #1a1408',
          letterSpacing: '0.05em', minHeight: '1.2em',
          margin: 0,
        }}>
          {nameTyped}<span style={{ opacity: 0.5, animation: 'blink 0.8s infinite' }}>|</span>
        </h2>
        {nameTyped === `"${lvl.bossName.toUpperCase()}"` && (
          <p style={{
            fontFamily: 'Nunito, sans-serif', fontWeight: 600,
            fontSize: 18, color: '#ecd050', opacity: 0.6,
            fontStyle: 'italic', marginTop: 8,
          }}>
            "{lvl.flavorText}"
          </p>
        )}
      </div>

      {/* Tap to continue */}
      <div style={{
        position: 'relative', zIndex: 10,
        opacity: showTap ? 1 : 0, transition: 'opacity 0.5s ease',
        fontFamily: 'Fredoka, sans-serif', fontWeight: 700,
        fontSize: 14, color: '#ffffff', letterSpacing: '0.2em',
        textTransform: 'uppercase',
        animation: showTap ? 'ctaAttention 1.5s ease-in-out infinite' : 'none',
      }}>
        TAP TO ENGAGE
      </div>
    </div>
  );
}

Object.assign(window, { OpeningCrawl, BossIntro });
})();
