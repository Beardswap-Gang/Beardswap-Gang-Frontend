import { Proposal } from '@/lib/api';
import { ProposalCard } from '@/components/ProposalCard';

interface ProposalListProps {
  proposals: Proposal[];
  loading: boolean;
  error: string | null;
  walletAddress: string | null;
  onVoted: () => void;
  onRetry: () => void;
}

export function ProposalList({ proposals, loading, error, walletAddress, onVoted, onRetry }: ProposalListProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
        <p className="text-purple-300 mt-4">Loading proposals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 backdrop-blur-sm rounded-xl p-12 border border-red-500/30 text-center">
        <p className="text-red-300 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-purple-500/20 text-center">
        <p className="text-purple-300">No proposals found. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {proposals.map((proposal) => (
        <ProposalCard key={proposal.id} proposal={proposal} walletAddress={walletAddress} onVoted={onVoted} />
      ))}
    </div>
  );
}
