import { INSTRUMENT_SYMBOLS, MarketUpdate } from './producer.types';

export type InstrumentMetrics = {
  symbol: string;
  lastPriceCents: number | null;
  spreadCents: number | null;
  volume: number;
  vwapCents: number | null;
  imbalance: number | null;
};

export type InstrumentAccumulator = {
  symbol: string;
  lastPriceCents: number | null;
  bidCents: number | null;
  askCents: number | null;
  bidQuantity: number | null;
  askQuantity: number | null;
  volume: number;
  notionalCents: number;
};

export function emptyAccumulator(symbol: string): InstrumentAccumulator {
  return {
    symbol,
    lastPriceCents: null,
    bidCents: null,
    askCents: null,
    bidQuantity: null,
    askQuantity: null,
    volume: 0,
    notionalCents: 0,
  };
}

export function createRunAccumulators(count: number): InstrumentAccumulator[] {
  const n = Math.min(Math.max(count, 1), INSTRUMENT_SYMBOLS.length);
  return INSTRUMENT_SYMBOLS.slice(0, n).map((symbol) => emptyAccumulator(symbol));
}

export function applyUpdate(
  current: InstrumentAccumulator,
  update: MarketUpdate,
): InstrumentAccumulator {
  const volume = current.volume + update.tradeQuantity;
  return {
    symbol: current.symbol,
    lastPriceCents: update.priceCents,
    bidCents: update.bidCents,
    askCents: update.askCents,
    bidQuantity: update.bidQuantity,
    askQuantity: update.askQuantity,
    volume,
    notionalCents: current.notionalCents + update.priceCents * update.tradeQuantity,
  };
}

export function toMetrics(current: InstrumentAccumulator): InstrumentMetrics {
  const bookSize = (current.bidQuantity ?? 0) + (current.askQuantity ?? 0);

  return {
    symbol: current.symbol,
    lastPriceCents: current.lastPriceCents,
    spreadCents:
      current.bidCents === null || current.askCents === null
        ? null
        : current.askCents - current.bidCents,
    volume: current.volume,
    vwapCents: current.volume === 0 ? null : current.notionalCents / current.volume,
    imbalance:
      current.bidQuantity === null || current.askQuantity === null || bookSize === 0
        ? null
        : (current.bidQuantity - current.askQuantity) / bookSize,
  };
}
