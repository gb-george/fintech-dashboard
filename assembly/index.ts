class InstrumentState {
    symbol: string;
    lastPriceCents: i32;
  
    constructor(symbol: string, initialPriceCents: i32) {
      this.symbol = symbol;
      this.lastPriceCents = initialPriceCents;
    }
  }
  
  const SYMBOLS: string[] = [
    'ALFA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON', 'ZETA', 'ETA', 'THETA',
    'IOTA', 'KAPPA', 'LAMBDA', 'MU', 'NU', 'XI', 'OMICRON', 'PI',
    'RHO', 'SIGMA', 'TAU', 'UPSILON', 'PHI', 'CHI', 'PSI', 'OMEGA',
    'APEX', 'BOLT', 'CORA', 'DOVE', 'EDGE', 'FLUX', 'GLOW', 'HARK',
    'IRIS', 'JADE', 'KITE', 'LUNA', 'MIRA', 'NOVA', 'ORCA', 'PINE',
    'QUAD', 'RAIL', 'SAGE', 'TIDE', 'ULMO', 'VELA', 'WAVE', 'XENO',
    'YARN', 'ZEAL'
  ];
  
  const INITIAL_SEED: u32 = 123;
  let seed: u32 = INITIAL_SEED;
  const instruments: InstrumentState[] = [];

  function getRandom(): f64 {
    seed = (u32(1664525) * seed + u32(1013904223));
    return f64(seed) / f64(u32.MAX_VALUE);
  }
  
  function getRandomInt(min: i32, max: i32): i32 {
    return min + i32(Math.floor(getRandom() * f64(max - min + 1)));
  }

  export function reset(count: i32): void {
    seed = INITIAL_SEED;
    while (instruments.length > 0) {
      instruments.pop();
    }

    let n = count;
    if (n < 1) n = 1;
    if (n > SYMBOLS.length) n = SYMBOLS.length;

    for (let i = 0; i < n; i++) {
      instruments.push(new InstrumentState(SYMBOLS[i], 10000 + i * 500));
    }
  }
  
  export function generateBatchJSON(count: i32, updatesPerBatch: i32): string {
    if (instruments.length != count) {
      reset(count);
    }

    let jsonResult = '[';
  
    for (let i = 0; i < updatesPerBatch; i++) {
      let inst = instruments[i % instruments.length];

      let priceCents = inst.lastPriceCents + getRandomInt(-50, 50);
      if (priceCents < 100) priceCents = 100;
  
      let spreadCents = getRandomInt(1, 10);
      let bidCents = priceCents - getRandomInt(0, spreadCents);
      if (bidCents < 1) bidCents = 1;
      let askCents = bidCents + spreadCents;
  
      let tradeQuantity = getRandomInt(1, 100);
      let bidQuantity = getRandomInt(100, 1000);
      let askQuantity = getRandomInt(100, 1000);
  
      let finalTradePrice = (getRandom() > 0.5) ? askCents : bidCents;
      inst.lastPriceCents = finalTradePrice;
  
      let updateJson = `{` +
        `"instrument":"${inst.symbol}",` +
        `"priceCents":${finalTradePrice},` +
        `"tradeQuantity":${tradeQuantity},` +
        `"bidCents":${bidCents},` +
        `"askCents":${askCents},` +
        `"bidQuantity":${bidQuantity},` +
        `"askQuantity":${askQuantity}` +
        `}`;
  
      jsonResult += updateJson;
      if (i < updatesPerBatch - 1) {
        jsonResult += ',';
      }
    }
  
    jsonResult += ']';
    return jsonResult;
  }