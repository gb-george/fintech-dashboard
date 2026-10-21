import { Injectable, effect, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  InstrumentAccumulator,
  InstrumentMetrics,
  applyUpdate,
  createRunAccumulators,
  toMetrics,
} from '../metrics';
import { MarketUpdate } from '../producer.types';
import { MarketProducer } from './market-producer';

@Injectable({ providedIn: 'root' })
export class MarketState {
  private accumulators: InstrumentAccumulator[] = [];

  readonly rows = signal<InstrumentMetrics[]>([]);

  constructor(private readonly producer: MarketProducer) {
    effect(() => {
      this.producer.activeRunId();
      const count = this.producer.settings().instrumentCount;
      untracked(() => this.reset(count));
    });

    this.producer.updates$.pipe(takeUntilDestroyed()).subscribe((updates) => {
      this.applyBatch(updates);
    });
  }

  private reset(count: number): void {
    this.accumulators = createRunAccumulators(count);
    this.rows.set(this.accumulators.map(toMetrics));
  }

  private applyBatch(updates: MarketUpdate[]): void {
    const bySymbol = new Map(this.accumulators.map((item) => [item.symbol, item]));

    for (const update of updates) {
      const current = bySymbol.get(update.instrument);
      if (!current) {
        continue;
      }
      const next = applyUpdate(current, update);
      bySymbol.set(update.instrument, next);
    }

    this.accumulators = this.accumulators.map(
      (item) => bySymbol.get(item.symbol) ?? item,
    );
    this.rows.set(this.accumulators.map(toMetrics));
  }
}
