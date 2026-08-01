export function getTimeRemaining(endTimeUnixSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const remaining = endTimeUnixSeconds - now;
  if (remaining <= 0) return 'Ended';
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  if (days === 0 && hours === 0) return '<1h';
  return `${days}d ${hours}h`;
}

export function votePercentages(yes: number, no: number): { yesPct: number; noPct: number; hasVotes: boolean } {
  const total = yes + no;
  if (total === 0) return { yesPct: 0, noPct: 0, hasVotes: false };
  return { yesPct: (yes / total) * 100, noPct: (no / total) * 100, hasVotes: true };
}
