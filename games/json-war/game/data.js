// JSON War — Game Data
// All level definitions, boss data, tech insights, deepdive content

const LEVELS = [
  {
    id: 1,
    bossName: 'JSON Giant',
    bossType: 'giant',
    flavorText: 'One JSON blob. Gigabytes deep. Parsed end-to-end on every query...',
    maxHp: 100,
    skill: { name: 'Subcolumn Extraction', icon: '⚡', label: 'HIGH-SPEED CANNON' },
    defeatReason: 'JSON payload is too large — every parse takes forever.',
    normalVolleysBeforeRetreat: 3,
    normalDamagePerVolley: 1,
    upgradedDamagePerVolley: 34,
    upgradedVolleys: 3,
    bossAttackName: 'Giant Missile',
    techInsight: {
      challenge: 'Traditional JSON storage parses the entire string per query — one field request reads everything.',
      solution: 'Subcolumn Extraction stores each JSON field as an independent column. Queries only read needed columns — columnar performance.',
    },
  },
  {
    id: 2,
    bossName: 'Inflation Beast',
    bossType: 'inflation',
    flavorText: 'It grows with every hit...',
    maxHp: 100,
    skill: { name: 'Schema Lock', icon: '🔒', label: 'SCHEMA FREEZE' },
    defeatReason: 'The beast grows with each hit — without a schema, it inflates endlessly.',
    normalVolleysBeforeRetreat: 3,
    normalDamagePerVolley: 0,
    upgradedDamagePerVolley: 34,
    upgradedVolleys: 3,
    bossAttackName: 'Shockwave Ring',
    techInsight: {
      challenge: 'Unrestricted subcolumn extraction causes column explosion — hundreds of dynamic columns balloon storage and slow every query.',
      solution: 'Schema Template applies type constraints to specific paths (e.g. $.price → DECIMAL). Unconstrained paths remain flexible.',
    },
  },
  {
    id: 3,
    bossName: 'Invisible Phantom',
    bossType: 'phantom',
    flavorText: "You can't hit what you can't see...",
    maxHp: 100,
    skill: { name: 'Index Vision', icon: '👁', label: 'X-RAY SCANNER' },
    defeatReason: 'Without indexes, bullets miss 70% of the time — full table scans on every shot.',
    normalVolleysBeforeRetreat: 3,
    normalDamagePerVolley: 1,
    upgradedDamagePerVolley: 34,
    upgradedVolleys: 3,
    bossAttackName: 'Shadow Slash',
    techInsight: {
      challenge: 'Without indexes, queries must scan every row. Even a simple WHERE on a VARIANT column becomes a full-table scan.',
      solution: 'Doris supports BloomFilter (equality filtering) and Inverted Index (full-text search) directly on VARIANT columns.',
    },
  },
  {
    id: 4,
    bossName: 'Shapeshifter',
    bossType: 'shapeshifter',
    flavorText: 'Formless. Unpredictable...',
    maxHp: 100,
    skill: { name: 'Type Anchor', icon: '⚓', label: 'ARMOR PIERCER' },
    defeatReason: 'The boss shifts form on contact — type mismatches block 67% of all hits.',
    normalVolleysBeforeRetreat: 3,
    normalDamagePerVolley: 1,
    upgradedDamagePerVolley: 34,
    upgradedVolleys: 3,
    bossAttackName: 'Form Dash',
    techInsight: {
      challenge: 'The same JSON path can hold different types across records (e.g. $.status is INT in one row, STRING in another), causing expensive runtime type checks.',
      solution: 'Type Promotion automatically upgrades incompatible types to JSONB, eliminating type uncertainty and runtime casting overhead.',
    },
  },
  {
    id: 5,
    bossName: 'Element Legion',
    bossType: 'legion',
    flavorText: 'Nine minds, one swarm...',
    maxHp: 100,
    unitCount: 9,
    unitHp: 11,
    skill: { name: 'DOC Mode', icon: '💥', label: 'AOE SHOCKWAVE' },
    defeatReason: 'Single-target fire kills one unit at a time — 6 survive and swarm.',
    normalVolleysBeforeRetreat: 3,
    normalDamagePerVolley: 11,
    upgradedDamagePerVolley: 100, // AOE hits all
    upgradedVolleys: 1,
    bossAttackName: 'Cluster Barrage',
    techInsight: {
      challenge: 'With Subcolumn Extraction, SELECT * must re-assemble the full JSON from individual columns — slow for wide rows.',
      solution: 'DOC Mode stores the complete JSON document alongside subcolumns. SELECT * returns the pre-stored document directly — no re-assembly needed.',
    },
  },
];

