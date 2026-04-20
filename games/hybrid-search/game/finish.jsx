// game/finish.jsx — Finish, WinModal, DeepDive

const DORIS_LINK  = 'https://doris.apache.org';
const DOWNLOAD_LINK = 'https://doris.apache.org/download';
const VELODB_LINK   = 'https://velodb.cloud/signup';
const SLACK_LINK    = 'https://doris.apache.org/slack';
const GITHUB_LINK   = 'https://github.com/apache/doris';

// ── Finish ──
function Finish() {
  const { state } = useGame();
  const { openDeepDive, replay } = useGameActions();
  const [modalOpen, setModalOpen] = React.useState(false);

  const results = React.useMemo(
    () => state.city && state.budget ? getStageResults(state.city, state.budget) : null,
    [state.city, state.budget]
  );
  if (!results) return null;
  const [id1, id2, id3] = results.final_top3;
  const top1 = getHotel(id1), top2 = getHotel(id2), top3 = getHotel(id3);

  function handleDeepDive() {
    setModalOpen(false);
    openDeepDive();
    setTimeout(() => scrollToStage('stage-deepdive'), 60);
  }
  function handleReplay() {
    setModalOpen(false);
    replay();
    setTimeout(() => scrollToStage('stage-intro'), 60);
  }

  return (
    <section id="stage-finish" className="relative mx-auto w-full max-w-xl px-5 py-10">
      {/* Persistent win card */}
      <div className="cartoon-card relative p-5">
        <div className="absolute -top-4 left-5 flex items-center gap-1.5 rounded-full border-[2.5px] border-ink bg-highlight px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-[2px_2px_0_0_theme(colors.ink)]">
          <Icon name="crown" size={13} strokeWidth={3} /> Best Match · 100%
        </div>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{top1.hotel_name}</h2>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">{top1.location_line}</p>
        <div className="cartoon-card-sm mt-4 flex items-center gap-3 p-3">
          <Illustration hotel={top1} size="md" />
          <div className="min-w-0 flex-1">
            <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">{top1.hotel_description}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 cartoon-chip cartoon-chip-accent !text-[10px]">
              <Icon name="sparkles" size={11} strokeWidth={3} /> Filter · Text · Vector
            </span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <SmallCard rank={2} hotel={top2} />
          <SmallCard rank={3} hotel={top3} />
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <button type="button" onClick={() => setModalOpen(true)} className="cartoon-btn cartoon-btn-highlight animate-cta-attention h-12 w-full justify-center">
            Show result summary <Icon name="arrowRight" size={18} strokeWidth={3} />
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={handleDeepDive} className="cartoon-btn cartoon-btn-ghost h-11 flex-1 justify-center text-sm">
              See how Doris did it
            </button>
            <button type="button" onClick={handleReplay} aria-label="Replay" className="cartoon-btn cartoon-btn-ghost h-11 justify-center px-3">
              <Icon name="rotateCcw" size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
      {modalOpen && (
        <WinModal top1={top1} top2={top2} top3={top3} city={state.city} budget={state.budget}
          onClose={() => setModalOpen(false)} onDeepDive={handleDeepDive} onReplay={handleReplay} />
      )}
    </section>
  );
}

function SmallCard({ rank, hotel }) {
  return (
    <div className="cartoon-card-sm flex items-center gap-2 p-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-[2px] border-ink bg-accent font-display text-sm font-bold">{rank}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold">{hotel.hotel_name}</p>
        <p className="text-[10px] text-muted-foreground">${hotel.nightly_price}/nt</p>
      </div>
    </div>
  );
}

