// JSON War — Shared UI: progressive ships, bosses, effects
;(() => {
const { useState, useEffect } = React;

// ── Starfield ─────────────────────────────────────────────────────────────────
function Starfield() {
  const stars = React.useMemo(() => Array.from({ length: 55 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    r: Math.random() * 1.4 + 0.4,
    delay: Math.random() * 3, dur: 2 + Math.random() * 2,
  })), []);
  return (
    <svg style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0 }}>
      {stars.map(s => (
        <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity="0.6"
          style={{ animation: `starPop ${s.dur}s ${s.delay}s ease-in-out infinite alternate` }} />
      ))}
    </svg>
  );
}

// ── Player Ship — progressive additive design ─────────────────────────────────
// form 0: base scout (single cannon)
// form 1: + yellow side gun pods (3 per wing)
// form 2: + teal wingtip turrets
// form 3: + cyan scanner eye + antennas
// form 4: + orange shield energy fins
// form 5: + gold AOE ring emitter (ultimate)
function PlayerShip({ form = 0 }) {
  const f = Math.min(5, Math.max(0, form));
  // Engine glow color progression
  const engColors = ['#aab0be','#ecd050','#64c8b4','#40d8ff','#e86040','#ecd050'];
  const eng = engColors[f];

  return (
    <svg width="100" height="110" viewBox="-12 0 104 105" style={{ overflow:'visible' }}>

      {/* ── BASE (all forms) ── */}
      {/* Hard shadow */}
      <path d="M40,12 L60,82 L40,68 L20,82 Z" fill="#1a1408" opacity="0.2" transform="translate(5,5)"/>
      {/* Hull */}
      <path d="M40,12 L60,82 L40,68 L20,82 Z" fill="#8a8f9a" stroke="#1a1408" strokeWidth="3" strokeLinejoin="round"/>
      {/* Wing shade */}
      <path d="M40,38 L57,78 L40,66 L23,78 Z" fill="#6a7080"/>
      {/* Cockpit glass */}
      <ellipse cx="40" cy="44" rx="9" ry="13" fill="#90d8f0" stroke="#1a1408" strokeWidth="2.5"/>
      <ellipse cx="39" cy="40" rx="5" ry="8" fill="#d0f0ff" opacity="0.7"/>
      {/* Center cannon barrel */}
      <rect x="37" y="4" width="6" height="14" rx="3" fill="#3a4050" stroke="#1a1408" strokeWidth="2.5"/>
      <rect x="38.5" y="4" width="3" height="10" rx="1.5" fill="#505870"/>
      {/* Engine block */}
      <rect x="31" y="78" width="18" height="11" rx="3" fill="#2a3040" stroke="#1a1408" strokeWidth="2"/>
      <rect x="34" y="80" width="12" height="7" rx="2" fill="#aab0be"/>
      {/* Engine glow */}
      <ellipse cx="40" cy="92" rx="10" ry="4.5" fill={eng} opacity="0.4"
        style={{ animation:'enginePulse 0.6s infinite alternate' }}/>

      {/* ── FORM 1+: yellow rapid-fire wing gun pods ── */}
      {f >= 1 && <>
        {/* Left pod group */}
        <rect x="4"  y="50" width="5" height="20" rx="2.5" fill="#ecd050" stroke="#1a1408" strokeWidth="2"/>
        <rect x="10" y="54" width="4" height="15" rx="2"   fill="#c8a820" stroke="#1a1408" strokeWidth="1.5"/>
        <rect x="-2" y="54" width="4" height="15" rx="2"   fill="#c8a820" stroke="#1a1408" strokeWidth="1.5"/>
        {/* Right pod group */}
        <rect x="71" y="50" width="5" height="20" rx="2.5" fill="#ecd050" stroke="#1a1408" strokeWidth="2"/>
        <rect x="66" y="54" width="4" height="15" rx="2"   fill="#c8a820" stroke="#1a1408" strokeWidth="1.5"/>
        <rect x="76" y="54" width="4" height="15" rx="2"   fill="#c8a820" stroke="#1a1408" strokeWidth="1.5"/>
        {/* Wing stripes */}
        <line x1="22" y1="64" x2="14" y2="76" stroke="#1a1408" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="58" y1="64" x2="66" y2="76" stroke="#1a1408" strokeWidth="1.5" strokeLinecap="round"/>
      </>}

      {/* ── FORM 2+: teal wingtip turrets ── */}
      {f >= 2 && <>
        <circle cx="12"  cy="73" r="8" fill="#64c8b4" stroke="#1a1408" strokeWidth="2.5"/>
        <rect   x="8"    cy="69" y="69" width="4" height="13" rx="2" fill="#3da090" stroke="#1a1408" strokeWidth="2"/>
        <circle cx="12"  cy="73" r="3.5" fill="#90e8d8"/>
        <circle cx="68"  cy="73" r="8"   fill="#64c8b4" stroke="#1a1408" strokeWidth="2.5"/>
        <rect   x="68"   y="69" width="4" height="13" rx="2" fill="#3da090" stroke="#1a1408" strokeWidth="2"/>
        <circle cx="68"  cy="73" r="3.5" fill="#90e8d8"/>
      </>}

      {/* ── FORM 3+: cyan scanner eye + wing antennas ── */}
      {f >= 3 && <>
        {/* Scanner eye ring over cannon */}
        <circle cx="40" cy="15" r="11" fill="#20b0d8" stroke="#1a1408" strokeWidth="2.5"/>
        <circle cx="40" cy="15" r="7"  fill="#40d8ff"/>
        <circle cx="40" cy="15" r="4"  fill="#c0f8ff" stroke="#1a1408" strokeWidth="1.5"/>
        <circle cx="38.5" cy="13.5" r="1.8" fill="white" opacity="0.85"/>
        {/* Antennas */}
        <line x1="20" y1="60" x2="10" y2="48" stroke="#1a1408" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="10" cy="47" r="3.5" fill="#40d8ff" stroke="#1a1408" strokeWidth="2"/>
        <line x1="60" y1="60" x2="70" y2="48" stroke="#1a1408" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="70" cy="47" r="3.5" fill="#40d8ff" stroke="#1a1408" strokeWidth="2"/>
      </>}

      {/* ── FORM 4+: orange shield energy fins ── */}
      {f >= 4 && <>
        <path d="M22,58 L6,50 L4,66 L18,72 Z"  fill="#e86040" stroke="#1a1408" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M58,58 L74,50 L76,66 L62,72 Z" fill="#e86040" stroke="#1a1408" strokeWidth="2.5" strokeLinejoin="round"/>
        <circle cx="5"  cy="58" r="4" fill="#e86040" stroke="#1a1408" strokeWidth="2"/>
        <circle cx="75" cy="58" r="4" fill="#e86040" stroke="#1a1408" strokeWidth="2"/>
        {/* Inner energy lines */}
        <line x1="22" y1="58" x2="6"  y2="50" stroke="#ffa080" strokeWidth="1.5" opacity="0.7"/>
        <line x1="58" y1="58" x2="74" y2="50" stroke="#ffa080" strokeWidth="1.5" opacity="0.7"/>
      </>}

      {/* ── FORM 5: gold AOE ring emitter ── */}
      {f >= 5 && <>
        <circle cx="40" cy="56" r="16" fill="none" stroke="#ecd050" strokeWidth="3" opacity="0.8"/>
        <circle cx="40" cy="56" r="11" fill="none" stroke="#ecd050" strokeWidth="2" opacity="0.5"/>
        <circle cx="40" cy="56" r="4.5" fill="#ecd050" stroke="#1a1408" strokeWidth="2"/>
        {/* 4 connector nodes */}
        {[[40,40],[56,56],[40,72],[24,56]].map(([cx,cy],i) => (
          <circle key={i} cx={cx} cy={cy} r="2.5" fill="#ecd050" stroke="#1a1408" strokeWidth="1.5"/>
        ))}
        {/* Glow */}
        <circle cx="40" cy="56" r="16" fill="none" stroke="#ecd050" strokeWidth="6" opacity="0.15"
          style={{ animation:'enginePulse 0.8s infinite alternate' }}/>
      </>}

    </svg>
  );
}

