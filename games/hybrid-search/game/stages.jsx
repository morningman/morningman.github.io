// game/stages.jsx — Intro + Level 1

// ── Intro ──
function Intro() {
  const { goToStage } = useGameActions();
  function start() {
    goToStage('level1');
    setTimeout(() => scrollToStage('stage-level1'), 60);
  }
  return (
    <section id="stage-intro" className="relative mx-auto flex min-h-[100svh] w-full max-w-xl flex-col justify-center px-5 py-12">
      {/* Doris brand lockup */}
      <DorisBrand />

      {/* Slogan */}
      <h1 className="mt-8 font-display text-[2.25rem] font-black leading-[1.05] tracking-tight sm:text-5xl" style={{ textWrap:'balance' }}>
        Blend{' '}
        <Mark color="primary">FILTERS</Mark>,{' '}
        <Mark color="accent">FULL-TEXT</Mark>{' '}and{' '}
        <Mark color="highlight">VECTORS</Mark>{' '}—
        find the perfect match in <span className="whitespace-nowrap">ONE SQL</span>.
      </h1>

      {/* Mission brief */}
      <div className="cartoon-card mt-8 p-5">
        <div className="flex items-center gap-2">
          <span className="cartoon-chip cartoon-chip-highlight !text-[10px]">
            <Icon name="rocket" size={11} strokeWidth={3} /> Your mission today
          </span>
        </div>
        <p className="mt-3 font-display text-lg font-bold leading-snug sm:text-xl">
          Plan a weekend family trip and land on the <span className="underline decoration-highlight decoration-[3px] underline-offset-[3px]">one</span> stay that really fits.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          You&rsquo;ll walk three tasks — <strong className="text-ink">filter</strong> the inventory,{' '}
          <strong className="text-ink">retrieve</strong> by keywords and by meaning, then{' '}
          <strong className="text-ink">fuse</strong> the two rankings into a single best pick. Every step is an actual Doris SQL pattern.
        </p>
      </div>

      <QueryPathDiagram />

      <div className="mt-10">
        <button type="button" onClick={start} className="cartoon-btn cartoon-btn-highlight animate-cta-attention h-14 w-full justify-center text-lg">
          Start the hunt <Icon name="arrowDown" size={20} strokeWidth={3} />
        </button>
      </div>
    </section>
  );
}

function Mark({ color = 'primary', children }) {
  const bg = color === 'accent' ? 'bg-accent' : color === 'highlight' ? 'bg-highlight text-white' : 'bg-primary';
  return (
    <span className={`inline-block -rotate-1 rounded-md border-[2.5px] border-ink px-1.5 shadow-[2px_2px_0_0_theme(colors.ink)] ${bg}`}>
      {children}
    </span>
  );
}

function DorisBrand() {
  return (
    <div className="flex items-center gap-3">
      {/* Mark */}
      <div
        className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-ink bg-card shadow-[4px_4px_0_0_theme(colors.ink)]"
        style={{ transform:'rotate(-4deg)' }}>
        <img src="uploads/doris.png" alt="Apache Doris" className="h-9 w-9 object-contain" />
      </div>
      {/* Wordmark */}
      <div className="flex min-w-0 flex-col">
        <span className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Apache</span>
        <span className="font-display text-[2rem] font-black leading-none tracking-tight sm:text-[2.25rem]">Doris</span>
      </div>
      {/* Tag */}
      <span className="ml-auto cartoon-chip cartoon-chip-accent !text-[10px]" style={{ transform:'rotate(2deg)' }}>
        <Icon name="sparkles" size={11} strokeWidth={3} /> Hybrid Search
      </span>
    </div>
  );
}

