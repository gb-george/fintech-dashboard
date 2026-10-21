import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MarketUpdate } from '../producer.types';
import { MarketProducer } from './market-producer';
import { MarketState } from './market-state';

class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  postMessage(): void {}
  terminate(): void {}
  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean {
    return false;
  }
}

const alfaTrade: MarketUpdate = {
  instrument: 'ALFA',
  priceCents: 10000,
  tradeQuantity: 10,
  bidCents: 9996,
  askCents: 10000,
  bidQuantity: 100,
  askQuantity: 100,
};

describe('MarketState', () => {
  beforeEach(() => {
    (globalThis as unknown as { Worker: typeof Worker }).Worker =
      MockWorker as unknown as typeof Worker;

    TestBed.configureTestingModule({
      providers: [MarketProducer, MarketState],
    });
  });

  it('starts a run with unavailable values and zero volume', () => {
    const producer = TestBed.inject(MarketProducer);
    const state = TestBed.inject(MarketState);
    producer.start();
    TestBed.inject(ApplicationRef).tick();

    const alfa = state.rows().find((row) => row.symbol === 'ALFA');
    expect(state.rows().length).toBe(5);
    expect(alfa?.volume).toBe(0);
    expect(alfa?.lastPriceCents).toBeNull();
    expect(alfa?.vwapCents).toBeNull();
  });

  it('clears previous totals when a new run starts', () => {
    const producer = TestBed.inject(MarketProducer);
    const state = TestBed.inject(MarketState);
    producer.start();
    TestBed.inject(ApplicationRef).tick();
    producer.updates$.next([alfaTrade]);
    expect(state.rows()[0].volume).toBe(10);

    producer.start();
    TestBed.inject(ApplicationRef).tick();
    expect(state.rows()[0].volume).toBe(0);
    expect(state.rows()[0].lastPriceCents).toBeNull();
  });

  it('keeps totals when generation is paused and resumed', () => {
    const producer = TestBed.inject(MarketProducer);
    const state = TestBed.inject(MarketState);
    producer.start();
    TestBed.inject(ApplicationRef).tick();
    producer.updates$.next([alfaTrade]);
    expect(state.rows()[0].volume).toBe(10);

    producer.pause();
    expect(state.rows()[0].volume).toBe(10);
    expect(state.rows()[0].lastPriceCents).toBe(10000);

    producer.resume();
    expect(state.rows()[0].volume).toBe(10);
    expect(producer.status()).toBe('running');
  });

  it('rebuilds rows when instrument count changes', () => {
    const producer = TestBed.inject(MarketProducer);
    const state = TestBed.inject(MarketState);
    producer.start({
      instrumentCount: 8,
      updatesPerBatch: 100,
      batchIntervalMs: 500,
    });
    TestBed.inject(ApplicationRef).tick();

    expect(state.rows().length).toBe(8);
    expect(state.rows()[7].symbol).toBe('THETA');
  });
});