// ── Boss SVGs ─────────────────────────────────────────────────────────────────
function BossGiant({ hp, maxHp, shaking, flash }) {
  const eyeColor = flash ? '#ffffff' : '#e86040';
  return (
    <svg width="150" height="170" viewBox="0 0 160 180"
      style={{ animation: shaking ? 'bossShake 0.15s ease-out' : 'none', filter: flash ? 'brightness(3)' : 'none', transition: 'filter 0.12s' }}>
      <rect x="45" y="10" width="70" height="50" rx="4" fill="#4a5568" stroke="#1a1408" strokeWidth="3"/>
      <rect x="50" y="15" width="60" height="40" rx="2" fill="#3d4555"/>
      <rect x="58" y="25" width="16" height="12" rx="2" fill={eyeColor} opacity="0.9"/>
      <rect x="86" y="25" width="16" height="12" rx="2" fill={eyeColor} opacity="0.9"/>
      <rect x="62" y="44" width="36" height="5"  rx="2" fill="#1a1408"/>
      <rect x="68" y="60" width="24" height="10" fill="#3d4555" stroke="#1a1408" strokeWidth="2"/>
      <rect x="30" y="70" width="100" height="60" rx="4" fill="#4a5568" stroke="#1a1408" strokeWidth="3"/>
      <rect x="35" y="75" width="90"  height="50" rx="2" fill="#3d4555"/>
      <text x="80" y="108" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="28" fontWeight="700" fill="#64c8b4" stroke="#1a1408" strokeWidth="1">{'{ }'}</text>
      <rect x="5"   y="72" width="25" height="55" rx="4" fill="#4a5568" stroke="#1a1408" strokeWidth="3"/>
      <rect x="130" y="72" width="25" height="55" rx="4" fill="#4a5568" stroke="#1a1408" strokeWidth="3"/>
      <rect x="3"   y="127" width="29" height="22" rx="4" fill="#3d4555" stroke="#1a1408" strokeWidth="3"/>
      <rect x="128" y="127" width="29" height="22" rx="4" fill="#3d4555" stroke="#1a1408" strokeWidth="3"/>
      <rect x="40"  y="130" width="30" height="40" rx="4" fill="#4a5568" stroke="#1a1408" strokeWidth="3"/>
      <rect x="90"  y="130" width="30" height="40" rx="4" fill="#4a5568" stroke="#1a1408" strokeWidth="3"/>
      <rect x="36"  y="82"  width="18" height="3"  rx="1" fill="#64c8b4" opacity="0.7"/>
      <rect x="36"  y="90"  width="25" height="3"  rx="1" fill="#64c8b4" opacity="0.5"/>
      {hp / maxHp < 0.6 && <line x1="50" y1="75" x2="65" y2="95" stroke="#e86040" strokeWidth="2" opacity="0.8"/>}
    </svg>
  );
}