function QueryPathDiagram() {
  const nodes = [
    { icon:'filter',   label:'Filter',   sub:'structured',   bg:'bg-primary',   rot:'rotate(-2deg)' },
    { icon:'radio',    label:'Retrieve', sub:'text + vector', bg:'bg-accent',    rot:'' },
    { icon:'gitMerge', label:'Fuse',     sub:'RRF',          bg:'bg-highlight',  rot:'rotate(2deg)' },
  ];
  return (
    <div className="relative mt-8 flex items-start justify-between gap-2">
      <svg aria-hidden className="absolute left-7 right-7 top-7 h-px w-[calc(100%-3.5rem)]" preserveAspectRatio="none" viewBox="0 0 100 1">
        <line x1="0" y1="0" x2="100" y2="0" stroke="#1a1408" strokeWidth="2" strokeDasharray="3 3" />
      </svg>
      {nodes.map(n => (
        <div key={n.label} className="relative flex w-1/3 flex-col items-center gap-2">
          <div className={`relative flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-ink shadow-[3px_3px_0_0_theme(colors.ink)] ${n.bg}`} style={{ transform: n.rot }}>
            <Icon name={n.icon} size={22} strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <div className="font-display text-sm font-semibold">{n.label}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{n.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Level 1 ──
// CITIES, CHECK_INS, BUDGETS are declared in data.js — reuse them here
const FRAGS = ['Harbor Inn','$289/nt','family-friendly','near attractions','quiet','Seaport','$412/nt','walkable','lake view','Pike Place','Belltown','Coronado','Balboa','$345/nt','downtown','La Jolla','Space Needle','calm vibe','beach path','zoo nearby'];
const FRAG_TONES = ['bg-primary','bg-accent','bg-highlight','bg-card'];
const FRAG_LAYOUT = [
  {top:6,left:2,w:28,delay:0.0},{top:4,left:34,w:22,delay:0.4},{top:3,left:60,w:32,delay:0.8},
  {top:22,left:8,w:20,delay:0.2},{top:20,left:30,w:30,delay:0.6},{top:18,left:64,w:26,delay:1.0},
  {top:38,left:0,w:32,delay:0.3},{top:36,left:36,w:24,delay:0.7},{top:35,left:62,w:30,delay:1.1},
  {top:54,left:6,w:26,delay:0.5},{top:52,left:34,w:28,delay:0.9},{top:51,left:64,w:24,delay:1.3},
  {top:70,left:2,w:30,delay:0.1},{top:68,left:36,w:22,delay:0.5},{top:66,left:60,w:32,delay:0.9},
  {top:84,left:8,w:24,delay:0.2},{top:82,left:34,w:30,delay:0.6},{top:80,left:66,w:26,delay:1.0},
  {top:14,left:18,w:20,delay:0.7},{top:44,left:46,w:22,delay:1.2},
];

function Level1() {
  const { state } = useGame();
  const { setCity, setCheckIn, setBudget, goToStage } = useGameActions();
  const [poolPhase, setPoolPhase] = React.useState('idle'); // idle | phase1 | phase2 | done
  const [hasRun,   setHasRun]    = React.useState(false);
  const timers = React.useRef([]);

  const canContinue = Boolean(state.city && state.checkIn && state.budget);

  // Reset when chips change
  React.useEffect(() => { setHasRun(false); setPoolPhase('idle'); }, [state.city, state.checkIn, state.budget]);
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function handleRun() {
    if (!canContinue || poolPhase !== 'idle') return;
    timers.current.forEach(clearTimeout); timers.current = [];
    setPoolPhase('phase1');
    timers.current.push(setTimeout(() => setPoolPhase('phase2'), 600));
    timers.current.push(setTimeout(() => { setPoolPhase('done'); setHasRun(true); }, 1300));
  }

  function handleContinue() {
    goToStage('level2');
    setTimeout(() => scrollToStage('stage-level2'), 60);
  }

  const shortlist = React.useMemo(() => {
    if (!state.city || !state.checkIn || !state.budget) return null;
    const combo = getCombination(state.city, state.checkIn, state.budget);
    return combo.shortlisted_hotel_ids.map(getHotel).slice(0, 5);
  }, [state.city, state.checkIn, state.budget]);

  const isLoading  = poolPhase === 'phase1' || poolPhase === 'phase2';
  const isExecuted = poolPhase === 'done';

  return (
    <section id="stage-level1" className="relative mx-auto w-full max-w-xl px-5 py-6 sm:py-10">
      <LevelHeader
        number="01"
        lead="Narrow the field"
        technique="Structured Filter"
        desc="Exact predicates shrink the 30-hotel inventory into a clean, budget-aware candidate set — before any ranking runs."
        guide="Pick a city, a check-in window, and a budget below, then run the SQL to see the pool collapse."
        color="primary"
      />

      {/* Filter panel */}
      <div className="cartoon-card mt-4 divide-y-[2px] divide-ink/80 p-0">
        <FilterRow label="City"     options={CITIES.map(c=>({value:c,label:c}))}     selected={state.city}    onSelect={setCity}    tone="primary"    />
        <FilterRow label="Check-in" options={CHECK_INS.map(c=>({value:c,label:c}))}  selected={state.checkIn} onSelect={setCheckIn} tone="accent"     />
        <FilterRow label="Budget"   options={BUDGETS.map(b=>({value:b,label:BUDGET_MAP[b].label}))} selected={state.budget}  onSelect={setBudget}  tone="highlight"  />
      </div>

      {/* SQL preview */}
      <div className="cartoon-card mt-4 p-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SQL Preview</span>
        <pre className="mt-2 overflow-x-auto rounded-xl border-[1.5px] border-ink/20 bg-ink/5 p-3 font-mono text-[11px] leading-relaxed">
          <code>
            <span className="text-muted-foreground">SELECT</span>{' '}hotel_name, nightly_price, hotel_tags{'\n'}
            <span className="text-muted-foreground">FROM</span>{' '}hotels{'\n'}
            <span className="text-muted-foreground">WHERE</span>{' '}city = <SqlVal value={state.city} ph="pick city" />{'\n'}
            {'  '}<span className="text-muted-foreground">AND</span>{' '}check_in = <SqlVal value={state.checkIn} ph="pick check-in" />{'\n'}
            {'  '}<span className="text-muted-foreground">AND</span>{' '}<SqlVal value={state.budget ? BUDGET_MAP[state.budget].sql : undefined} ph="pick budget" />;
          </code>
        </pre>
        <div className="mt-3">
          {isExecuted ? (
            <div className="flex h-10 items-center justify-center rounded-lg border-[2px] border-ink/30 bg-background px-4 text-[11px] font-bold text-muted-foreground">
              ✓ Executed · 10 rows returned
            </div>
          ) : (
            <button type="button" disabled={!canContinue || isLoading} onClick={handleRun}
              className={`cartoon-btn h-10 w-full justify-center text-xs ${canContinue && !isLoading ? 'bg-accent animate-cta-attention' : 'opacity-50 cursor-not-allowed'}`}>
              {isLoading
                ? <><span className="animate-pulse">● ● ●</span><span className="ml-2">Running…</span></>
                : <>▶ {canContinue ? 'Run Query' : 'Run Query (select all filters first)'}</>
              }
            </button>
          )}
        </div>
      </div>

      {/* Data pool / shortlist */}
      <DataPool hotels={shortlist} poolPhase={poolPhase} />

      {/* Continue */}
      <div className="mt-4 flex flex-col items-stretch gap-2">
        <button type="button" disabled={!hasRun} onClick={handleContinue} className={`cartoon-btn cartoon-btn-highlight h-12 w-full justify-center text-base sm:h-14 sm:text-lg ${hasRun ? 'animate-cta-attention' : ''}`}>
          Continue <Icon name="arrowDown" size={20} strokeWidth={3} />
        </button>
        <p className="text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {hasRun ? 'Checkpoint: Good Options reached' : canContinue ? 'Click Run Query to filter results' : '12 valid combinations · pick one in each row'}
        </p>
      </div>
    </section>
  );
}

function SqlVal({ value, ph }) {
  if (value) return <span className="rounded border-[1.5px] border-ink bg-primary px-1 font-bold not-italic">{value}</span>;
  return <span className="rounded border-[1.5px] border-dashed border-ink/40 px-1 italic text-muted-foreground">{ph}</span>;
}

function FilterRow({ label, options, selected, onSelect, tone }) {
  const activeBg = tone === 'accent' ? 'bg-accent' : tone === 'highlight' ? 'bg-highlight text-white' : 'bg-primary';
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:w-20">{label}</span>
      <div className="flex flex-1 flex-wrap gap-1.5">
        {options.map(opt => {
          const active = selected === opt.value;
          return (
            <button key={opt.value} type="button"
              onClick={() => onSelect(active ? undefined : opt.value)}
              aria-pressed={active}
              title={active ? 'Click again to clear' : undefined}
              className={`rounded-full border-[2px] border-ink px-3 py-1 text-[11px] font-bold transition-all
                ${active ? `${activeBg} shadow-[2px_2px_0_0_theme(colors.ink)] -translate-y-0.5` : 'bg-background shadow-[1.5px_1.5px_0_0_theme(colors.ink)] hover:-translate-y-0.5'}`}>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DataPool({ hotels, poolPhase }) {
  const showBlocks    = poolPhase === 'idle' || poolPhase === 'phase1';
  const showShortlist = poolPhase === 'phase2' || poolPhase === 'done';
  return (
    <div className="cartoon-card mt-4 overflow-hidden">
      {showBlocks && (
        <>
          <div className="flex items-center justify-between border-b-[3px] border-ink bg-primary px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md border-[2px] border-ink bg-card">
                <Icon name="warehouse" size={14} strokeWidth={2.8} />
              </span>
              <div className="flex flex-col">
                <span className="font-display text-sm font-bold leading-none">Hotel Candidate Pool</span>
                <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider opacity-70">Live hotel inventory · unfiltered</span>
              </div>
            </div>
            <span className="flex items-center gap-1 rounded-full border-[2px] border-ink bg-card px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-highlight" />
              30+ stays
            </span>
          </div>
          <div className="relative h-48 p-3 sm:h-56">
          {FRAG_LAYOUT.map((b, i) => (
            <span key={i}
              className={`absolute truncate rounded border-[1.5px] border-ink px-2 py-1 text-[10px] font-bold text-ink ${FRAG_TONES[i % FRAG_TONES.length]}
                ${poolPhase === 'idle' ? 'animate-drift' : i < 10 ? 'animate-block-stay' : 'animate-filter-fade'}`}
              style={{ top:`${b.top}%`, left:`${b.left}%`, width:`${b.w}%`, animationDelay: poolPhase === 'idle' ? `${b.delay}s` : `${i * 0.025}s` }}>
              {FRAGS[i]}
            </span>
          ))}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" />
          </div>
        </>
      )}
      {showShortlist && hotels && (
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="cartoon-chip cartoon-chip-primary">Shortlist · {hotels.length} stays</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">candidate set</span>
          </div>
          <div className="relative space-y-2">
            {hotels.map((h, i) => (
              <div key={h.hotel_id}
                className={`animate-crystallise-in${i === 4 ? ' [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]' : ''}`}
                style={{ animationDelay:`${i * 80}ms` }}>
                <HotelRow hotel={h} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Intro, Level1 });
