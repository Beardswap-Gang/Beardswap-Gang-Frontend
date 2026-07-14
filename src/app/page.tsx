'use client';

import { useState, useEffect } from 'react';

interface Proposal {
  id: number;
  title: string;
  description: string;
  yes_votes: number;
  no_votes: number;
  state: string;
  start_time: number;
  end_time: number;
}

interface GovernanceMetrics {
  totalProposals: number;
  activeProposals: number;
  passedProposals: number;
  rejectedProposals: number;
  totalVotes: number;
  totalVoters: number;
}

export default function Home() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [metrics, setMetrics] = useState<GovernanceMetrics | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchProposals();
    fetchMetrics();
    checkWalletConnection();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await fetch(`${API_URL}/api/proposals`);
      const data = await response.json();
      setProposals(data.proposals || []);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/analytics/metrics`);
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const checkWalletConnection = async () => {
    try {
      // @ts-ignore - Freighter API
      if (window.freighter && window.freighter.isConnected()) {
        // @ts-ignore
        const address = await window.freighter.getPublicKey();
        setWalletAddress(address);
        setWalletConnected(true);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connectWallet = async () => {
    try {
      // @ts-ignore - Freighter API
      if (window.freighter) {
        // @ts-ignore
        const address = await window.freighter.getPublicKey();
        setWalletAddress(address);
        setWalletConnected(true);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const castVote = async (proposalId: number, vote: boolean) => {
    if (!walletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    // This would interact with the smart contract in production
    alert(`Vote ${vote ? 'YES' : 'NO'} cast for proposal ${proposalId}`);
    // Refresh proposals after voting
    fetchProposals();
  };

  const getTimeRemaining = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTime - now;
    if (remaining <= 0) return 'Ended';
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 backdrop-blur-sm bg-slate-900/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">beardswap Gang DAO</h1>
              <p className="text-purple-300 text-sm">Governance Platform</p>
            </div>
            <button
              onClick={connectWallet}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                walletConnected
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {walletConnected ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Governance Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-purple-300 text-sm font-medium mb-2">Total Proposals</h3>
              <p className="text-4xl font-bold text-white">{metrics.totalProposals}</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-purple-300 text-sm font-medium mb-2">Active Proposals</h3>
              <p className="text-4xl font-bold text-white">{metrics.activeProposals}</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-purple-300 text-sm font-medium mb-2">Total Votes</h3>
              <p className="text-4xl font-bold text-white">{metrics.totalVotes}</p>
            </div>
          </div>
        )}

        {/* Proposals Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Governance Proposals</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              <p className="text-purple-300 mt-4">Loading proposals...</p>
            </div>
          ) : proposals.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-purple-500/20 text-center">
              <p className="text-purple-300">No proposals found. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{proposal.title}</h3>
                      <p className="text-purple-300 text-sm">{proposal.description}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        proposal.state === 'Active'
                          ? 'bg-green-600/20 text-green-400'
                          : proposal.state === 'Passed'
                          ? 'bg-blue-600/20 text-blue-400'
                          : proposal.state === 'Rejected'
                          ? 'bg-red-600/20 text-red-400'
                          : 'bg-gray-600/20 text-gray-400'
                      }`}
                    >
                      {proposal.state}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-purple-300 text-sm mb-1">Yes Votes</p>
                      <p className="text-2xl font-bold text-green-400">{proposal.yes_votes.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm mb-1">No Votes</p>
                      <p className="text-2xl font-bold text-red-400">{proposal.no_votes.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Vote Progress Bar */}
                  <div className="mb-4">
                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
                        style={{
                          width: `${(proposal.yes_votes / (proposal.yes_votes + proposal.no_votes || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-purple-300">
                      <span>{((proposal.yes_votes / (proposal.yes_votes + proposal.no_votes || 1)) * 100).toFixed(1)}% Yes</span>
                      <span>{((proposal.no_votes / (proposal.yes_votes + proposal.no_votes || 1)) * 100).toFixed(1)}% No</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-purple-300 text-sm">
                      Time remaining: <span className="text-white font-medium">{getTimeRemaining(proposal.end_time)}</span>
                    </p>
                    {proposal.state === 'Active' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => castVote(proposal.id, true)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
                        >
                          Vote Yes
                        </button>
                        <button
                          onClick={() => castVote(proposal.id, false)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                        >
                          Vote No
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