function BossInflation({ hp, maxHp, shaking, flash, inflation, locked, lockAnim }) {
  const scale = 1 + (inflation || 0) * 0.13;
  const eyeColor = flash ? '#ffffff' : '#e86040';
  return (
    <svg width="180" height="180" viewBox="0 0 180 180"
      style={{
        animation: lockAnim ? 'lockStrainAnim 0.4s ease-out' : shaking ? 'bossShake 0.15s ease-out' : 'none',
        filter: flash ? 'brightness(3)' : 'none',
        transform: `scale(${scale})`,
        transition: 'transform 0.35s ease-out, filter 0.12s',
        transformOrigin: 'center',
      }}>
      {(inflation||0) > 0 && <ellipse cx="90" cy="90" rx="82" ry="82" fill="none" stroke="#ecd050" strokeWidth="4" opacity="0.4"/>}
      {(inflation||0) > 1 && <ellipse cx="90" cy="90" rx="88" ry="88" fill="none" stroke="#ecd050" strokeWidth="3" opacity="0.25"/>}
      <ellipse cx="90" cy="92" rx="68" ry="68" fill="#c8a835" stroke="#1a1408" strokeWidth="3"/>
      <ellipse cx="90" cy="92" rx="62" ry="62" fill="#ecd050"/>
      {['col_001','col_002','col_003'].map((l,i) => (
        <text key={l} x="90" y={62+i*24} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="9" fill="#1a1408" opacity="0.4">{l}</text>
      ))}
      <ellipse cx="90" cy="92" rx="28" ry="28" fill="#e86040" stroke="#1a1408" strokeWidth="2"/>
      <ellipse cx="90" cy="92" rx="18" ry="18" fill="#c84820"/>
      <circle cx="76" cy="82" r="7" fill={eyeColor} stroke="#1a1408" strokeWidth="2"/>
      <circle cx="104" cy="82" r="7" fill={eyeColor} stroke="#1a1408" strokeWidth="2"/>
      <ellipse cx="90" cy="92" rx="45" ry="45" fill="none" stroke="#c8a835" strokeWidth="2" opacity="0.5"/>
      {/* Lock ring (shown post-upgrade) */}
      {locked && <>
        <ellipse cx="90" cy="92" rx="72" ry="72" fill="none" stroke="#64c8b4" strokeWidth="5" opacity="0.8" strokeDasharray="12 6"/>
        <ellipse cx="90" cy="92" rx="72" ry="72" fill="none" stroke="#1a1408" strokeWidth="2" opacity="0.4" strokeDasharray="12 6"/>
      </>}
    </svg>
  );
}

