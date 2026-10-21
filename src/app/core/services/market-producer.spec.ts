import { TestBed } from '@angular/core/testing';
import { MarketUpdate } from '../producer.types';
import { MarketProducer } from './market-producer';

class MockWorker {
  static latest: MockWorker | null = null;

  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  posted: unknown[] = [];

  constructor() {
    MockWorker.latest = this;
  }

  postMessage(message: unknown): void {
    this.posted.push(message);
  }

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

describe('MarketProducer', () => {
  beforeEach(() => {
    MockWorker.latest = null;
    (globalThis as unknown as { Worker: typeof Worker }).Worker =
      MockWorker as unknown as typeof Worker;

    TestBed.configureTestingModule({
      providers: [MarketProducer],
    });
  });

  it('pauses and resumes without starting a new run', () => {
    const producer = TestBed.inject(MarketProducer);
    producer.start();
    const runId = producer.activeRunId();

    producer.pause();
    expect(producer.status()).toBe('paused');
    expect(producer.activeRunId()).toBe(runId);
    expect(MockWorker.latest?.posted.at(-1)).toEqual({ type: 'pause' });

    producer.resume();
    expect(producer.status()).toBe('running');
    expect(producer.activeRunId()).toBe(runId);
    expect(MockWorker.latest?.posted.at(-1)).toEqual({ type: 'resume' });
  });

  it('drops batches from a previous run', () => {
    const producer = TestBed.inject(MarketProducer);
    const received: MarketUpdate[][] = [];
    producer.updates$.subscribe((updates) => received.push(updates));

    producer.start();
    MockWorker.latest?.onmessage?.({
      data: { type: 'batch', runId: 1, updates: [alfaTrade] },
    } as MessageEvent);

    producer.start();
    MockWorker.latest?.onmessage?.({
      data: { type: 'batch', runId: 1, updates: [alfaTrade] },
    } as MessageEvent);

    expect(received.length).toBe(1);
  });
});
