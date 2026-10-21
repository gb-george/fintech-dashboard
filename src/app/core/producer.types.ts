export type ProducerSettings = {
  instrumentCount: number;
  updatesPerBatch: number;
  batchIntervalMs: number;
};

export const DEFAULT_SETTINGS: ProducerSettings = {
  instrumentCount: 5,
  updatesPerBatch: 100,
  batchIntervalMs: 500,
};

export const INSTRUMENT_SYMBOLS: string[] = [
  'ALFA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON', 'ZETA', 'ETA', 'THETA',
  'IOTA', 'KAPPA', 'LAMBDA', 'MU', 'NU', 'XI', 'OMICRON', 'PI',
  'RHO', 'SIGMA', 'TAU', 'UPSILON', 'PHI', 'CHI', 'PSI', 'OMEGA',
  'APEX', 'BOLT', 'CORA', 'DOVE', 'EDGE', 'FLUX', 'GLOW', 'HARK',
  'IRIS', 'JADE', 'KITE', 'LUNA', 'MIRA', 'NOVA', 'ORCA', 'PINE',
  'QUAD', 'RAIL', 'SAGE', 'TIDE', 'ULMO', 'VELA', 'WAVE', 'XENO',
  'YARN', 'ZEAL',
];

export type MarketUpdate = {
  instrument: string;
  priceCents: number;
  tradeQuantity: number;
  bidCents: number;
  askCents: number;
  bidQuantity: number;
  askQuantity: number;
};

export type MainToWorker =
  | { type: 'start'; runId: number; wasmUrl: string; settings: ProducerSettings }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'stop' };

export type WorkerToMain =
  | { type: 'batch'; runId: number; updates: MarketUpdate[] }
  | { type: 'error'; message: string };