function BossPhantom({ shaking, flash, visible, showTarget }) {
  const opacity = visible ? 1 : 0.25;
  const eyeColor = flash ? '#ffffff' : '#e86040';
  return (
    <svg width="130" height="185" viewBox="0 0 140 200"
      style={{ animation: shaking ? 'bossShake 0.15s ease-out' : 'none', filter: flash ? 'brightness(3)' : 'none', opacity, transition: 'opacity 0.6s, filter 0.12s' }}>
      {Array.from({length:8},(_,i)=>(
        <line key={i} x1="0" y1={i*25} x2="140" y2={i*25} stroke="#64c8b4" strokeWidth="0.5" opacity="0.2"/>
      ))}
      <polygon points="70,15 110,60 115,150 70,170 25,150 30,60" fill="#64c8b4" stroke="#1a1408" strokeWidth="2.5" opacity="0.85"/>
      <polygon points="70,25 100,65 105,140 70,158 35,140 40,65" fill="#64c8b4" opacity="0.35"/>
      <ellipse cx="70" cy="40" rx="28" ry="25" fill="#3db8a0" stroke="#1a1408" strokeWidth="2.5"/>
      <ellipse cx="58" cy="36" rx="9" ry="7" fill={eyeColor}/>
      <ellipse cx="82" cy="36" rx="9" ry="7" fill={eyeColor}/>
      <polygon points="70,15 110,60 115,150 70,170 25,150 30,60" fill="none" stroke="#ecd050" strokeWidth="1" opacity="0.5"/>
      <polygon points="30,75 8,120 20,125 38,80"   fill="#3db8a0" stroke="#1a1408" strokeWidth="2" opacity="0.8"/>
      <polygon points="110,75 132,120 120,125 102,80" fill="#3db8a0" stroke="#1a1408" strokeWidth="2" opacity="0.8"/>
      <rect x="45" y="155" width="22" height="38" rx="4" fill="#3db8a0" stroke="#1a1408" strokeWidth="2" opacity="0.8"/>
      <rect x="73" y="155" width="22" height="38" rx="4" fill="#3db8a0" stroke="#1a1408" strokeWidth="2" opacity="0.8"/>
      {/* Target crosshair (post-upgrade) */}
      {showTarget && <>
        <circle cx="70" cy="90" r="30" fill="none" stroke="#e86040" strokeWidth="3" opacity="0.9"/>
        <circle cx="70" cy="90" r="8"  fill="none" stroke="#e86040" strokeWidth="2.5"/>
        <line x1="70" y1="54" x2="70" y2="72" stroke="#e86040" strokeWidth="3"/>
        <line x1="70" y1="108" x2="70" y2="126" stroke="#e86040" strokeWidth="3"/>
        <line x1="34" y1="90" x2="52" y2="90" stroke="#e86040" strokeWidth="3"/>
        <line x1="88" y1="90" x2="106" y2="90" stroke="#e86040" strokeWidth="3"/>
        <circle cx="70" cy="90" r="3" fill="#e86040"/>
      </>}
    </svg>
  );
}

