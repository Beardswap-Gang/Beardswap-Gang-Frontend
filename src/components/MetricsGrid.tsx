import { GovernanceMetrics } from '@/lib/api';

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
      <h3 className="text-purple-300 text-sm font-medium mb-2">{label}</h3>
      <p className="text-4xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  );
}

export function MetricsGrid({ metrics }: { metrics: GovernanceMetrics | null }) {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <MetricCard label="Total Proposals" value={metrics.totalProposals} />
      <MetricCard label="Active Proposals" value={metrics.activeProposals} />
      <MetricCard label="Total Votes" value={metrics.totalVotes} />
    </div>
  );
}
