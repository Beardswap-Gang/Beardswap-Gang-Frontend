'use client';

import { useState, useEffect } from 'react';

interface Proposal {
  id: number;
  title: string;
  description: string;
  yes_votes: number;
  no_votes: number;
  total_voting_power: number;
  state: string;
  start_time: number;
  end_time: number;
  timelock_end: number;
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '', duration: '7' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchProposals();
    fetchMetrics();
    checkWalletConnection();
    connectWebSocket();
  }, []);

  const connectWebSocket = () => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/ws';
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'proposal_update') {
        fetchProposals(); // Refresh proposals on update
      } else if (message.type === 'vote_cast') {
        fetchProposals(); // Refresh proposals on vote
        fetchMetrics(); // Refresh metrics
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected, attempting to reconnect...');
      setTimeout(connectWebSocket, 5000);
    };

    setWs(websocket);
  };

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

  const createProposal = async () => {
    if (!walletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!createForm.title || !createForm.description || !createForm.duration) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // This would interact with the smart contract in production
      const durationInSeconds = parseInt(createForm.duration) * 24 * 60 * 60; // Convert days to seconds
      
      // Mock proposal creation - replace with actual contract call
      const newProposal = {
        id: Date.now(),
        title: createForm.title,
        description: createForm.description,
        yes_votes: 0,
        no_votes: 0,
        total_voting_power: 0,
        state: 'Active',
        start_time: Math.floor(Date.now() / 1000),
        end_time: Math.floor(Date.now() / 1000) + durationInSeconds,
        timelock_end: Math.floor(Date.now() / 1000) + durationInSeconds + 86400, // 1 day timelock
      };
      
      // Send to backend
      await fetch(`${API_URL}/api/webhooks/proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal_id: newProposal.id,
          event: 'created',
          data: newProposal,
        }),
      });
      
      // Reset form and close modal
      setCreateForm({ title: '', description: '', duration: '7' });
      setShowCreateModal(false);
      
      // Refresh proposals
      fetchProposals();
      alert('Proposal created successfully!');
    } catch (error) {
      console.error('Error creating proposal:', error);
      alert('Failed to create proposal');
    } finally {
      setIsSubmitting(false);
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Governance Proposals</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
            >
              + Create Proposal
            </button>
          </div>
          
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

      {/* Create Proposal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-8 max-w-lg w-full mx-4 border border-purple-500/20">
            <h3 className="text-2xl font-bold text-white mb-6">Create New Proposal</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-purple-300 text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500"
                  placeholder="Enter proposal title"
                />
              </div>
              
              <div>
                <label className="block text-purple-300 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="Enter proposal description"
                />
              </div>
              
              <div>
                <label className="block text-purple-300 text-sm font-medium mb-2">Voting Duration (days)</label>
                <input
                  type="number"
                  value={createForm.duration}
                  onChange={(e) => setCreateForm({ ...createForm, duration: e.target.value })}
                  min="1"
                  max="30"
                  className="w-full px-4 py-3 bg-slate-700 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500"
                  placeholder="7"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={createProposal}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Proposal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