function BossShapeshifter({ shaking, flash, form, locked }) {
  const eyeColor = flash ? '#ffffff' : '#e86040';
  const f = form || 0;
  return (
    <svg width="150" height="180" viewBox="0 0 160 190"
      style={{ animation: shaking ? 'bossShake 0.15s ease-out' : 'none', filter: flash ? 'brightness(3)' : 'none', transition: 'filter 0.12s' }}>
      <rect x="30" y="0" width="100" height="18" rx="4" fill="#7a6a54" stroke="#1a1408" strokeWidth="1.5"/>
      <text x="80" y="13" textAnchor="middle" fontFamily="Fredoka,sans-serif" fontSize="10" fontWeight="700" fill={locked ? '#aaaaaa' : '#ecd050'} letterSpacing="2">
        {locked ? 'LOCKED' : ['INTEGER','STRING','FLOAT'][f]+' FORM'}
      </text>
      {f === 0 && (
        <g>
          <rect x="62" y="20" width="36" height="120" rx="6" fill="#7a6a54" stroke="#1a1408" strokeWidth="3"/>
          <polygon points="80,18 60,32 100,32" fill="#ecd050" stroke="#1a1408" strokeWidth="2"/>
          <polygon points="30,60 62,70 62,100 30,80" fill="#9aa0b0" stroke="#1a1408" strokeWidth="2"/>
          <polygon points="130,60 98,70 98,100 130,80" fill="#9aa0b0" stroke="#1a1408" strokeWidth="2"/>
          <line x1="68" y1="35" x2="68" y2="130" stroke="#ecd050" strokeWidth="2" opacity="0.6"/>
          <line x1="80" y1="35" x2="80" y2="130" stroke="#ecd050" strokeWidth="2" opacity="0.6"/>
          <line x1="92" y1="35" x2="92" y2="130" stroke="#ecd050" strokeWidth="2" opacity="0.6"/>
          <ellipse cx="69" cy="50" rx="7" ry="6" fill={eyeColor}/>
          <ellipse cx="91" cy="50" rx="7" ry="6" fill={eyeColor}/>
          <rect x="55" y="140" width="20" height="40" rx="4" fill="#7a6a54" stroke="#1a1408" strokeWidth="2"/>
          <rect x="85" y="140" width="20" height="40" rx="4" fill="#7a6a54" stroke="#1a1408" strokeWidth="2"/>
        </g>
      )}
      {f === 1 && (
        <g>
          <rect x="20" y="20" width="120" height="90" rx="8" fill="#7a6a54" stroke="#1a1408" strokeWidth="3"/>
          <rect x="28" y="28" width="104" height="74" rx="6" fill="#8a7a64"/>
          <polygon points="80,35 110,55 100,80 80,90 60,80 50,55" fill="#ecd050" stroke="#1a1408" strokeWidth="2"/>
          <ellipse cx="65" cy="50" rx="9" ry="8" fill={eyeColor}/>
          <ellipse cx="95" cy="50" rx="9" ry="8" fill={eyeColor}/>
          <rect x="0"   y="30" width="20" height="60" rx="4" fill="#7a6a54" stroke="#1a1408" strokeWidth="2"/>
          <rect x="140" y="30" width="20" height="60" rx="4" fill="#7a6a54" stroke="#1a1408" strokeWidth="2"/>
          <rect x="45"  y="110" width="30" height="40" rx="4" fill="#7a6a54" stroke="#1a1408" strokeWidth="2"/>
          <rect x="85"  y="110" width="30" height="40" rx="4" fill="#7a6a54" stroke="#1a1408" strokeWidth="2"/>
        </g>
      )}
      {f === 2 && (
        <g>
          {[0,45,90,135,180,225,270,315].map((angle,i) => {
            const rad = angle * Math.PI / 180;
            return <line key={i} x1="80" y1="100" x2={80+55*Math.cos(rad)} y2={100+55*Math.sin(rad)} stroke="#e86040" strokeWidth="4" strokeLinecap="round"/>;
          })}
          <circle cx="80" cy="100" r="50" fill="#7a6a54" stroke="#1a1408" strokeWidth="3"/>
          <circle cx="80" cy="100" r="38" fill="#8a7a64"/>
          <ellipse cx="68" cy="92" rx="9" ry="9" fill={eyeColor} stroke="#1a1408" strokeWidth="2"/>
          <ellipse cx="92" cy="92" rx="9" ry="9" fill={eyeColor} stroke="#1a1408" strokeWidth="2"/>
          <circle cx="80" cy="100" r="25" fill="none" stroke="#ecd050" strokeWidth="2" opacity="0.5"/>
        </g>
      )}
      {/* Lock X overlay */}
      {locked && <>
        <line x1="35" y1="25" x2="125" y2="165" stroke="#e86040" strokeWidth="4" opacity="0.5" strokeLinecap="round"/>
        <line x1="125" y1="25" x2="35" y2="165" stroke="#e86040" strokeWidth="4" opacity="0.5" strokeLinecap="round"/>
      </>}
    </svg>
  );
}