function WinModal({ top1, top2, top3, city, budget, onClose, onDeepDive, onReplay }) {
  // Prevent background scroll when modal open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 px-4 pb-4 sm:items-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cartoon-card w-full max-w-sm overflow-y-auto p-6" style={{ maxHeight:'92svh', animation:'fadeSlideIn 300ms ease-out both' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="cartoon-chip cartoon-chip-highlight" style={{ animation:'bob 4s ease-in-out infinite' }}>
            <Icon name="crown" size={12} strokeWidth={3} /> Best Match Found
          </span>
          <button type="button" onClick={onClose} className="rounded-full border-[2px] border-ink bg-card px-2.5 py-1 text-[11px] font-bold shadow-[2px_2px_0_0_theme(colors.ink)] hover:-translate-y-0.5 transition-transform">
            ✕
          </button>
        </div>
        <h2 className="mt-3 font-display text-2xl font-bold leading-tight">{top1.hotel_name}</h2>
        <p className="text-xs font-semibold text-muted-foreground">{city} · {budget ? BUDGET_MAP[budget].label : ''}</p>

        {/* Primary card */}
        <div className="mt-4 rounded-2xl border-[3px] border-ink bg-primary p-3 shadow-[3px_3px_0_0_theme(colors.ink)]">
          <div className="flex items-center gap-3">
            <Illustration hotel={top1} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-display text-base font-semibold">{top1.hotel_name}</span>
                <span className="shrink-0 font-mono text-xs font-bold">${top1.nightly_price}/nt</span>
              </div>
              <p className="truncate text-xs font-semibold">{top1.location_line}</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed opacity-80">{top1.hotel_description}</p>
        </div>

        {/* Runners-up */}
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <HotelRow hotel={top2} />
          <HotelRow hotel={top3} />
        </div>

        <p className="mt-3 rounded-xl border-[2px] border-ink bg-background px-3 py-2 text-xs font-semibold leading-relaxed">
          Apache Doris can filter, retrieve, and fuse in one flow.
        </p>

        {/* CTAs */}
        <div className="mt-4 flex flex-col gap-2">
          <a href={DORIS_LINK} className="cartoon-btn cartoon-btn-highlight animate-cta-attention h-12 w-full justify-center text-sm sm:text-base">
            Continue learning about Hybrid Search <Icon name="externalLink" size={15} strokeWidth={3} />
          </a>
          <div className="flex gap-2">
            <button type="button" onClick={onDeepDive} className="cartoon-btn cartoon-btn-ghost flex-1 justify-center text-sm">
              See how Doris did it
            </button>
            <button type="button" onClick={onReplay} aria-label="Replay" className="cartoon-btn cartoon-btn-ghost shrink-0 justify-center px-3">
              <Icon name="rotateCcw" size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Deep Dive ──
const DD_SCREENS = [
  {
    id:1, title:'Table View', iconName:'table',
    subtitle:'Doris stores structured fields, searchable text, and vector fields in the same table.',
    sql: () => `CREATE TABLE hotels (
  hotel_id              VARCHAR(16),
  city                  VARCHAR(32),
  check_in_window       VARCHAR(16),
  nightly_price         DECIMAL(6, 2),
  budget_band           VARCHAR(16),
  hotel_name            VARCHAR(128),
  hotel_tags            ARRAY<STRING>,
  hotel_description     TEXT,
  description_embedding ARRAY<FLOAT>,
  INDEX idx_desc (hotel_description)     USING INVERTED,
  INDEX idx_tags (hotel_tags)            USING INVERTED,
  INDEX idx_emb  (description_embedding) USING ANN
)
DUPLICATE KEY(hotel_id)
DISTRIBUTED BY HASH(hotel_id) BUCKETS 8;`,
    explain:['One table. Three field groups — all co-located.','Structured columns drive filters. Text columns drive BM25. Vector column drives ANN.'],
  },
  {
    id:2, title:'Structured Filter', iconName:'filter',
    subtitle:'Doris first narrows the search space with exact conditions.',
    sql: ctx => `CREATE VIEW hotel_candidates AS\nSELECT hotel_id, hotel_name, nightly_price,\n       hotel_description, hotel_tags,\n       description_embedding\nFROM hotels\nWHERE city = '${ctx.city}'\n  AND check_in_window = '${ctx.checkIn === 'This weekend' ? 'this_weekend' : 'next_weekend'}'\n  AND ${BUDGET_MAP[ctx.budget].sql};`,
    explain:['Structured predicates shrink the pool first.','Downstream retrieval only runs on this candidate view.'],
  },
  {
    id:3, title:'Text Retrieval', iconName:'search',
    subtitle:'Doris runs full-text search on the filtered candidate set.',
    sql: () => `SELECT hotel_id, hotel_name, score() AS bm25\nFROM hotel_candidates\nWHERE hotel_description MATCH_ANY\n      'quiet family-friendly attractions'\n   OR hotel_tags MATCH_ANY\n      'quiet family-friendly attractions'\nORDER BY score() DESC\nLIMIT 3;`,
    explain:['Inverted index over description and tags.','BM25 ranks lexical hits → Text Top 3.'],
  },
  {
    id:4, title:'Semantic Retrieval', iconName:'sparkles',
    subtitle:'Doris runs vector search on the same candidate view.',
    sql: () => `SELECT hotel_id, hotel_name,\n       l2_distance_approximate(\n         description_embedding,\n         [query_vector]\n       ) AS dist\nFROM hotel_candidates\nORDER BY dist ASC\nLIMIT 3;`,
    explain:['ANN over description embeddings on the same view.','Returns stays whose meaning matches the query → Semantic Top 3.'],
  },
  {
    id:5, title:'RRF Fusion', iconName:'gitMerge',
    subtitle:'Doris fuses the two ranked result sets into one final Top 3.',
    sql: () => `WITH fused AS (\n  SELECT hotel_id,\n         SUM(1.0 / (60 + rank)) AS rrf_score\n  FROM (\n    SELECT hotel_id, text_rank     AS rank FROM text_top3\n    UNION ALL\n    SELECT hotel_id, semantic_rank AS rank FROM semantic_top3\n  ) ranked_results\n  GROUP BY hotel_id\n)\nSELECT hotel_id, rrf_score\nFROM fused\nORDER BY rrf_score DESC\nLIMIT 3;`,
    explain:['RRF combines rankings, not raw scores.','Results appearing in both lists float to the top.'],
  },
];

const SQL_KEYWORDS = new Set([
  'SELECT','FROM','WHERE','AND','OR','AS','CREATE','VIEW','UNION','ALL','GROUP','BY',
  'ORDER','LIMIT','DESC','ASC','WITH','ON','INNER','LEFT','RIGHT','JOIN','MATCH_ANY',
  'IS','NULL','NOT','BETWEEN','IN','LIKE','DISTINCT','HAVING','CASE','WHEN','THEN',
  'ELSE','END','INTO','VALUES','INSERT','UPDATE','DELETE','SET','TRUE','FALSE',
  'TABLE','INDEX','USING','KEY','DUPLICATE','DISTRIBUTED','HASH','BUCKETS'
]);
const SQL_TOKEN_RE = /('[^']*')|(--[^\n]*)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|([^\s\w'])/g;

