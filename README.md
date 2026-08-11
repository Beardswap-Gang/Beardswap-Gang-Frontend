# beardswap Gang Governance Frontend

The DAO Governance Interface for the beardswap Gang network, built with Next.js 15 (App Router), React 19, Tailwind CSS, and TypeScript.

## Overview

- **Dashboard** — view all governance proposals and their current status
- **Voting Interface** — cast votes on active proposals, signed by the connected Freighter wallet
- **Governance Analytics** — real-time metrics on proposal outcomes and participation
- **Wallet Integration** — connect via the Stellar Freighter browser extension

## Local Setup

### Prerequisites
- Node.js 18+
- The [Freighter](https://freighter.app) wallet browser extension
- The Fluxora-Backend API running (see below) — this frontend has no fallback data source

### Installation

```bash
npm install
```

### Configuration

```bash
cp .env.local.example .env.local
```

Then set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` to point at your backend. There's no baked-in `localhost:3000` fallback in the API client — if these aren't set you'll get a console warning rather than a silent failure.

### Development

```bash
npm run dev
```

### Production build

```bash
npm run build
npm start
```

### Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Docker

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_WS_URL=wss://api.example.com/ws \
  -t beardswap-governance-frontend .
docker run -p 3000:3000 beardswap-governance-frontend
```

`NEXT_PUBLIC_*` values are inlined into the client JS at build time, so they must be passed as `--build-arg`s, not just set at `docker run` time.

## Architecture

```
src/
├── app/
│   ├── layout.tsx        # Root layout, wraps app in ToastProvider
│   ├── page.tsx           # Dashboard — composes the components below
│   └── globals.css
├── components/
│   ├── Header.tsx              # Wallet connect button
│   ├── MetricsGrid.tsx         # Governance metrics cards
│   ├── ProposalList.tsx        # Loading / error / empty states + list
│   ├── ProposalCard.tsx        # Single proposal, vote buttons
│   ├── CreateProposalModal.tsx # New-proposal form
│   └── Toast.tsx               # Toast notification system
├── hooks/
│   ├── useWallet.ts       # Freighter connection state
│   └── useProposals.ts    # Data fetching + WebSocket live updates
└── lib/
    ├── api.ts             # Typed API client (proposals, metrics, votes)
    ├── freighter.ts       # Freighter wallet integration
    └── format.ts          # Time/percentage formatting helpers
```

## Wallet & Voting Flow

Freighter integration goes through the official `@stellar/freighter-api` package — the extension does not inject any `window.freighter` global.

Votes and proposal creation follow a **build → sign → submit** pattern rather than sending arbitrary client-supplied data to the backend:

1. Frontend calls `POST /api/votes/build` (or `/api/proposals/build`) with the intent (proposal ID, vote choice, etc.)
2. Backend, which holds the actual Soroban contract binding, returns an **unsigned transaction XDR**
3. Frontend asks Freighter to sign it (the user approves in the extension)
4. Frontend calls `POST /api/votes/submit` (or `/api/proposals/submit`) with the **signed** XDR
5. Backend submits it to the network and returns the updated proposal

### Backend endpoints this frontend expects

| Method | Path                      | Body                                              | Returns              |
|--------|---------------------------|----------------------------------------------------|-----------------------|
| GET    | `/api/proposals`          | —                                                  | `{ proposals: Proposal[] }` |
| GET    | `/api/analytics/metrics`  | —                                                  | `GovernanceMetrics`   |
| POST   | `/api/proposals/build`    | `{ title, description, durationDays, creator }`    | `{ xdr }`             |
| POST   | `/api/proposals/submit`   | `{ signedXdr }`                                    | `{ proposal }`        |
| POST   | `/api/votes/build`        | `{ proposalId, voter, support }`                   | `{ xdr }`             |
| POST   | `/api/votes/submit`       | `{ signedXdr }`                                    | `{ proposal }`        |

If these endpoints don't exist yet on the backend, voting and proposal creation will fail with a toast error (they degrade gracefully — the dashboard and metrics still load).

## Known Gaps / Next Steps

- Backend `/build` and `/submit` endpoints above need to be implemented against the actual Soroban contract.
- Unit tests added for utilities and components - expand coverage for hooks and API layer.
- E2E tests added for basic functionality - expand to cover wallet connect and voting flows.
- CI/CD pipeline configured with GitHub Actions for lint, test, build, and E2E testing.

## License

MIT