function BossLegion({ unitHps, shaking, flash }) {
  const colors = ['#64c8b4','#7a8cff','#a06eff','#ff8c40','#40c8ff','#ff6480','#80e060','#ffd040','#c080ff'];
  return (
    <svg width="200" height="165" viewBox="0 0 200 165"
      style={{ animation: shaking ? 'bossShake 0.15s ease-out' : 'none', filter: flash ? 'brightness(2)' : 'none', transition: 'filter 0.12s' }}>
      <polygon points="100,65 110,75 100,85 90,75" fill="#ecd050" stroke="#1a1408" strokeWidth="2" style={{animation:'legionPulse 1.5s infinite alternate'}}/>
      {(unitHps||Array(9).fill(11)).map((hp,i) => {
        const col = i%3, row = Math.floor(i/3);
        const x = 22+col*55, y = 6+row*48;
        const alive = hp > 0;
        return (
          <g key={i} opacity={alive ? 1 : 0.12}>
            <polygon points={`${x+16},${y+4} ${x+28},${y+12} ${x+28},${y+28} ${x+16},${y+36} ${x+4},${y+28} ${x+4},${y+12}`}
              fill="#1a1408" opacity="0.25" transform="translate(3,3)"/>
            <polygon points={`${x+16},${y+4} ${x+28},${y+12} ${x+28},${y+28} ${x+16},${y+36} ${x+4},${y+28} ${x+4},${y+12}`}
              fill={alive ? colors[i] : '#333'} stroke="#1a1408" strokeWidth="2.5"/>
            <ellipse cx={x+16} cy={y+20} rx={alive?7:5} ry={alive?6:4} fill={alive?'#e86040':'#444'} stroke="#1a1408" strokeWidth="1.5"/>
            {alive && Array.from({length:Math.ceil(hp/4)},(_,pi)=>(
              <rect key={pi} x={x+pi*5} y={y-6} width="4" height="3" rx="1" fill="#ecd050"/>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// ── Boss HP Bar ───────────────────────────────────────────────────────────────
function BossHPBar({ hp, maxHp, bossName }) {
  const pct = Math.max(0, hp / maxHp);
  const color = pct > 0.5 ? '#64c8b4' : pct > 0.25 ? '#ecd050' : '#e86040';
  return (
    <div style={{ fontFamily:'Fredoka,sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
        <span style={{ color:'#ecd050', fontWeight:700, fontSize:13 }}>{bossName}</span>
        <span style={{ color:'#e86040', fontWeight:700, fontSize:13 }}>{hp} / {maxHp} HP</span>
      </div>
      <div style={{ height:14, background:'#2a2035', border:'2px solid #1a1408', borderRadius:7, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct*100}%`, background:color, borderRadius:5, transition:'width 0.4s ease-out, background 0.3s' }}/>
      </div>
    </div>
  );
}

// ── Damage Popup ──────────────────────────────────────────────────────────────
function DamagePopup({ damage, id }) {
  const [on, setOn] = useState(true);
  useEffect(() => { const t = setTimeout(() => setOn(false), 800); return () => clearTimeout(t); }, [id]);
  if (!damage || !on) return null;
  return (
    <div style={{
      position:'absolute', top:'30%', left:'50%', transform:'translate(-50%,-50%)',
      pointerEvents:'none', zIndex:50,
      fontFamily:'Fredoka,sans-serif', fontWeight:700, fontSize:30,
      color:'#e86040', textShadow:'2px 2px 0 #1a1408',
      animation:'damageFloat 0.8s ease-in forwards',
    }}>
      -{damage}
    </div>
  );
}

// ── Float Label (MISS / BLOCKED / GROW!) ─────────────────────────────────────
function FloatLabel({ text, color = '#e86040', id }) {
  const [on, setOn] = useState(true);
  useEffect(() => { const t = setTimeout(() => setOn(false), 700); return () => clearTimeout(t); }, [id]);
  if (!on) return null;
  return (
    <div style={{
      position:'absolute', top:'20%', left:'50%', transform:'translate(-50%,-50%)',
      pointerEvents:'none', zIndex:55,
      fontFamily:'Fredoka,sans-serif', fontWeight:700,
      fontSize: text.length > 16 ? 15 : text.length > 8 ? 20 : 26,
      whiteSpace:'nowrap',
      color, textShadow:'2px 2px 0 #1a1408',
      animation:'damageFloat 0.7s ease-in forwards',
    }}>
      {text}
    </div>
  );
}

// ── Shield Block Flash ────────────────────────────────────────────────────────
function ShieldFlash({ id }) {
  const [on, setOn] = useState(true);
  useEffect(() => { const t = setTimeout(() => setOn(false), 500); return () => clearTimeout(t); }, [id]);
  if (!on) return null;
  return (
    <div style={{
      position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
      width:120, height:120, borderRadius:'50%',
      border:'4px solid #ecd050',
      boxShadow:'0 0 20px #ecd050, inset 0 0 20px rgba(236,208,80,0.3)',
      pointerEvents:'none', zIndex:52,
      animation:'shieldFlash 0.5s ease-out forwards',
    }}/>
  );
}

// ── Arc Shield (type-mismatch block) ──────────────────────────────────────────
// Positioned with bottom:% so it aligns with the bullet animation (vh-based).
// Rendered in a viewport-sized overlay by the caller.
function ArcShield({ id }) {
  const [on, setOn] = useState(true);
  useEffect(() => { const t = setTimeout(() => setOn(false), 620); return () => clearTimeout(t); }, [id]);
  if (!on) return null;
  return (
    <div style={{
      position:'absolute', bottom:'55%', left:'50%', marginLeft:-95,
      width:190, height:64,
      pointerEvents:'none', zIndex:52,
      animation:'arcShieldFlash 0.6s ease-out forwards',
      transformOrigin:'center center',
    }}>
      <div style={{ width:'100%', height:'100%', transform:'scaleY(-1)', transformOrigin:'center center' }}>
        <svg width="190" height="64" viewBox="0 0 190 64" style={{ overflow:'visible' }}>
          <defs>
            <linearGradient id="arcShieldGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#ecd050" stopOpacity="0.55"/>
              <stop offset="1" stopColor="#ecd050" stopOpacity="0.04"/>
            </linearGradient>
          </defs>
          {/* Glow */}
          <path d="M6,58 Q95,-8 184,58" fill="none" stroke="#ffe890" strokeWidth="12" opacity="0.22"/>
          {/* Fill */}
          <path d="M6,58 Q95,-8 184,58 L184,62 L6,62 Z" fill="url(#arcShieldGrad)"/>
          {/* Arc */}
          <path d="M6,58 Q95,-8 184,58" fill="none" stroke="#ecd050" strokeWidth="3.5" opacity="0.95"/>
          {/* Hex pattern highlights */}
          <path d="M50,36 Q95,4 140,36" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.35" strokeDasharray="3 5"/>
        </svg>
      </div>
    </div>
  );
}

// ── Cartoon Button ────────────────────────────────────────────────────────────
function CartoonBtn({ children, onClick, color='#e86040', disabled, style={}, size='lg' }) {
  const [pressed, setPressed] = useState(false);
  const h = size === 'lg' ? 56 : size === 'md' ? 44 : 36;
  return (
    <button onClick={!disabled ? onClick : undefined}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      disabled={disabled}
      style={{
        fontFamily:'Fredoka,sans-serif', fontWeight:700,
        fontSize: size==='lg' ? 18 : size==='md' ? 16 : 13,
        letterSpacing:'0.1em', textTransform:'uppercase',
        background: disabled ? '#333' : color,
        color: disabled ? '#666' : '#1a1408',
        border:'3px solid #1a1408', borderRadius:999, height:h, padding:'0 28px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: pressed||disabled ? 'none' : '4px 4px 0 #1a1408',
        transform: pressed ? 'translate(4px,4px)' : 'translate(0,0)',
        transition:'transform 0.08s, box-shadow 0.08s',
        display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap',
        ...style,
      }}>
      {children}
    </button>
  );
}

// ── Skill Chip ────────────────────────────────────────────────────────────────
function SkillChip({ icon, name }) {
  return (
    <span style={{
      fontFamily:'Nunito,sans-serif', fontWeight:700, fontSize:11,
      background:'#1a2535', border:'2px solid #64c8b4', borderRadius:999,
      padding:'2px 9px', color:'#64c8b4', display:'inline-flex', gap:4, alignItems:'center',
      boxShadow:'2px 2px 0 #1a1408', whiteSpace:'nowrap',
    }}>
      {icon} {name}
    </span>
  );
}

// ── Explosion ─────────────────────────────────────────────────────────────────
function Explosion({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 950); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none', zIndex:60 }}>
      {[...Array(10)].map((_,i) => (
        <div key={i} style={{
          position:'absolute', left:0, top:0,
          width:14, height:14, borderRadius:'50%',
          background: i%2===0 ? '#e86040' : '#ecd050',
          animation:`explodeParticle 0.85s ease-out forwards`,
          animationDelay:`${i*0.04}s`,
          transform:`rotate(${i*36}deg)`,
        }}/>
      ))}
      <div style={{
        position:'absolute', left:-38, top:-38,
        width:76, height:76, borderRadius:'50%',
        background:'radial-gradient(circle, #ecd050, #e86040, transparent)',
        animation:'explodeCore 0.95s ease-out forwards',
      }}/>
    </div>
  );
}

Object.assign(window, {
  Starfield, PlayerShip,
  BossGiant, BossInflation, BossPhantom, BossShapeshifter, BossLegion,
  BossHPBar, DamagePopup, FloatLabel, ShieldFlash, ArcShield, CartoonBtn, SkillChip, Explosion,
});
})();
