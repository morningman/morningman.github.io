// game/ui.jsx — shared UI components

// ── SVG icon data ──
const ICON_SVG = {
  arrowDown:    `<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>`,
  arrowRight:   `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
  arrowLeft:    `<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>`,
  crown:        `<path d="M2 19V9l10-6 10 6v10H2z"/><polyline points="2 9 12 15 22 9"/>`,
  sparkles:     `<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4M22 5h-4M4 17v2M5 18H3"/>`,
  gitMerge:     `<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>`,
  search:       `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>`,
  brain:        `<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588 4 4 0 0 0 7.967 1.517A3 3 0 1 0 15 13a4 4 0 0 0 0-8z"/><path d="M9 13a4.5 4.5 0 0 0 3 4"/>`,
  filter:       `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>`,
  radio:        `<circle cx="12" cy="12" r="2"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14m14.14 0a10 10 0 0 0 0-14.14M7.76 7.76a6 6 0 0 0 0 8.49m8.49 0a6 6 0 0 0 0-8.49"/>`,
  rotateCcw:    `<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><polyline points="3 3 3 8 8 8"/>`,
  externalLink: `<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>`,
  database:     `<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>`,
  download:     `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>`,
  rocket:       `<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>`,
  anchor:       `<circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>`,
  leaf:         `<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>`,
  building:     `<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/>`,
  palmtree:     `<path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4"/><path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3"/><path d="M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35z"/><path d="M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-10-2-10z"/>`,
  warehouse:    `<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><rect width="8" height="8" x="8" y="14"/>`,
  table:        `<path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>`,
  check:        `<polyline points="20 6 9 17 4 12"/>`,
  edit:         `<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>`,
  alertTriangle:`<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  hash:         `<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>`,
  star:         `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
  github:       `<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>`,
};

function Icon({ name, size = 20, strokeWidth = 2.5, className = '' }) {
  const d = ICON_SVG[name];
  if (!d) return null;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      className={className}
      dangerouslySetInnerHTML={{ __html: d }}
    />
  );
}

// ── Illustration ──
const ILLUS_ICON = { harbor:'anchor', park:'leaf', skyline:'building', beach:'palmtree', garden:'leaf', loft:'warehouse' };
const ILLUS_BG   = { harbor:'bg-accent', park:'bg-accent', skyline:'bg-primary', beach:'bg-highlight', garden:'bg-primary', loft:'bg-highlight' };

function Illustration({ hotel, size = 'md' }) {
  const key  = hotel.illustration_key;
  const icon = ILLUS_ICON[key] || 'anchor';
  const bg   = ILLUS_BG[key] || 'bg-accent';
  const dim  = size === 'sm' ? 'h-10 w-10' : size === 'lg' ? 'h-20 w-20' : 'h-14 w-14';
  const iSz  = size === 'sm' ? 18 : size === 'lg' ? 36 : 24;
  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border-[3px] border-ink shadow-[3px_3px_0_0_theme(colors.ink)] ${bg} ${dim}`} aria-hidden>
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage:'radial-gradient(#1a1408 0.9px,transparent 1.2px)', backgroundSize:'8px 8px' }} />
      <span className="relative text-ink"><Icon name={icon} size={iSz} strokeWidth={2.5} /></span>
    </div>
  );
}

// ── HotelRow ──
function HotelRow({ hotel, highlight, reasonTags, reasonAccent }) {
  return (
    <div className={`cartoon-card-sm cartoon-card-lift flex items-center gap-2.5 px-2.5 py-2.5${highlight ? ' !bg-primary' : ''}`}>
      <Illustration hotel={hotel} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="truncate text-sm font-bold">{hotel.hotel_name}</h4>
          <span className="shrink-0 font-mono text-xs font-bold">${hotel.nightly_price}<span className="opacity-60">/nt</span></span>
        </div>
        <p className="truncate text-xs text-muted-foreground">{hotel.location_line}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {hotel.hotel_tags.map(t => (
            <span key={t} className="rounded-full border-[1.5px] border-ink bg-background px-1.5 py-0.5 text-[10px] font-bold">{t}</span>
          ))}
          {reasonTags && reasonTags.map(t => (
            <span key={t} className={`rounded-full border-[1.5px] border-ink px-1.5 py-0.5 text-[10px] font-bold ${reasonAccent === 'accent' ? 'bg-accent' : 'bg-highlight text-white'}`}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── LevelHeader (Task header card) ──
function LevelHeader({ number, technique, lead, desc, guide, color = 'primary' }) {
  const isHighlight = color === 'highlight';
  const bg = color === 'accent' ? 'bg-accent' : isHighlight ? 'bg-highlight text-white' : 'bg-primary';
  return (
    <div className="cartoon-card overflow-hidden p-0">
      <div className={`px-4 pt-3 pb-4 ${bg}`}>
        <div className="flex items-center gap-2">
          <span className="rounded-full border-[2px] border-ink bg-card px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-ink shadow-[2px_2px_0_0_theme(colors.ink)]">
            Task · {number}
          </span>
          {lead && (
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isHighlight ? 'text-white/85' : 'text-ink/70'}`}>
              {lead}
            </span>
          )}
        </div>
        <h2 className="mt-2 font-display text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl">
          {technique}
        </h2>
        {desc && (
          <p className={`mt-2 text-sm font-semibold leading-snug ${isHighlight ? 'text-white/90' : 'text-ink/80'}`}>
            {desc}
          </p>
        )}
      </div>
      {guide && (
        <div className={`flex items-start gap-2 border-t-[3px] border-ink px-4 py-2.5 ${isHighlight ? 'bg-ink text-background' : 'bg-background'}`}>
          <Icon name="arrowRight" size={14} strokeWidth={3} className={`mt-0.5 shrink-0 ${isHighlight ? 'text-primary' : 'text-highlight'}`} />
          <span className="text-[12px] font-semibold leading-snug">{guide}</span>
        </div>
      )}
    </div>
  );
}

