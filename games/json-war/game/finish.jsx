// JSON War — VictoryModal, SettlementPage, DeepDive
;(() => {
const { useState, useEffect } = React;

// ── Victory Modal (Levels 1–4) ────────────────────────────────────────────────
function VictoryModal() {
  const { state, dispatch } = useGame();
  const lvl = LEVELS[state.level - 1];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const handleNext = () => {
    setVisible(false);
    setTimeout(() => dispatch({ type: 'NEXT_LEVEL' }), 300);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(10,8,25,0.85)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease',
    }}>
      <div style={{
        background: '#12101e', border: '3px solid #1a1408',
        borderRadius: 20, padding: '28px 24px', maxWidth: 420, width: '100%',
        boxShadow: '6px 6px 0 #1a1408',
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'transform 0.3s ease',
        fontFamily: 'Fredoka, sans-serif',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>★</div>
          <div style={{ color: '#ecd050', fontWeight: 700, fontSize: 24, letterSpacing: '0.1em' }}>
            LEVEL CLEARED
          </div>
          <div style={{ color: '#ffffff', fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 15, marginTop: 6, opacity: 0.8 }}>
            {lvl.bossName} has been defeated!
          </div>
        </div>

        {/* Skill acquired */}
        <div style={{
          background: 'rgba(100,200,180,0.12)', border: '2px solid #64c8b4',
          borderRadius: 12, padding: '12px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12,
          animation: 'fadeSlideIn 0.5s 0.1s ease-out both',
        }}>
          <span style={{ fontSize: 28 }}>{lvl.skill.icon}</span>
          <div>
            <div style={{ color: '#64c8b4', fontWeight: 700, fontSize: 11, letterSpacing: '0.15em' }}>SKILL ACQUIRED</div>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 18 }}>{lvl.skill.name}</div>
          </div>
        </div>

        {/* Tech Insight */}
        <div style={{
          background: 'rgba(236,208,80,0.06)', border: '2px solid rgba(236,208,80,0.3)',
          borderRadius: 12, padding: '16px',
          animation: 'fadeSlideIn 0.5s 0.2s ease-out both',
        }}>
          <div style={{ color: '#ecd050', fontWeight: 700, fontSize: 12, letterSpacing: '0.15em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            📖 TECH INSIGHT
          </div>
          <div style={{ borderTop: '1px solid rgba(236,208,80,0.2)', paddingTop: 12 }}>
            <div style={{ color: '#e86040', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', marginBottom: 6 }}>CHALLENGE</div>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, color: '#f5efe0', lineHeight: 1.6, margin: '0 0 14px' }}>
              {lvl.techInsight.challenge}
            </p>
            <div style={{ color: '#64c8b4', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', marginBottom: 6 }}>SOLUTION</div>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 13, color: '#f5efe0', lineHeight: 1.6, margin: 0 }}>
              {lvl.techInsight.solution}
            </p>
          </div>
        </div>

        {/* Next level / victory button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <CartoonBtn onClick={handleNext} color="#ecd050" size="lg" style={{ width: '100%', justifyContent: 'center' }}>
            {state.level >= 5 ? '🏆 VICTORY!' : 'NEXT LEVEL →'}
          </CartoonBtn>
        </div>
      </div>
    </div>
  );
}

// ── Confetti (Level 5 celebration) ────────────────────────────────────────────
function Confetti() {
  const pieces = React.useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i, x: Math.random() * 100,
    color: ['#ecd050','#64c8b4','#e86040','#ffffff','#a06eff'][i % 5],
    dur: 1.5 + Math.random() * 1.5, delay: Math.random() * 0.8,
    size: 6 + Math.random() * 8,
  })), []);
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: '-10px',
          width: p.size, height: p.size, background: p.color,
          borderRadius: p.id % 3 === 0 ? '50%' : 2,
          animation: `confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
        }}/>
      ))}
    </div>
  );
}

// ── Settlement Page ───────────────────────────────────────────────────────────
function SettlementPage() {
  const { dispatch } = useGame();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', position: 'relative', zIndex: 10,
      fontFamily: 'Fredoka, sans-serif',
      opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease',
    }}>
      <Starfield />
      <Confetti />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 420, width: '100%' }}>
        {/* Trophy */}
        <div style={{ fontSize: 56, marginBottom: 16, animation: 'bossFloat 2s ease-in-out infinite' }}>🏆</div>

        {/* Title */}
        <div style={{ color: '#e86040', fontWeight: 700, fontSize: 12, letterSpacing: '0.2em', marginBottom: 8 }}>
          ★ MISSION COMPLETE ★
        </div>
        <h1 style={{
          fontFamily: 'Fredoka, sans-serif', fontWeight: 700,
          fontSize: 'clamp(30px, 8vw, 42px)', color: '#ecd050',
          textShadow: '4px 4px 0 #1a1408', margin: '0 0 8px', lineHeight: 1.1,
        }}>
          JSON ANOMALY<br/>NEUTRALIZED
        </h1>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 15, color: '#ffffff', opacity: 0.7, marginBottom: 32 }}>
          All 5 bosses defeated. The data center is secure.
        </p>

        {/* Skills mastered */}
        <div style={{
          background: 'rgba(20,16,40,0.9)', border: '3px solid #1a1408',
          borderRadius: 16, padding: '20px', marginBottom: 32,
          boxShadow: '4px 4px 0 #1a1408', textAlign: 'left',
        }}>
          <div style={{ color: '#ecd050', fontWeight: 700, fontSize: 13, letterSpacing: '0.15em', marginBottom: 14 }}>
            SKILLS MASTERED
          </div>
          {SKILLS_LIST.map((skill, i) => (
            <div key={skill.name} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 0',
              borderBottom: i < SKILLS_LIST.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              animation: `fadeSlideIn 0.4s ${i * 0.1}s ease-out both`,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#64c8b4', border: '2px solid #1a1408',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0,
              }}>✓</div>
              <span style={{ color: '#ffffff', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 15 }}>
                {skill.icon} {skill.name}
              </span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <CartoonBtn
            onClick={() => dispatch({ type: 'SHOW_DEEPDIVE' })}
            color="#e86040" size="lg"
            style={{ width: '100%', maxWidth: 340, justifyContent: 'center', animation: 'ctaAttention 1.5s ease-in-out infinite' }}>
            🔬 SEE HOW DORIS DID IT
          </CartoonBtn>
          <button
            onClick={() => dispatch({ type: 'PLAY_AGAIN' })}
            style={{
              fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 15,
              color: '#ecd050', background: 'transparent', border: '2px solid #ecd050',
              borderRadius: 999, padding: '10px 32px', cursor: 'pointer',
              letterSpacing: '0.1em', transition: 'opacity 0.2s',
            }}>
            ↩ PLAY AGAIN
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Deep Dive ─────────────────────────────────────────────────────────────────
function DiagramExtraction() {
  return (
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ background: 'rgba(100,200,180,0.1)', border: '1px solid #64c8b4', borderRadius: 8, padding: 12, minWidth: 160 }}>
          <div style={{ color: '#64c8b4', fontSize: 10, marginBottom: 6 }}>JSON DOCUMENT</div>
          <div style={{ color: '#ecd050', lineHeight: 1.8 }}>{'{'}<br/>
            &nbsp;&nbsp;<span style={{ color: '#f5efe0' }}>"geo"</span>: {'{'}<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#f5efe0' }}>"city"</span>: <span style={{ color: '#64c8b4' }}>"NYC"</span><br/>
            &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#f5efe0' }}>"lat"</span>: <span style={{ color: '#e86040' }}>40.71</span><br/>
            &nbsp;&nbsp;{'}'}<br/>
          {'}'}</div>
        </div>
        <div style={{ fontSize: 20, alignSelf: 'center', color: '#ecd050' }}>→</div>
        <div style={{ background: 'rgba(236,208,80,0.1)', border: '1px solid #ecd050', borderRadius: 8, padding: 12, minWidth: 160 }}>
          <div style={{ color: '#ecd050', fontSize: 10, marginBottom: 6 }}>SUB-COLUMNS</div>
          {[['geo.city','VARCHAR'],['geo.lat','FLOAT'],['device.type','VARCHAR']].map(([k,t]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
              <span style={{ color: '#f5efe0' }}>{k}</span>
              <span style={{ color: '#64c8b4' }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiagramSchema() {
  return (
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.8 }}>
      <div style={{ background: 'rgba(100,200,180,0.1)', border: '1px solid #64c8b4', borderRadius: 8, padding: 12 }}>
        <span style={{ color: '#ecd050' }}>VARIANT</span> metadata{'<'}<br/>
        &nbsp;&nbsp;<span style={{ color: '#f5efe0' }}>'$.geo.lat'</span> : <span style={{ color: '#64c8b4' }}>FLOAT</span>
        <span style={{ color: '#7a6a54' }}>  ← constrained</span><br/>
        &nbsp;&nbsp;<span style={{ color: '#f5efe0' }}>'$.device.type'</span> : <span style={{ color: '#64c8b4' }}>STRING</span>
        <span style={{ color: '#7a6a54' }}>  ← constrained</span><br/>
        &nbsp;&nbsp;<span style={{ color: '#f5efe0' }}>'$.tags*'</span> : <span style={{ color: '#64c8b4' }}>TEXT</span>
        <span style={{ color: '#7a6a54' }}>  ← wildcard (flex)</span><br/>
        {'>'}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontFamily: 'Nunito, sans-serif' }}>
        <span style={{ color: '#64c8b4', fontWeight: 700, fontSize: 12 }}>✓ Explicit types on hot paths</span>
        <span style={{ color: '#ecd050', fontWeight: 700, fontSize: 12 }}>✓ Wildcard for unknowns</span>
      </div>
    </div>
  );
}

function DiagramIndex() {
  return (
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
      <div style={{ color: '#e86040', marginBottom: 8 }}>Without Index: full scan ═══► 1M rows</div>
      <div style={{ background: 'rgba(100,200,180,0.1)', border: '1px solid #64c8b4', borderRadius: 8, padding: 12, marginBottom: 8 }}>
        <div style={{ color: '#64c8b4', fontSize: 10, marginBottom: 8 }}>INVERTED INDEX</div>
        {[
          ['"error"', '[row1, row5, row9]'],
          ['"login"', '[row3, row7]'],
          ['"timeout"', '[row2, row4]'],
        ].map(([term, rows]) => (
          <div key={term} style={{ marginBottom: 6, color: '#f5efe0' }}>
            <span style={{ color: '#ecd050' }}>term: {term}</span> → <span style={{ color: '#64c8b4' }}>{rows}</span>
          </div>
        ))}
      </div>
      <div style={{ color: '#64c8b4', fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>↓ Direct lookup = milliseconds</div>
    </div>
  );
}

function DiagramType() {
  return (
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
      {[
        ['Row 1', 'metadata[\'status\'] = 200', 'INT'],
        ['Row 2', 'metadata[\'status\'] = "OK"', 'STRING'],
        ['Row 3', 'metadata[\'status\'] = true', 'BOOLEAN'],
      ].map(([row, val, type]) => (
        <div key={row} style={{ marginBottom: 6, color: '#f5efe0' }}>
          <span style={{ color: '#7a6a54' }}>{row}: </span>{val}
          <span style={{ color: '#e86040', marginLeft: 8 }}>({type})</span>
        </div>
      ))}
      <div style={{ color: '#ecd050', margin: '12px 0', fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>── Type Promotion ──►</div>
      {['200','\"OK\"','true'].map((v, i) => (
        <div key={v} style={{ color: '#64c8b4', marginBottom: 4 }}>
          {v} → <span style={{ color: '#ecd050' }}>JSONB</span> ✓
          {i > 0 && <span style={{ color: '#7a6a54', fontSize: 11 }}> (upgraded)</span>}
        </div>
      ))}
    </div>
  );
}

function DiagramDoc() {
  return (
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: 'rgba(232,96,64,0.1)', border: '1px solid #e86040', borderRadius: 8, padding: 10 }}>
          <div style={{ color: '#e86040', fontSize: 10, marginBottom: 8 }}>WITHOUT DOC MODE</div>
          <div style={{ color: '#f5efe0', lineHeight: 1.7 }}>
            col_1 col_2 col_3…<br/>
            [AAA] [BBB] [CCC]<br/>
          </div>
          <div style={{ color: '#7a6a54', marginTop: 6, fontSize: 10 }}>SELECT * = reassemble all cols (slow)</div>
        </div>
        <div style={{ background: 'rgba(100,200,180,0.1)', border: '1px solid #64c8b4', borderRadius: 8, padding: 10 }}>
          <div style={{ color: '#64c8b4', fontSize: 10, marginBottom: 8 }}>WITH DOC MODE</div>
          <div style={{ color: '#f5efe0', lineHeight: 1.7 }}>
            col_1 col_2 <span style={{ color: '#ecd050' }}>doc</span><br/>
            [AAA] [BBB] <span style={{ color: '#ecd050' }}>[ full JSON ]</span>
          </div>
          <div style={{ color: '#64c8b4', marginTop: 6, fontSize: 10 }}>SELECT * = read 1 column (fast)</div>
        </div>
      </div>
    </div>
  );
}

const DIAGRAMS = {
  extraction: DiagramExtraction,
  schema: DiagramSchema,
  index: DiagramIndex,
  type: DiagramType,
  doc: DiagramDoc,
};

function DeepDive() {
  const { state, dispatch } = useGame();
  const screen = DEEPDIVE_SCREENS[state.deepDiveScreen];
  const DiagramComp = DIAGRAMS[screen.diagramType];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    setTimeout(() => setVisible(true), 50);
  }, [state.deepDiveScreen]);

  const LINKS = [
    { label: 'Apache Doris Download', url: 'https://doris.apache.org/download', color: '#ecd050' },
    { label: 'VeloDB Free Trial', url: 'https://velodb.cloud/signup', color: '#e86040' },
    { label: 'GitHub', url: 'https://github.com/apache/doris', color: '#ecd050' },
    { label: 'Doris Slack', url: 'https://doris.apache.org/slack', color: '#64c8b4' },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0818', color: '#f5efe0',
      fontFamily: 'Fredoka, sans-serif', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(10,8,25,0.95)', borderBottom: '2px solid #2a2040',
        padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        <button onClick={() => dispatch({ type: 'PLAY_AGAIN' })} style={{
          background: 'none', border: 'none', color: '#7a6a54', cursor: 'pointer',
          fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 14,
        }}>← Back</button>
        <span style={{ color: '#ecd050', fontWeight: 700, fontSize: 16, letterSpacing: '0.1em' }}>HOW DORIS DID IT</span>
        <span style={{ color: '#7a6a54', fontWeight: 600, fontSize: 13 }}>{state.deepDiveScreen + 1}/5</span>
      </div>

      {/* Dot indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px 0 0' }}>
        {DEEPDIVE_SCREENS.map((_, i) => (
          <button key={i} onClick={() => dispatch({ type: 'DEEPDIVE_NAV', dir: i - state.deepDiveScreen })} style={{
            width: i === state.deepDiveScreen ? 20 : 8, height: 8, borderRadius: 4,
            background: i === state.deepDiveScreen ? '#ecd050' : '#2a2040',
            border: 'none', cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}/>
        ))}
      </div>

      {/* Content */}
      <div style={{
        flex: 1, padding: '20px 20px 32px', maxWidth: 560, margin: '0 auto', width: '100%',
        overflowY: 'auto',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}>
        {/* Skill badge */}
        <div style={{ marginBottom: 6 }}>
          <SkillChip icon={SKILLS_LIST[state.deepDiveScreen].icon} name={SKILLS_LIST[state.deepDiveScreen].name} />
        </div>

        <h2 style={{ color: '#ecd050', fontWeight: 700, fontSize: 26, margin: '8px 0 4px' }}>{screen.title}</h2>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 14, color: '#f5efe0', opacity: 0.7, marginBottom: 20 }}>{screen.subtitle}</p>

        {/* SQL block */}
        <div style={{
          background: '#0d1220', border: '2px solid #2a2040', borderRadius: 12,
          padding: '16px', marginBottom: 20, overflowX: 'auto',
        }}>
          <pre style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.7,
            color: '#64c8b4', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>{screen.sql}</pre>
        </div>

        {/* Diagram */}
        <div style={{
          background: 'rgba(20,16,40,0.8)', border: '2px solid #2a2040',
          borderRadius: 12, padding: '16px', marginBottom: 20,
        }}>
          <div style={{ color: '#7a6a54', fontWeight: 700, fontSize: 10, letterSpacing: '0.15em', marginBottom: 12 }}>DIAGRAM</div>
          <DiagramComp />
        </div>

        {/* Takeaways */}
        <div style={{ marginBottom: 28 }}>
          {screen.bullets.map((b, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10,
            }}>
              <span style={{ color: '#64c8b4', fontWeight: 700, flexShrink: 0 }}>•</span>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: 14, color: '#f5efe0', lineHeight: 1.5 }}>{b}</span>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 28 }}>
          <CartoonBtn
            onClick={() => dispatch({ type: 'DEEPDIVE_NAV', dir: -1 })}
            disabled={state.deepDiveScreen === 0}
            color="#2a2040" size="md" style={{ color: '#ecd050', flex: 1, justifyContent: 'center' }}>
            ← Prev
          </CartoonBtn>
          {state.deepDiveScreen < 4 ? (
            <CartoonBtn
              onClick={() => dispatch({ type: 'DEEPDIVE_NAV', dir: 1 })}
              color="#ecd050" size="md" style={{ flex: 1, justifyContent: 'center' }}>
              Next →
            </CartoonBtn>
          ) : (
            <CartoonBtn
              onClick={() => dispatch({ type: 'PLAY_AGAIN' })}
              color="#e86040" size="md" style={{ flex: 1, justifyContent: 'center' }}>
              ↩ Reset
            </CartoonBtn>
          )}
        </div>

        {/* External links dock */}
        <div style={{ borderTop: '2px solid #2a2040', paddingTop: 24 }}>
          <div style={{ color: '#7a6a54', fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', marginBottom: 14 }}>LEARN MORE</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {LINKS.map(link => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                background: 'rgba(20,16,40,0.9)', border: `2px solid ${link.color}`,
                borderRadius: 10, padding: '12px', textDecoration: 'none',
                display: 'block', boxShadow: `3px 3px 0 #1a1408`,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translate(-2px,-2px)'; e.currentTarget.style.boxShadow=`5px 5px 0 #1a1408`; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=`3px 3px 0 #1a1408`; }}>
                <div style={{ color: link.color, fontWeight: 700, fontSize: 12, lineHeight: 1.3 }}>{link.label}</div>
                <div style={{ color: '#7a6a54', fontFamily: 'Nunito, sans-serif', fontSize: 10, marginTop: 4 }}>↗ Open</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VictoryModal, SettlementPage, DeepDive });
})();
