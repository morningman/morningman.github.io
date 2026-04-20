// JSON War — Game Data
// All level definitions, boss data, tech insights, deepdive content

const LEVELS = [
  {
    id: 1,
    bossName: 'JSON GIANT',
    bossType: 'giant',
    flavorText: 'One JSON blob. Gigabytes deep. Parsed end-to-end on every query...',
    maxHp: 100,
    skill: { name: 'Subcolumn Extraction', icon: '⚡', label: 'HIGH-SPEED CANNON' },
    upgradedHitLabel: 'EXTRACTION HIT!',
    upgradeDesc: 'Subcolumn Extraction splits the JSON into typed columns — you can now analyze any field at columnar speed, no full-blob parsing.',
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
    bossName: 'INFLATION BEAST',
    bossType: 'inflation',
    flavorText: 'It grows with every hit...',
    maxHp: 100,
    skill: { name: 'Subcolumn Control', icon: '🔒', label: 'COLUMN LIMITER' },
    upgradedHitLabel: 'ADAPTIVE SUBCOLUMNIZATION',
    upgradeDesc: 'Frequent paths become subcolumns; rare paths are stored in sharded sparse columns.',
    defeatReason: 'Uncontrolled subcolumn extraction makes column count explode — data size blows up.',
    normalVolleysBeforeRetreat: 3,
    normalDamagePerVolley: 0,
    upgradedDamagePerVolley: 34,
    upgradedVolleys: 3,
    bossAttackName: 'Shockwave Ring',
    techInsight: {
      challenge: 'How to efficiently store and query semi-structured data with large numbers of keys that have highly uneven access frequencies.',
      solution: 'Frequently accessed fields are extracted into subcolumns, while infrequently accessed fields are consolidated into sharded sparse columns.',
    },
  },
  {
    id: 3,
    bossName: 'INVISIBLE PHANTOM',
    bossType: 'phantom',
    flavorText: 'Without an INDEX, you can barely land a hit...',
    maxHp: 100,
    skill: { name: 'Index Vision', icon: '👁', label: 'X-RAY SCANNER' },
    upgradedHitLabel: 'HIT WITH INDEX!',
    upgradeDesc: 'BloomFilter + Inverted Index on VARIANT columns — lookups and full-text search skip the full scan.',
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
    bossName: 'SHAPESHIFTER',
    bossType: 'shapeshifter',
    flavorText: 'Formless. Unpredictable...',
    maxHp: 100,
    skill: { name: 'Schema Template & Type Promotion', icon: '⚓', label: 'ARMOR PIERCER' },
    upgradedHitLabel: 'HIT WITH TEMPLATE!',
    upgradeDesc: 'Schema Template pins hot-path types upfront; Type Promotion auto-upgrades any mixed values to JSONB — no runtime casting.',
    defeatReason: 'Boss types keep shifting — you cannot run effective queries on the data.',
    normalVolleysBeforeRetreat: 3,
    normalDamagePerVolley: 1,
    upgradedDamagePerVolley: 34,
    upgradedVolleys: 3,
    bossAttackName: 'Form Dash',
    techInsight: {
      challenge: 'The same JSON path can hold different types across records (e.g. $.status is INT in one row, STRING in another), causing expensive runtime type checks.',
      solution: 'Schema Template pre-declares types on hot paths to avoid uncertainty; Type Promotion auto-upgrades any remaining mixed values to JSONB — no runtime casting.',
    },
  },
  {
    id: 5,
    bossName: 'COLUMN SWARM',
    bossType: 'legion',
    flavorText: 'Shattered into countless columns. Every SELECT * crawls...',
    maxHp: 100,
    unitCount: 9,
    unitHp: 11,
    skill: { name: 'DOC Mode', icon: '💥', label: 'AOE SHOCKWAVE' },
    upgradeDesc: 'DOC Mode keeps the full JSON document alongside subcolumns — SELECT * is a single read, no re-assembly.',
    defeatReason: 'Each volley hits only a sliver — wiping out the full swarm of columns drags on forever.',
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
  { name: 'Subcolumn Control', icon: '🔒' },
  { name: 'Index Vision', icon: '👁' },
  { name: 'Schema Template & Type Promotion', icon: '⚓' },
  { name: 'DOC Mode', icon: '💥' },
];

const STORAGE_KEY = 'doris-json-war-v1';