function SqlBlock({ code }) {
  const parts = React.useMemo(() => {
    const out = [];
    let m, key = 0;
    SQL_TOKEN_RE.lastIndex = 0;
    while ((m = SQL_TOKEN_RE.exec(code)) !== null) {
      const [full, str, comment, num, word, ws, punct] = m;
      if (str !== undefined)          out.push({ k:key++, c:'text-[#ff9d7a]', v:full });
      else if (comment !== undefined) out.push({ k:key++, c:'text-[#8a8272] italic', v:full });
      else if (num !== undefined)     out.push({ k:key++, c:'text-accent', v:full });
      else if (word !== undefined) {
        if (SQL_KEYWORDS.has(word.toUpperCase())) out.push({ k:key++, c:'text-primary font-bold', v:full });
        else if (full === full.toUpperCase() && full.length > 1 && /[A-Z_]+/.test(full)) out.push({ k:key++, c:'text-accent', v:full });
        else out.push({ k:key++, c:'text-background', v:full });
      } else if (ws !== undefined)    out.push({ k:key++, c:'', v:full });
      else                            out.push({ k:key++, c:'text-background/70', v:full });
    }
    return out;
  }, [code]);

  return (
    <pre className="mt-4 overflow-x-auto rounded-xl border-[3px] border-ink bg-ink p-3 font-mono text-[11px] leading-relaxed text-background shadow-[3px_3px_0_0_theme(colors.ink)]">
      <code>{parts.map(p => <span key={p.k} className={p.c}>{p.v}</span>)}</code>
    </pre>
  );
}

