'use client';

import { useState } from 'react';
import { Proposal } from '@/lib/api';
import { buildVoteTx, submitVoteTx } from '@/lib/api';
import { signTransaction } from '@/lib/freighter';
import { useToast } from '@/components/Toast';
import { getTimeRemaining, votePercentages } from '@/lib/format';

const STATE_STYLES: Record<string, string> = {
  Active: 'bg-green-600/20 text-green-400',
  Passed: 'bg-blue-600/20 text-blue-400',
  Rejected: 'bg-red-600/20 text-red-400',
};

interface ProposalCardProps {
  proposal: Proposal;
  walletAddress: string | null;
  onVoted: () => void;
}

export function ProposalCard({ proposal, walletAddress, onVoted }: ProposalCardProps) {
  const { showToast } = useToast();
  const [pendingVote, setPendingVote] = useState<'yes' | 'no' | null>(null);
  const { yesPct, noPct, hasVotes } = votePercentages(proposal.yes_votes, proposal.no_votes);

  const castVote = async (support: boolean) => {
    if (!walletAddress) {
      showToast('Connect your wallet before voting.', 'error');
      return;
    }

    setPendingVote(support ? 'yes' : 'no');
    try {
      const { xdr } = await buildVoteTx({ proposalId: proposal.id, voter: walletAddress, support });
      const signedXdr = await signTransaction(xdr, { address: walletAddress });
      await submitVoteTx(signedXdr);
      showToast(`Vote ${support ? 'YES' : 'NO'} submitted.`, 'success');
      onVoted();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Vote failed.', 'error');
    } finally {
      setPendingVote(null);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">{proposal.title}</h3>
          <p className="text-purple-300 text-sm">{proposal.description}</p>
        </div>
        <span
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
            STATE_STYLES[proposal.state] ?? 'bg-gray-600/20 text-gray-400'
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

      <div className="mb-4">
        <div className="h-4 bg-slate-700 rounded-full overflow-hidden" role="progressbar" aria-valuenow={yesPct} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
            style={{ width: `${yesPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-purple-300">
          {hasVotes ? (
            <>
              <span>{yesPct.toFixed(1)}% Yes</span>
              <span>{noPct.toFixed(1)}% No</span>
            </>
          ) : (
            <span>No votes yet</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-purple-300 text-sm">
          Time remaining: <span className="text-white font-medium">{getTimeRemaining(proposal.end_time)}</span>
        </p>
        {proposal.state === 'Active' && (
          <div className="flex gap-2">
            <button
              onClick={() => castVote(true)}
              disabled={pendingVote !== null}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
            >
              {pendingVote === 'yes' ? 'Voting…' : 'Vote Yes'}
            </button>
            <button
              onClick={() => castVote(false)}
              disabled={pendingVote !== null}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
            >
              {pendingVote === 'no' ? 'Voting…' : 'Vote No'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
