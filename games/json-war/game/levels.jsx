// JSON War — Battle Scene: 3-volley system, ship stays in place, per-level effects
;(() => {
const { useState, useEffect, useRef } = React;

const BOSS_MAP = {
  giant:        () => window.BossGiant,
  inflation:    () => window.BossInflation,
  phantom:      () => window.BossPhantom,
  shapeshifter: () => window.BossShapeshifter,
  legion:       () => window.BossLegion,
};

function BattleScene() {
  const { state, dispatch } = useGame();
  const lvl = LEVELS[state.level - 1];
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);
  const safe = fn => { if (mounted.current) fn(); };

  // ── Core state ──────────────────────────────────────────────────────────────
  const [phase, setPhase]         = useState('idle');
  const [bossHp, setBossHp]       = useState(lvl.maxHp);
  const [unitHps, setUnitHps]     = useState(Array(9).fill(11));
  const [hasUpgrade, setHasUpgrade] = useState(false);

  // ── Visual effect state ─────────────────────────────────────────────────────
  const [bullets, setBullets]         = useState([]);
  const [missile, setMissile]         = useState(false);
  const [aoeWave, setAoeWave]         = useState(false);
  const [bossShaking, setBossShaking] = useState(false);
  const [bossFlash, setBossFlash]     = useState(false);
  const [dmg, setDmg]                 = useState(null);
  const [dmgKey, setDmgKey]           = useState(0);
  const [exploding, setExploding]     = useState(false);
  const [bossForm, setBossForm]       = useState(0);
  const [bossOpacity, setBossOpacity] = useState(lvl.bossType === 'phantom' ? 0.28 : 1);
  const [inflation, setInflation]     = useState(0);

  // Per-level overlay effects
  const [shipHit, setShipHit]       = useState(false); // player hit flash
  const [floatText, setFloatText]   = useState(null); // {text, color, key}
  const [shieldKey, setShieldKey]   = useState(0);
  const [showShield, setShowShield] = useState(false);
  const [bossLocked, setBossLocked] = useState(false);
  const [lockAnim, setLockAnim]     = useState(false);
  const [showTarget, setShowTarget] = useState(false);

  // Derived
  const shipForm = Math.min(5, (state.level - 1) + (hasUpgrade ? 1 : 0));
  const inHangar = phase === 'hangar' || phase === 'upgrading' || phase === 'upgraded';

  // ── Reset on level change ───────────────────────────────────────────────────
  useEffect(() => {
    const l = LEVELS[state.level - 1];
    setBossHp(l.maxHp); setUnitHps(Array(9).fill(11));
    setPhase('idle'); setBullets([]); setMissile(false);
    setAoeWave(false); setBossShaking(false); setBossFlash(false);
    setExploding(false); setBossForm(0); setHasUpgrade(false);
    setBossOpacity(l.bossType === 'phantom' ? 0.28 : 1);
    setInflation(0); setBossLocked(false); setLockAnim(false);
    setShowTarget(false); setShowShield(false); setFloatText(null); setShipHit(false);
  }, [state.level]);

  // Phantom flicker (pre-upgrade only)
  useEffect(() => {
    if (lvl.bossType !== 'phantom' || hasUpgrade || phase === 'done') return;
    const iv = setInterval(() => safe(() => setBossOpacity(o => o > 0.5 ? 0.28 : 1)), 1700);
    return () => clearInterval(iv);
  }, [lvl.bossType, hasUpgrade, phase]);

  // Shapeshifter form cycle (pre-upgrade only)
  useEffect(() => {
    if (lvl.bossType !== 'shapeshifter' || hasUpgrade || phase === 'done') return;
    const iv = setInterval(() => safe(() => setBossForm(f => (f+1)%3)), 2000);
    return () => clearInterval(iv);
  }, [lvl.bossType, hasUpgrade, phase]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function triggerHit(damage) {
    safe(() => {
      setBossShaking(true); setBossFlash(true);
      setDmg(damage); setDmgKey(k => k+1);
      setBossHp(h => Math.max(0, h - damage));
    });
    setTimeout(() => safe(() => { setBossShaking(false); setBossFlash(false); }), 200);
  }

  function fireBullets(count, upgraded, miss = false, blocked = false) {
    for (let i = 0; i < count; i++) {
      const id = `${Date.now()}-${i}`;
      setTimeout(() => {
        safe(() => setBullets(b => [...b, { id, upgraded, miss, blocked }]));
        const lifetime = blocked ? 520 : miss ? 650 : 480;
        setTimeout(() => safe(() => setBullets(b => b.filter(x => x.id !== id))), lifetime);
      }, i * 85);
    }
  }

  function showFloat(text, color) {
    safe(() => setFloatText({ text, color, key: Date.now() }));
    setTimeout(() => safe(() => setFloatText(null)), 750);
  }

  function destroyOneUnit() {
    safe(() => {
      setUnitHps(u => {
        const n = [...u];
        const idx = n.findIndex(h => h > 0);
        if (idx >= 0) n[idx] = 0;
        return n;
      });
      setBossHp(h => Math.max(0, h - 5));
      setBossShaking(true); setBossFlash(true);
      setDmg(5); setDmgKey(k => k+1);
    });
    setTimeout(() => safe(() => { setBossShaking(false); setBossFlash(false); }), 200);
  }

  // ── Sequence runner ─────────────────────────────────────────────────────────
  // steps = [[delay_ms, fn], ...]  — delays are incremental
  function runSeq(steps) {
    let t = 0;
    steps.forEach(([dt, fn]) => {
      t += dt;
      setTimeout(() => safe(fn), t);
    });
  }

  // ── Pre-upgrade volley effect (level-specific) ──────────────────────────────
  // Returns true if this volley is a miss (flies past boss)
  function isMissVolley(volleyIndex) {
    return lvl.bossType === 'phantom' && volleyIndex < 2;
  }
  // Returns true if this volley is blocked by a shield (stops at shield)
  function isBlockedVolley(volleyIndex) {
    return lvl.bossType === 'shapeshifter' && volleyIndex < 2;
  }

  function preVolleyEffect(volleyIndex) {
    switch (lvl.bossType) {
      case 'giant':
        triggerHit(1);
        showFloat('TOO BIG TO PARSE!', '#ecd050');
        break;
      case 'inflation':
        setInflation(i => Math.min(3, i+1));
        showFloat('MORE COLUMNS!', '#ecd050');
        break;
      case 'phantom':
        if (volleyIndex === 2) { triggerHit(1); showFloat('HIT!', '#ecd050'); }
        else { showFloat('MISS — NO INDEX', '#64c8b4'); }
        break;
      case 'shapeshifter':
        setBossForm(f => (f+1)%3);
        if (volleyIndex === 2) { triggerHit(1); showFloat('HIT!', '#ecd050'); }
        else {
          setShowShield(true); setShieldKey(k => k+1);
          showFloat('BLOCKED — TYPE MISMATCH', '#e86040');
          setTimeout(() => safe(() => setShowShield(false)), 620);
        }
        break;
      case 'legion':
        destroyOneUnit();
        showFloat('HIT — ONLY ONE', '#ecd050');
        break;
    }
  }

  // ── Post-upgrade volley effect ──────────────────────────────────────────────
  function postVolleyEffect() {
    triggerHit(lvl.upgradedDamagePerVolley);
    showFloat(lvl.upgradedHitLabel || 'HIT!', '#ecd050');
    if (lvl.bossType === 'inflation' && bossLocked) {
      setLockAnim(true);
      setTimeout(() => safe(() => setLockAnim(false)), 500);
    }
  }

  // ── STEP 1: Normal attack (3 volleys → boss retaliates → hangar) ────────────
  function handleAttack() {
    if (phase !== 'idle') return;
    setPhase('normal-attacking');
    const bulletCount = lvl.bossType === 'giant' ? 1 : 3;

    const doVolley = (vi, delay) => [
      [delay, () => fireBullets(bulletCount, false, isMissVolley(vi), isBlockedVolley(vi))],
      [420,   () => preVolleyEffect(vi)],
    ];

    runSeq([
      ...doVolley(0, 100),
      ...doVolley(1, 540),
      ...doVolley(2, 540),
      // Boss retaliates
      [400,  () => setMissile(true)],
      [580,  () => { setMissile(false); setShipHit(true); }],
      [500,  () => { setShipHit(false); setPhase('hangar'); }],
    ]);
  }

  // ── STEP 2: Upgrade ──────────────────────────────────────────────────────────
  function handleUpgrade() {
    if (phase !== 'hangar') return;
    setPhase('upgrading');
    dispatch({ type: 'UPGRADE_DONE' });

    setTimeout(() => safe(() => {
      setHasUpgrade(true);
      setBossHp(lvl.maxHp);
      setUnitHps(Array(9).fill(11)); // L5: restore all 9 units
      setInflation(0);
      setBossOpacity(1);
      setBossForm(0);
      setBossLocked(lvl.bossType === 'inflation');
      setShowTarget(lvl.bossType === 'phantom');
      setPhase('upgraded');
    }), 1200);
  }

  // ── STEP 3: Final attack ─────────────────────────────────────────────────────
  function handleFinalAttack() {
    if (phase !== 'upgraded') return;
    setPhase('final-attacking');

    if (lvl.bossType === 'legion') {
      // Single AOE blast
      runSeq([
        [200,  () => setAoeWave(true)],
        [700,  () => { setAoeWave(false); setUnitHps(Array(9).fill(0)); setBossHp(0); setDmg(99); setDmgKey(k=>k+1); }],
        [300,  () => setExploding(true)],
        [1000, () => { setExploding(false); setPhase('done'); dispatch({ type:'BOSS_DEFEATED' }); }],
      ]);
    } else {
      // 3 rapid volleys × 33 HP
      runSeq([
        // Volley 1
        [100,  () => fireBullets(3, true)],
        [440,  () => postVolleyEffect()],
        // Volley 2
        [520,  () => fireBullets(3, true)],
        [440,  () => postVolleyEffect()],
        // Volley 3
        [520,  () => fireBullets(3, true)],
        [440,  () => postVolleyEffect()],
        // Boss dies
        [300,  () => setExploding(true)],
        [1000, () => { setExploding(false); setPhase('done'); dispatch({ type:'BOSS_DEFEATED' }); }],
      ]);
    }
  }

  // ── Button config ────────────────────────────────────────────────────────────
  const btnConfig = (() => {
    if (phase === 'idle')     return { text:'⚔  ATTACK', color:'#e86040', fn: handleAttack };
    if (phase === 'hangar')   return { text:'⬆  UPGRADE', color:'#64c8b4', fn: handleUpgrade, size:'md' };
    if (phase === 'upgraded') return { text:'⚡  ATTACK', color:'#e86040', fn: handleFinalAttack, size:'md' };
    return null;
  })();

  const BossComp = BOSS_MAP[lvl.bossType]();

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight:'100svh', maxWidth:430, margin:'0 auto',
      display:'flex', flexDirection:'column',
      position:'relative', overflowX:'hidden',
      fontFamily:'Fredoka,sans-serif', background:'#0a0818',
    }}>
      <Starfield />

      {/* HUD */}
      <div style={{
        position:'relative', zIndex:20, flexShrink:0,
        background:'rgba(10,8,25,0.9)', borderBottom:'2px solid #2a2040',
        padding:'9px 16px 7px',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
          <span style={{ color:'#64c8b4', fontWeight:700, fontSize:13 }}>BOSS {state.level} / 5</span>
          {hasUpgrade && <SkillChip icon={lvl.skill.icon} name={lvl.skill.name} />}
        </div>
        <BossHPBar hp={bossHp} maxHp={lvl.maxHp} bossName={lvl.bossName} />
      </div>

      {/* Boss area — shrinks when hangar panel is open so the button bar stays on screen */}
      <div style={{
        position:'relative', zIndex:10, flexShrink:0,
        height: inHangar ? '26%' : '37%',
        transition:'height 0.4s cubic-bezier(0.4,0,0.2,1)',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
      }}>
        {/* Boss SVG with effects */}
        <div style={{
          position:'relative',
          opacity: exploding ? 0 : bossOpacity,
          filter: bossFlash ? 'brightness(4)' : 'none',
          animation: bossShaking ? 'bossShake 0.15s ease-out' : 'bossFloat 3s ease-in-out infinite',
          transition:'filter 0.12s, opacity 0.4s',
        }}>
          {!exploding && BossComp && <BossComp
            hp={bossHp} maxHp={lvl.maxHp}
            shaking={false} flash={false}
            visible={bossOpacity > 0.5}
            inflation={inflation} form={bossForm}
            unitHps={unitHps}
            locked={bossLocked} lockAnim={lockAnim}
            showTarget={showTarget}
          />}

          {/* Damage number */}
          {dmg !== null && <DamagePopup damage={dmg} key={dmgKey} id={dmgKey} />}

          {/* Float label (MISS / BLOCKED / GROW) */}
          {floatText && <FloatLabel text={floatText.text} color={floatText.color} id={floatText.key} />}

          {/* Shield flash (non-shapeshifter; shapeshifter's arc shield is rendered in the bullet overlay) */}
          {showShield && lvl.bossType !== 'shapeshifter' && <ShieldFlash id={shieldKey} />}
        </div>

        {/* Explosion */}
        {exploding && <Explosion onDone={() => {}} />}

        {/* AOE shockwave — centred on boss */}
        {aoeWave && (
          <div style={{
            position:'absolute', top:'50%', left:'50%',
            transform:'translate(-50%,-50%)',
            width:32, height:32, borderRadius:'50%',
            border:'5px solid #ecd050',
            boxShadow:'0 0 28px #ecd050',
            animation:'aoeExpand 0.7s ease-out forwards',
            pointerEvents:'none', zIndex:45,
          }}/>
        )}

        {/* Boss missile */}
        {missile && (
          <div style={{ position:'absolute', bottom:-16, left:'50%', zIndex:30 }}>
            <div style={{
              width:14, height:36, background:'#e86040',
              borderRadius:'3px 3px 6px 6px',
              border:'2px solid #1a1408',
              boxShadow:'0 0 14px #e86040',
              animation:'missileDown 0.58s ease-in forwards',
              transform:'translateX(-50%)',
            }}/>
          </div>
        )}

      </div>

      {/* ── Full-height bullet overlay (crosses boss area boundary) ── */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:35, overflow:'visible' }}>
        {/* Shapeshifter arc shield — rendered here so its bottom:% aligns with bullet vh travel */}
        {showShield && lvl.bossType === 'shapeshifter' && <ArcShield id={shieldKey} />}
        {bullets.map(b => (
          <div key={b.id} style={{
            position:'absolute', left:'50%', bottom:'23%',
            width: b.upgraded ? 8 : 5,
            height: b.upgraded ? 26 : 18,
            background: b.upgraded ? '#ecd050' : '#64c8b4',
            borderRadius:4,
            boxShadow:`0 0 10px ${b.upgraded ? '#ecd050' : '#64c8b4'}`,
            animation: b.blocked
              ? 'bulletFlyBlocked 0.52s ease-out forwards'
              : b.miss
                ? 'bulletFlyMiss 0.65s ease-out forwards'
                : 'bulletFlyHit 0.5s ease-out forwards',
          }}/>
        ))}
      </div>

      {/* ── Ship hit effects ── */}
      {shipHit && <>
        {/* Red screen flash on lower half */}
        <div style={{
          position:'absolute', left:0, right:0, bottom:0, height:'55%',
          background:'rgba(232,96,64,0.25)', pointerEvents:'none', zIndex:40,
          animation:'shipHitFlash 0.5s ease-out forwards',
        }}/>
        {/* 💥 floating text */}
        <div style={{
          position:'absolute', left:'50%', bottom:'20%',
          fontFamily:'Fredoka,sans-serif', fontWeight:700, fontSize:34,
          color:'#e86040', textShadow:'2px 2px 0 #1a1408',
          pointerEvents:'none', zIndex:45,
          animation:'boomPop 0.75s ease-out forwards',
        }}>
          💥 HIT!
        </div>
      </>}

      {/* Battle zone — ship (stationary) */}
      <div style={{
        flex:1, position:'relative', zIndex:10,
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'flex-end',
        paddingBottom:6, overflow:'visible',
      }}>
        {/* AOE shockwave — centered on boss, rendered in boss area overlay */}
        {aoeWave && (
          <div style={{
            position:'absolute', top:'50%', left:'50%',
            transform:'translate(-50%,-50%)',
            width:32, height:32, borderRadius:'50%',
            border:'5px solid #ecd050',
            boxShadow:'0 0 28px #ecd050',
            animation:'aoeExpand 0.7s ease-out forwards',
            pointerEvents:'none', zIndex:45,
          }}/>
        )}

        {/* Ship — stationary, shakes on hit */}
        <div style={{
          zIndex:15,
          filter:'drop-shadow(0 4px 10px rgba(100,200,180,0.25))',
          animation: shipHit ? 'shipShake 0.45s ease-out' : 'none',
        }}>
          <PlayerShip form={shipForm} />
        </div>
      </div>

      {/* Hangar panel — slides up */}
      <div style={{
        position:'relative', zIndex:20, flexShrink:0,
        maxHeight: inHangar ? 200 : 0,
        overflow:'hidden',
        transition:'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{
          margin:'0 10px',
          background:'rgba(16,12,32,0.97)',
          border:'3px solid #2a2040',
          borderRadius:'14px 14px 0 0',
          padding:'13px 16px 15px',
          boxShadow:'0 -3px 0 #1a1408',
        }}>
          <div style={{ color:'#64c8b4', fontWeight:700, fontSize:10, letterSpacing:'0.18em', marginBottom:10 }}>
            ▣  HANGAR <span style={{ opacity:0.7, fontWeight:600 }}>({phase === 'upgraded' ? 'REPELLED — READY TO ATTACK' : 'REPELLED — UNDER REPAIR'})</span>
          </div>
          {phase === 'hangar' && (
            <div style={{ animation:'fadeSlideIn 0.4s ease-out' }}>
              <div style={{
                background:'rgba(232,96,64,0.1)', border:'2px solid #e86040',
                borderRadius:10, padding:'10px 12px', marginBottom:10,
                display:'flex', gap:8, alignItems:'flex-start',
              }}>
                <span style={{ background:'#e86040', color:'#1a1408', fontWeight:800, fontSize:11, borderRadius:999, padding:'1px 7px', flexShrink:0, marginTop:1 }}>!</span>
                <div>
                  <div style={{ color:'#e86040', fontWeight:700, fontSize:10, letterSpacing:'0.12em', marginBottom:3 }}>WHY YOU LOST</div>
                  <div style={{ fontFamily:'Nunito,sans-serif', fontWeight:600, fontSize:12, color:'#f5efe0', lineHeight:1.55 }}>
                    {lvl.defeatReason}
                  </div>
                </div>
              </div>
              <div style={{
                textAlign:'center',
                background:'rgba(100,200,180,0.12)',
                border:'2px solid #64c8b4',
                borderRadius:10,
                padding:'8px 10px',
                color:'#64c8b4', fontWeight:700, fontSize:13,
              }}>
                <div style={{ fontSize:10, letterSpacing:'0.18em', opacity:0.85, marginBottom:3 }}>UPGRADE AVAILABLE</div>
                <div style={{ color:'#ecd050', fontWeight:800, fontSize:17, letterSpacing:'0.01em' }}>
                  {lvl.skill.icon} {lvl.skill.name}
                </div>
              </div>
            </div>
          )}
          {phase === 'upgrading' && (
            <div style={{ textAlign:'center', padding:'8px 0', color:'#ecd050', fontWeight:700, fontSize:15 }}>
              {lvl.skill.icon} Equipping {lvl.skill.name}...
            </div>
          )}
          {phase === 'upgraded' && (
            <div style={{ textAlign:'center', padding:'4px 0' }}>
              <div style={{ color:'#64c8b4', fontWeight:700, fontSize:14, marginBottom:5 }}>✓ {lvl.skill.name} equipped!</div>
              <div style={{ color:'#ecd050', fontFamily:'Nunito,sans-serif', fontWeight:600, fontSize:12, lineHeight:1.45, padding:'0 4px' }}>
                {lvl.upgradeDesc}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Button bar */}
      <div style={{
        position:'relative', zIndex:20, flexShrink:0,
        padding:'10px 20px max(14px, env(safe-area-inset-bottom))',
        background:'rgba(8,6,20,0.95)',
        borderTop:'2px solid #1a1408',
        display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center',
        gap:8,
      }}>
        {btnConfig ? (
          <CartoonBtn
            onClick={btnConfig.fn}
            color={btnConfig.color}
            size={btnConfig.size || 'lg'}
            style={{ justifyContent:'center', animation:'ctaAttention 1.5s ease-in-out infinite' }}>
            {btnConfig.text}
          </CartoonBtn>
        ) : (
          <div style={{ color:'#ecd050', fontWeight:700, fontSize:13, opacity:0.45, letterSpacing:'0.1em' }}>
            {phase==='upgrading' ? 'UPGRADING...' : 'ENGAGING...'}
          </div>
        )}
        <button
          onClick={() => dispatch({ type: 'SHOW_DEEPDIVE', screen: state.level - 1 })}
          style={{
            fontFamily:'Fredoka,sans-serif', fontWeight:700, fontSize:12,
            color:'#64c8b4', background:'transparent',
            border:'2px solid #64c8b4', borderRadius:999,
            padding:'6px 18px', cursor:'pointer',
            letterSpacing:'0.08em',
            transition:'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(100,200,180,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}>
          🔬 SEE HOW DORIS DID IT
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { BattleScene });
})();