function DeepDive() {
  const { state } = useGame();
  const { setDeepDiveScreen, goToStage } = useGameActions();

  const ctx = React.useMemo(() => {
    if (!state.city || !state.checkIn || !state.budget) return null;
    return { city: state.city, checkIn: state.checkIn, budget: state.budget };
  }, [state.city, state.checkIn, state.budget]);
  if (!ctx) return null;

  const screen = DD_SCREENS[state.deepDiveScreen - 1] ?? DD_SCREENS[0];
  const isFirst = state.deepDiveScreen === 1;
  const isLast  = state.deepDiveScreen === DD_SCREENS.length;

  function next() { if (!isLast)  setDeepDiveScreen(state.deepDiveScreen + 1); }
  function prev() { if (!isFirst) setDeepDiveScreen(state.deepDiveScreen - 1); }
  function back() {
    goToStage('level3');
    setTimeout(() => scrollToStage('stage-level3'), 60);
  }

  return (
    <section id="stage-deepdive" className="relative mx-auto w-full max-w-xl px-5 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={back} className="inline-flex items-center gap-1 rounded-full border-[2px] border-ink bg-card px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0_0_theme(colors.ink)] transition-transform hover:-translate-y-0.5">
          <Icon name="arrowLeft" size={13} strokeWidth={3} /> Back
        </button>
        <span className="cartoon-chip cartoon-chip-primary !text-[10px]">
          Deep Dive · {state.deepDiveScreen} / {DD_SCREENS.length}
        </span>
      </div>

      {/* Progress dots */}
      <div className="mt-4 flex gap-1.5">
        {DD_SCREENS.map(s => (
          <button key={s.id} type="button" onClick={() => setDeepDiveScreen(s.id)}
            className={`h-3 flex-1 rounded-full border-[2px] border-ink transition-colors
              ${s.id === state.deepDiveScreen ? 'bg-highlight' : s.id < state.deepDiveScreen ? 'bg-primary' : 'bg-card'}`} />
        ))}
      </div>

      {/* Screen body */}
      <div className="mt-6" key={screen.id} style={{ animation:'fadeSlideIn 300ms ease-out both' }}>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border-[2.5px] border-ink bg-primary shadow-[2px_2px_0_0_theme(colors.ink)]">
            <Icon name={screen.iconName} size={15} strokeWidth={2.8} />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Screen {screen.id} · Doris Internals</span>
        </div>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{screen.title}</h2>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-muted-foreground">{screen.subtitle}</p>

        {screen.sql && <SqlBlock code={screen.sql(ctx)} />}

        {/* Placeholder diagram */}
        {screen.id === 1 && <TableViewDiagram />}
        {screen.id === 2 && <FlowDiagram from="hotels · 30" arrow="WHERE" to="candidates · 10" toColor="bg-primary" />}
        {screen.id === 3 && <FlowDiagram from="candidates · 10" arrow="BM25" to="text_top3 · 3" toColor="bg-primary" />}
        {screen.id === 4 && <FlowDiagram from="candidates · 10" arrow="ANN" to="semantic_top3 · 3" toColor="bg-accent" />}
        {screen.id === 5 && <FusionDiagram />}

        <ul className="mt-4 space-y-2">
          {screen.explain.map(line => (
            <li key={line} className="flex items-start gap-2 text-sm font-semibold text-muted-foreground">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full border-[1.5px] border-ink bg-highlight" />
              {line}
            </li>
          ))}
        </ul>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex gap-2">
        <button type="button" onClick={prev} disabled={isFirst} className="cartoon-btn cartoon-btn-ghost h-12 flex-1 justify-center">
          <Icon name="arrowLeft" size={16} strokeWidth={3} /> Prev
        </button>
        {isLast
          ? <button type="button" onClick={back} className="cartoon-btn h-12 flex-1 justify-center"><Icon name="arrowLeft" size={16} strokeWidth={3} /> Back to ranking</button>
          : <button type="button" onClick={next} className="cartoon-btn h-12 flex-1 justify-center">Next <Icon name="arrowRight" size={16} strokeWidth={3} /></button>
        }
      </div>

      {/* External resource dock — visually distinct from in-game CTAs */}
      <div className="mt-6 rounded-2xl border-[3px] border-ink bg-ink p-4 shadow-[4px_4px_0_0_theme(colors.ink)]">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md border-[2px] border-background bg-highlight">
            <Icon name="externalLink" size={12} strokeWidth={3} className="text-white" />
          </span>
          <span className="font-display text-sm font-bold text-background">Try it yourself</span>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-background/60">external</span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <a href={DOWNLOAD_LINK} target="_blank" rel="noopener noreferrer"
            className="group flex items-center justify-between gap-2 rounded-xl border-[2px] border-background bg-card px-3 py-2.5 transition-transform hover:-translate-y-0.5 hover:-translate-x-0.5">
            <div className="flex min-w-0 items-center gap-2">
              <Icon name="download" size={18} strokeWidth={2.8} className="shrink-0 text-ink" />
              <div className="min-w-0">
                <div className="font-display text-[13px] font-bold leading-none text-ink">Apache Doris</div>
                <div className="mt-1 truncate font-mono text-[10px] font-semibold text-muted-foreground">doris.apache.org/download</div>
              </div>
            </div>
            <Icon name="externalLink" size={14} strokeWidth={2.8} className="shrink-0 text-ink/60 transition-colors group-hover:text-highlight" />
          </a>
          <a href={VELODB_LINK} target="_blank" rel="noopener noreferrer"
            className="group flex items-center justify-between gap-2 rounded-xl border-[2px] border-background bg-highlight px-3 py-2.5 text-white transition-transform hover:-translate-y-0.5 hover:-translate-x-0.5">
            <div className="flex min-w-0 items-center gap-2">
              <Icon name="rocket" size={18} strokeWidth={2.8} className="shrink-0" />
              <div className="min-w-0">
                <div className="font-display text-[13px] font-bold leading-none">VeloDB Free Trial</div>
                <div className="mt-1 truncate font-mono text-[10px] font-semibold opacity-80">velodb.cloud/signup</div>
              </div>
            </div>
            <Icon name="externalLink" size={14} strokeWidth={2.8} className="shrink-0 opacity-70 transition-opacity group-hover:opacity-100" />
          </a>
        </div>

        {/* GitHub Star + Slack community CTAs — side by side */}
        <div className="mt-3 border-t-[2px] border-background/20 pt-3">
          <p className="mb-2 text-[11px] font-semibold leading-relaxed text-background/70">
            Enjoyed the demo? Star Apache Doris on GitHub or join the community on Slack.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <a href={GITHUB_LINK} target="_blank" rel="noopener noreferrer"
              className="group flex items-center justify-between gap-2 rounded-xl border-[2px] border-background bg-primary px-3 py-2.5 text-ink animate-cta-attention transition-transform hover:-translate-y-0.5 hover:-translate-x-0.5">
              <div className="flex min-w-0 items-center gap-2">
                <Icon name="github" size={18} strokeWidth={2.8} className="shrink-0" />
                <div className="min-w-0">
                  <div className="font-display text-[13px] font-bold leading-none">⭐ Star on GitHub</div>
                  <div className="mt-1 truncate font-mono text-[10px] font-semibold text-ink/70">github.com/apache/doris</div>
                </div>
              </div>
              <Icon name="externalLink" size={14} strokeWidth={2.8} className="shrink-0 text-ink/60 transition-colors group-hover:text-ink" />
            </a>
            <a href={SLACK_LINK} target="_blank" rel="noopener noreferrer"
              className="group flex items-center justify-between gap-2 rounded-xl border-[2px] border-background bg-accent px-3 py-2.5 text-ink transition-transform hover:-translate-y-0.5 hover:-translate-x-0.5">
              <div className="flex min-w-0 items-center gap-2">
                <Icon name="hash" size={18} strokeWidth={2.8} className="shrink-0" />
                <div className="min-w-0">
                  <div className="font-display text-[13px] font-bold leading-none">Join Doris Slack</div>
                  <div className="mt-1 truncate font-mono text-[10px] font-semibold text-ink/70">doris.apache.org/slack</div>
                </div>
              </div>
              <Icon name="externalLink" size={14} strokeWidth={2.8} className="shrink-0 text-ink/60 transition-colors group-hover:text-ink" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Diagram helpers ──
function DiagramBase({ children, tall }) {
  return (
    <div className={`cartoon-card mt-4 overflow-hidden p-4 ${tall ? 'min-h-[220px]' : ''}`}>
      <div className="relative w-full overflow-hidden rounded-xl border-[2.5px] border-ink bg-background" style={{ minHeight: tall ? 200 : 120 }}>
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage:'radial-gradient(#1a1408 0.8px,transparent 1px)', backgroundSize:'14px 14px' }} />
        <div className="relative flex h-full w-full items-center justify-center gap-4 p-4">{children}</div>
      </div>
    </div>
  );
}

