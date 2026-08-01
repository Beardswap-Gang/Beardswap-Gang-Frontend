'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { MetricsGrid } from '@/components/MetricsGrid';
import { ProposalList } from '@/components/ProposalList';
import { CreateProposalModal } from '@/components/CreateProposalModal';
import { useProposals } from '@/hooks/useProposals';
import { useWallet } from '@/hooks/useWallet';

export default function Home() {
  const { proposals, metrics, loading, error, refresh, refreshMetrics } = useProposals();
  const { address, isConnected } = useWallet();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleVoted = () => {
    refresh();
    refreshMetrics();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <MetricsGrid metrics={metrics} />

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Governance Proposals</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!isConnected}
              title={isConnected ? undefined : 'Connect your wallet to create a proposal'}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
            >
              + Create Proposal
            </button>
          </div>

          <ProposalList
            proposals={proposals}
            loading={loading}
            error={error}
            walletAddress={address}
            onVoted={handleVoted}
            onRetry={refresh}
          />
        </div>
      </main>

      {showCreateModal && (
        <CreateProposalModal
          walletAddress={address}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            refresh();
            refreshMetrics();
          }}
        />
      )}
    </div>
  );
}
