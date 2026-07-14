# beardswap-Gang-Governance-Frontend

The DAO Governance Interface for the beardswap Gang network, built with Next.js 14 and Tailwind CSS.

## Overview

This is the frontend application for the beardswap Gang DAO Governance platform. It provides:

- **Dashboard**: View all governance proposals and their current status
- **Voting Interface**: Cast votes on active proposals using the Freighter wallet
- **Governance Analytics**: Real-time metrics on proposal outcomes and participation
- **Wallet Integration**: Seamless connection to Stellar Freighter wallet

## Features

- Modern, responsive UI with Tailwind CSS
- Real-time proposal tracking and updates
- Secure wallet connection via Freighter
- Vote progress visualization
- Governance metrics dashboard
- Dark theme with purple accent colors

## Local Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Freighter wallet extension installed in your browser

### Installation

```bash
npm install
```

### Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

## Architecture

### File Structure

```
src/
├── app/
│   └── page.tsx          # Main dashboard and voting interface
└── lib/
    └── freighter.ts              # Freighter wallet integration utilities
```

### Key Components

**Dashboard (`page.tsx`)**
- Displays all governance proposals
- Shows voting progress with visual bars
- Provides voting buttons for active proposals
- Displays governance metrics

**Freighter Integration (`lib/freighter.ts`)**
- Wallet connection utilities
- Transaction signing functions
- Network configuration for Soroban

## Wallet Connection

The app uses the Stellar Freighter wallet for:

- Connecting user wallets
- Signing transactions for voting
- Managing public keys

Users must have the Freighter extension installed to interact with the DAO.

## API Integration

The frontend communicates with the backend API at `/api/proposals` and `/api/analytics/metrics` to fetch:

- Proposal data and status
- Voting metrics and analytics
- Real-time governance statistics

## License

MIT