function TableViewDiagram() {
  const groups = [
    { label:'Structured', color:'bg-primary', fields:['city','nightly_price','budget_band'] },
    { label:'Text',       color:'bg-accent',  fields:['hotel_description','hotel_tags'] },
    { label:'Vector',     color:'bg-highlight text-white', fields:['image_embedding','description_embedding'] },
  ];
  return (
    <DiagramBase tall>
      <div className="flex w-full flex-col gap-2 sm:flex-row">
        {groups.map(g => (
          <div key={g.label} className={`flex flex-1 flex-col rounded-xl border-[2px] border-ink p-2 shadow-[2px_2px_0_0_theme(colors.ink)] ${g.color}`}>
            <span className="text-[9px] font-bold uppercase tracking-widest">{g.label}</span>
            <div className="mt-1 flex flex-col gap-1">
              {g.fields.map(f => (
                <span key={f} className="truncate rounded-md border-[1.5px] border-ink bg-card px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink">{f}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DiagramBase>
  );
}

function FlowDiagram({ from, arrow, to, toColor }) {
  return (
    <DiagramBase>
      <div className="flex h-full w-full items-center justify-between gap-2">
        <div className="flex h-20 flex-1 flex-col items-center justify-center rounded-xl border-[2.5px] border-ink bg-card shadow-[3px_3px_0_0_theme(colors.ink)]">
          <span className="px-1 text-center text-[10px] font-bold uppercase tracking-wider">{from}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-[2px] border-ink bg-highlight shadow-[2px_2px_0_0_theme(colors.ink)]">
            <Icon name="arrowRight" size={14} strokeWidth={3} className="text-white" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest">{arrow}</span>
        </div>
        <div className={`flex h-20 flex-1 flex-col items-center justify-center rounded-xl border-[2.5px] border-ink shadow-[3px_3px_0_0_theme(colors.ink)] ${toColor}`}>
          <span className="px-1 text-center text-[10px] font-bold uppercase tracking-wider">{to}</span>
        </div>
      </div>
    </DiagramBase>
  );
}

function FusionDiagram() {
  return (
    <DiagramBase>
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex h-12 w-28 items-center justify-center rounded-xl border-[2px] border-ink bg-primary text-center text-[10px] font-bold uppercase tracking-wider shadow-[2px_2px_0_0_theme(colors.ink)]">text_top3 · 3</div>
          <div className="flex h-12 w-28 items-center justify-center rounded-xl border-[2px] border-ink bg-accent text-center text-[10px] font-bold uppercase tracking-wider shadow-[2px_2px_0_0_theme(colors.ink)]">semantic_top3 · 3</div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-[2px] border-ink bg-highlight shadow-[2px_2px_0_0_theme(colors.ink)]">
            <Icon name="arrowRight" size={14} strokeWidth={3} className="text-white" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest">RRF</span>
        </div>
        <div className="flex h-20 flex-1 items-center justify-center rounded-xl border-[2.5px] border-ink bg-highlight text-center text-[10px] font-bold uppercase tracking-wider text-white shadow-[3px_3px_0_0_theme(colors.ink)]">
          final_top3 · 3
        </div>
      </div>
    </DiagramBase>
  );
}

Object.assign(window, { Finish, DeepDive });
