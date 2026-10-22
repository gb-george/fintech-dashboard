# Fintech Dashboard

- Live demo: [https://fintech-dashboard-sable.vercel.app/](https://fintech-dashboard-sable.vercel.app/)
- Repository: [https://github.com/gb-george/fintech-dashboard](https://github.com/gb-george/fintech-dashboard)

Angular app with a live market table and producer settings. Prices are not from a real exchange: a small AssemblyScript Wasm library generates trades inside a Web Worker. The UI shows last price, spread, volume, VWAP, and order-book imbalance.

Default producer settings: 5 instruments, 100 updates per batch, 500 ms interval. Apply starts a new run and clears cumulative totals. Pause keeps current values without filling the gap.

## Run

```bash
npm install
npm start
```

Open [http://localhost:4200/](http://localhost:4200/).

## Test

```bash
npm test
```

## Build

```bash
npm run build:wasm
npm run build
```

Rebuild Wasm after changing `assembly/index.ts`. The compiled module is served from `public/assets/wasm/`.
