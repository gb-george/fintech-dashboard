/// <reference lib="webworker" />

import { MainToWorker, ProducerSettings, WorkerToMain } from '../producer.types';

type WasmExports = {
  memory: WebAssembly.Memory;
  reset: (count: number) => void;
  generateBatchJSON: (count: number, updatesPerBatch: number) => number;
};

let wasm: WasmExports | null = null;
let timer: number | null = null;
let paused = false;
let runId = 0;
let settings: ProducerSettings | null = null;

function send(message: WorkerToMain): void {
  postMessage(message);
}

function readWasmString(ptr: number): string {
  const size = new Uint32Array(wasm!.memory.buffer)[(ptr - 4) >>> 2];
  const bytes = new Uint8Array(wasm!.memory.buffer, ptr, size);
  return new TextDecoder('utf-16le').decode(bytes);
}

async function loadWasm(url: string): Promise<void> {
  if (wasm) {
    return;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load market generator');
  }

  const bytes = await response.arrayBuffer();
  const { instance } = await WebAssembly.instantiate(bytes, {
    env: {
      abort() {
        throw new Error('Wasm aborted');
      },
    },
  });

  wasm = instance.exports as unknown as WasmExports;
}

function clearTimer(): void {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
}

function schedule(): void {
  if (!settings) {
    return;
  }
  clearTimer();
  timer = self.setTimeout(tick, settings.batchIntervalMs);
}

function tick(): void {
  if (paused || !wasm || !settings) {
    return;
  }

  try {
    const ptr = wasm.generateBatchJSON(settings.instrumentCount, settings.updatesPerBatch);
    send({
      type: 'batch',
      runId,
      updates: JSON.parse(readWasmString(ptr)),
    });
  } catch (err) {
    send({
      type: 'error',
      message: err instanceof Error ? err.message : 'Failed to generate batch',
    });
    return;
  }

  if (!paused) {
    schedule();
  }
}

addEventListener('message', async (event: MessageEvent<MainToWorker>) => {
  const message = event.data;

  try {
    if (message.type === 'start') {
      paused = false;
      runId = message.runId;
      settings = message.settings;
      clearTimer();
      await loadWasm(message.wasmUrl);
      wasm!.reset(settings.instrumentCount);
      schedule();
      return;
    }

    if (message.type === 'pause') {
      paused = true;
      clearTimer();
      return;
    }

    if (message.type === 'resume') {
      if (!paused) {
        return;
      }
      paused = false;
      schedule();
      return;
    }

    if (message.type === 'stop') {
      paused = true;
      clearTimer();
    }
  } catch (err) {
    send({
      type: 'error',
      message: err instanceof Error ? err.message : 'Worker failed',
    });
  }
});
