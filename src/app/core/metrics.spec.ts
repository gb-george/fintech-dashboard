import { applyUpdate, emptyAccumulator, toMetrics } from './metrics';
import { MarketUpdate } from './producer.types';

function trade(partial: Partial<MarketUpdate> & Pick<MarketUpdate, 'instrument'>): MarketUpdate {
  return {
    priceCents: 10000,
    tradeQuantity: 1,
    bidCents: 9996,
    askCents: 10000,
    bidQuantity: 100,
    askQuantity: 100,
    ...partial,
  };
}

describe('metrics', () => {
  it('shows unavailable values and zero volume before any trades', () => {
    const metrics = toMetrics(emptyAccumulator('ALFA'));
    expect(metrics.lastPriceCents).toBeNull();
    expect(metrics.spreadCents).toBeNull();
    expect(metrics.volume).toBe(0);
    expect(metrics.vwapCents).toBeNull();
    expect(metrics.imbalance).toBeNull();
  });

  it('matches the spec example for two ALFA trades', () => {
    let alfa = emptyAccumulator('ALFA');
    alfa = applyUpdate(
      alfa,
      trade({ instrument: 'ALFA', priceCents: 10000, tradeQuantity: 10 }),
    );
    alfa = applyUpdate(
      alfa,
      trade({
        instrument: 'ALFA',
        priceCents: 10200,
        tradeQuantity: 30,
        bidCents: 10196,
        askCents: 10200,
        bidQuantity: 600,
        askQuantity: 400,
      }),
    );

    const metrics = toMetrics(alfa);
    expect(metrics.lastPriceCents).toBe(10200);
    expect(metrics.volume).toBe(40);
    expect(metrics.vwapCents).toBe(10150);
    expect(metrics.spreadCents).toBe(4);
    expect(metrics.imbalance).toBe(0.2);
  });

  it('returns null VWAP and imbalance when the denominator is zero', () => {
    const zeroVolume = toMetrics(emptyAccumulator('ALFA'));
    expect(zeroVolume.vwapCents).toBeNull();

    const emptyBook = toMetrics(
      applyUpdate(
        emptyAccumulator('ALFA'),
        trade({ instrument: 'ALFA', bidQuantity: 0, askQuantity: 0 }),
      ),
    );
    expect(emptyBook.imbalance).toBeNull();
    expect(emptyBook.volume).toBe(1);
  });

  it('keeps instruments isolated', () => {
    let alfa = emptyAccumulator('ALFA');
    let beta = emptyAccumulator('BETA');
    alfa = applyUpdate(alfa, trade({ instrument: 'ALFA', priceCents: 10000, tradeQuantity: 10 }));
    beta = applyUpdate(beta, trade({ instrument: 'BETA', priceCents: 20000, tradeQuantity: 5 }));

    expect(toMetrics(alfa).volume).toBe(10);
    expect(toMetrics(alfa).lastPriceCents).toBe(10000);
    expect(toMetrics(beta).volume).toBe(5);
    expect(toMetrics(beta).lastPriceCents).toBe(20000);
  });
});
