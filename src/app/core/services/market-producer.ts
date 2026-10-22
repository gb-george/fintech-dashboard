import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import {
  DEFAULT_SETTINGS,
  MainToWorker,
  MarketUpdate,
  ProducerSettings,
  WorkerToMain,
} from '../producer.types';

@Injectable({ providedIn: 'root' })
export class MarketProducer {
  private worker: Worker | null = null;
  private runId = 0;

  readonly updates$ = new Subject<MarketUpdate[]>();
  readonly status = signal<'running' | 'paused' | 'error'>('paused');
  readonly error = signal<string | null>(null);
  readonly activeRunId = signal(0);
  readonly settings = signal<ProducerSettings>({ ...DEFAULT_SETTINGS });

  start(settings: ProducerSettings = this.settings()): void {
    const next = { ...settings };
    this.settings.set(next);
    this.runId += 1;
    this.error.set(null);
    this.status.set('running');
    this.activeRunId.set(this.runId);
    this.ensureWorker();
    this.post({
      type: 'start',
      runId: this.runId,
      settings: next,
      wasmUrl: new URL('assets/wasm/market_generator.wasm', document.baseURI).href,
    });
  }

  pause(): void {
    this.status.set('paused');
    this.post({ type: 'pause' });
  }

  resume(): void {
    this.status.set('running');
    this.post({ type: 'resume' });
  }

  destroy(): void {
    this.worker?.terminate();
    this.worker = null;
    this.status.set('paused');
  }

  private ensureWorker(): void {
    if (this.worker) {
      return;
    }

    this.worker = new Worker(new URL('../workers/market.worker', import.meta.url), {
      type: 'module',
    });

    this.worker.onmessage = (event: MessageEvent<WorkerToMain>) => {
      const message = event.data;
      if (message.type === 'batch') {
        if (message.runId !== this.runId) {
          return;
        }
        this.updates$.next(message.updates);
        return;
      }

      this.status.set('error');
      this.error.set(message.message);
    };

    this.worker.onerror = () => {
      this.status.set('error');
      this.error.set('Worker failed to start');
    };
  }

  private post(message: MainToWorker): void {
    this.worker?.postMessage(message);
  }
}