// ── StageSummary ──
function StageSummary({ title, checkpoint, summary, onEdit }) {
  return (
    <div className="cartoon-card-sm flex items-start justify-between gap-3 p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="cartoon-chip cartoon-chip-primary !text-[10px] !py-0.5 !px-2">
            <Icon name="check" size={11} strokeWidth={3} />
            Done
          </span>
          <span className="text-xs font-bold text-foreground truncate">{title}</span>
        </div>
        {checkpoint && (
          <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">⊕ {checkpoint}</span>
        )}
        <p className="mt-1 text-[11px] text-muted-foreground leading-snug truncate">{summary}</p>
      </div>
      {onEdit && (
        <button type="button" onClick={onEdit} className="shrink-0 flex items-center gap-1 rounded-full border-[2px] border-ink bg-card px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-[2px_2px_0_0_theme(colors.ink)] transition-transform hover:-translate-y-0.5">
          <Icon name="edit" size={11} strokeWidth={3} /> Edit
        </button>
      )}
    </div>
  );
}

// ── MatchConfidence (desktop sidebar) ──
function MatchConfidence() {
  const { confidence, state } = useGame();
  if (state.stage === 'deepdive') return null;
  const hitGood = confidence >= 50;
  const hitBest = confidence >= 100;
  return (
    <aside className="pointer-events-none fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-2 sm:flex" aria-label="Match Confidence">
      <span className="cartoon-chip cartoon-chip-primary !text-[9px] !px-2 !py-0.5 uppercase tracking-widest">Match</span>
      <div className="relative h-64 w-5 overflow-hidden rounded-full border-[3px] border-ink bg-card shadow-[3px_3px_0_0_theme(colors.ink)]">
        <div className="absolute inset-x-0 bottom-0 bg-highlight transition-[height] duration-700 ease-out" style={{ height: `${confidence}%` }} />
        <span className={`absolute left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-full transition-colors ${hitGood ? 'bg-ink' : 'bg-ink/20'}`} style={{ bottom: 'calc(50% - 1.5px)' }} aria-hidden />
        <span className={`absolute left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-full transition-colors ${hitBest ? 'bg-ink' : 'bg-ink/20'}`} style={{ bottom: 'calc(100% - 3px)' }} aria-hidden />
      </div>
      <div className="flex flex-col items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider">
        <span className={hitBest ? 'text-foreground' : 'text-muted-foreground'}>Best</span>
        <span className={hitGood && !hitBest ? 'text-foreground' : 'text-muted-foreground'}>Good</span>
      </div>
    </aside>
  );
}

// ── MatchConfidenceMobile (sticky top bar) ──
function MatchConfidenceMobile() {
  const { confidence, state } = useGame();
  if (state.stage === 'deepdive') return null;
  const hitGood = confidence >= 50;
  const hitBest = confidence >= 100;
  return (
    <div className="fixed inset-x-0 top-0 z-30 border-b-[3px] border-ink bg-background/95 backdrop-blur-md shadow-[0_2px_0_0_rgba(26,20,8,0.08)] sm:hidden">
      <div className="flex items-center gap-3 px-4 py-2">
        <span className="text-[10px] font-bold uppercase tracking-widest shrink-0">Match</span>
        <div className="relative h-3 flex-1 overflow-hidden rounded-full border-[2px] border-ink bg-card">
          <div className="absolute inset-y-0 left-0 bg-highlight transition-[width] duration-700 ease-out" style={{ width: `${confidence}%` }} />
          <span className={`absolute top-0 h-3 w-[2px] -translate-x-1/2 ${hitGood ? 'bg-ink' : 'bg-ink/30'}`} style={{ left: '50%' }} aria-hidden />
          <span className={`absolute top-0 h-3 w-[2px] ${hitBest ? 'bg-ink' : 'bg-ink/30'}`} style={{ right: 0 }} aria-hidden />
        </div>
        <span className="font-mono text-xs font-bold tabular-nums shrink-0">{Math.round(confidence)}%</span>
      </div>
    </div>
  );
}

Object.assign(window, { Icon, Illustration, HotelRow, LevelHeader, StageSummary, MatchConfidence, MatchConfidenceMobile });