const DEEPDIVE_SCREENS = [
  {
    id: 1,
    title: 'Subcolumn Extraction',
    subtitle: 'Store each JSON field as an independent column',
    sql: `SELECT metadata['geo']['city'], COUNT(*) AS req_count
FROM api_logs
WHERE timestamp >= '2024-01-01'
GROUP BY metadata['geo']['city']
ORDER BY req_count DESC
LIMIT 10;`,
    bullets: [
      'Each JSON path becomes a typed sub-column — only needed fields are read',
      'Columnar storage delivers order-of-magnitude query speedups vs. full-parse',
    ],
    diagramType: 'extraction',
  },
  {
    id: 2,
    title: 'Schema Template',
    subtitle: 'Apply type constraints to hot paths, stay flexible elsewhere',
    sql: `CREATE TABLE api_logs (
  request_id  VARCHAR(32),
  metadata    VARIANT<
    '\$.geo.lat'     : FLOAT,
    '\$.geo.lng'     : FLOAT,
    '\$.device.type' : STRING,
    '\$.tags*'       : TEXT
  >
);`,
    bullets: [
      'Explicit types on hot paths eliminate per-row type inference overhead',
      'Wildcard patterns ($.tags*) keep unknown keys fully flexible',
    ],
    diagramType: 'schema',
  },
  {
    id: 3,
    title: 'Index Support',
    subtitle: 'BloomFilter + Inverted Index on VARIANT columns',
    sql: `ALTER TABLE api_logs ADD INDEX idx_status
  (metadata['status_code']) USING INVERTED;

ALTER TABLE api_logs ADD INDEX idx_msg
  (metadata['error']['message']) USING INVERTED;

-- Now this is a direct lookup, not a full scan:
SELECT * FROM api_logs
WHERE metadata['error']['message'] MATCH 'timeout';`,
    bullets: [
      'Inverted Index enables full-text search across JSON fields at millisecond latency',
      'BloomFilter accelerates equality filters (e.g. user_id lookups) with minimal storage cost',
    ],
    diagramType: 'index',
  },
  {
    id: 4,
    title: 'Type Promotion',
    subtitle: 'Automatic JSONB upgrade for mixed-type paths',
    sql: `-- Row 1: metadata['status'] = 200        (INT)
-- Row 2: metadata['status'] = "OK"       (STRING)
-- Row 3: metadata['status'] = true       (BOOLEAN)

-- Doris detects conflict → promotes to JSONB automatically
-- No ALTER TABLE needed. No manual casting required.

SELECT metadata['status'], COUNT(*)
FROM api_logs
GROUP BY metadata['status'];  -- works on all rows`,
    bullets: [
      'Conflicting types on the same path are auto-promoted to JSONB — zero schema migrations',
      'Eliminates runtime casting overhead and type-mismatch query failures',
    ],
    diagramType: 'type',
  },
  {
    id: 5,
    title: 'DOC Mode',
    subtitle: 'Full document storage — SELECT * without re-assembly',
    sql: `CREATE TABLE api_logs (
  request_id  VARCHAR(32),
  metadata    VARIANT
) PROPERTIES (
  "store_row_column" = "true"   -- DOC Mode
);

-- SELECT * returns the pre-stored document:
SELECT * FROM api_logs WHERE request_id = 'abc123';
-- ↑ reads one doc column, not hundreds of sub-columns`,
    bullets: [
      'DOC Mode stores the complete JSON document as a single extra column',
      'SELECT * or wide-row reads become single-column lookups — no re-assembly cost',
    ],
    diagramType: 'doc',
  },
];

const SKILLS_LIST = [
  { name: 'Subcolumn Extraction', icon: '⚡' },
  { name: 'Schema Lock', icon: '🔒' },
  { name: 'Index Vision', icon: '👁' },
  { name: 'Type Anchor', icon: '⚓' },
  { name: 'DOC Mode', icon: '💥' },
];

const STORAGE_KEY = 'doris-json-war-v1';
