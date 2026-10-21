// @ts-expect-error vitest runs in Node
import { readFileSync } from 'fs';
// @ts-expect-error vitest runs in Node
import { join } from 'path';

type WasmExports = {
  memory: WebAssembly.Memory;
  reset: (count: number) => void;
  generateBatchJSON: (count: number, updatesPerBatch: number) => number;
};

function readWasmString(memory: WebAssembly.Memory, ptr: number): string {
  const size = new Uint32Array(memory.buffer)[(ptr - 4) >>> 2];
  const bytes = new Uint8Array(memory.buffer, ptr, size);
  return new TextDecoder('utf-16le').decode(bytes);
}

describe('market generator wasm', () => {
  let wasm: WasmExports;

  beforeAll(async () => {
    const cwd = (globalThis as unknown as { process: { cwd(): string } }).process.cwd();
    const bytes = readFileSync(join(cwd, 'public/assets/wasm/market_generator.wasm'));
    const { instance } = await WebAssembly.instantiate(bytes, {
      env: {
        abort() {
          throw new Error('Wasm aborted');
        },
      },
    });
    wasm = instance.exports as unknown as WasmExports;
  });

  function generate(count: number, updatesPerBatch: number) {
    const ptr = wasm.generateBatchJSON(count, updatesPerBatch);
    return JSON.parse(readWasmString(wasm.memory, ptr)) as Array<{
      instrument: string;
      priceCents: number;
      tradeQuantity: number;
      bidCents: number;
      askCents: number;
      bidQuantity: number;
      askQuantity: number;
    }>;
  }

  it('returns the requested batch size', () => {
    wasm.reset(5);
    expect(generate(5, 3)).toHaveLength(3);
    expect(generate(5, 100)).toHaveLength(100);
  });

  it('returns valid generated values', () => {
    wasm.reset(5);
    const symbols = new Set(['ALFA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON']);

    for (const update of generate(5, 20)) {
      expect(symbols.has(update.instrument)).toBe(true);
      expect(update.priceCents).toBeGreaterThan(0);
      expect(update.bidCents).toBeGreaterThan(0);
      expect(update.askCents).toBeGreaterThan(update.bidCents);
      expect(update.priceCents === update.bidCents || update.priceCents === update.askCents).toBe(
        true,
      );
      expect(update.tradeQuantity).toBeGreaterThan(0);
      expect(update.bidQuantity).toBeGreaterThanOrEqual(0);
      expect(update.askQuantity).toBeGreaterThanOrEqual(0);
    }
  });

  it('rotates instruments across small batches', () => {
    wasm.reset(5);
    const symbols = [...generate(5, 3), ...generate(5, 3)].map((update) => update.instrument);
    expect(new Set(symbols).size).toBe(5);
  });
});
