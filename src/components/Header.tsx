'use client';

import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/components/Toast';

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Header() {
  const { address, isConnected, connecting, connect } = useWallet();
  const { showToast } = useToast();

  const handleConnect = async () => {
    try {
      await connect();
      showToast('Wallet connected.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to connect wallet.', 'error');
    }
  };

  return (
    <header className="border-b border-purple-500/20 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">beardswap Gang DAO</h1>
            <p className="text-purple-300 text-sm">Governance Platform</p>
          </div>
          <button
            onClick={handleConnect}
            disabled={connecting || isConnected}
            aria-live="polite"
            className={`px-6 py-3 rounded-lg font-semibold transition-all disabled:cursor-default ${
              isConnected
                ? 'bg-green-600 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-70'
            }`}
          >
            {connecting ? 'Connecting…' : isConnected && address ? truncateAddress(address) : 'Connect Wallet'}
          </button>
        </div>
      </div>
    </header>
  );
}
