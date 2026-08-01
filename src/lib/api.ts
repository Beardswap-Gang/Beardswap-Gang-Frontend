export interface Proposal {
  id: number;
  title: string;
  description: string;
  yes_votes: number;
  no_votes: number;
  total_voting_power: number;
  state: 'Active' | 'Passed' | 'Rejected' | 'Pending' | string;
  start_time: number;
  end_time: number;
  timelock_end: number;
}

export interface GovernanceMetrics {
  totalProposals: number;
  activeProposals: number;
  passedProposals: number;
  rejectedProposals: number;
  totalVotes: number;
  totalVoters: number;
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL && typeof window !== 'undefined') {
  // Fail loudly in dev rather than silently falling back to localhost, which
  // would look "connected" locally but break the moment this is deployed.
  console.warn(
    '[api] NEXT_PUBLIC_API_URL is not set. Copy .env.local.example to .env.local and set it.'
  );
}

async function request<T>(path: string, init?: RequestInit, timeoutMs = 10_000): Promise<T> {
  const base = API_URL ?? 'http://localhost:3000';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${base}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });

    if (!res.ok) {
      let detail = res.statusText;
      try {
        const body = await res.json();
        detail = body.message ?? body.error ?? detail;
      } catch {
        // response wasn't JSON — fall back to statusText
      }
      throw new ApiError(`${path} failed: ${detail}`, res.status);
    }

    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(`${path} timed out after ${timeoutMs}ms`);
    }
    throw new ApiError(`${path} failed: ${(error as Error).message}`);
  } finally {
    clearTimeout(timer);
  }
}

export function fetchProposals(): Promise<{ proposals: Proposal[] }> {
  return request<{ proposals: Proposal[] }>('/api/proposals');
}

export function fetchMetrics(): Promise<GovernanceMetrics> {
  return request<GovernanceMetrics>('/api/analytics/metrics');
}

/**
 * On-chain writes follow a build -> sign -> submit flow instead of the old
 * approach (fabricate a proposal object client-side with `Date.now()` as its
 * ID and POST it straight to a webhook). That old flow meant anyone with the
 * API URL could create fake proposals with a single curl request — no wallet,
 * no signature, nothing on-chain at all.
 *
 * The backend is expected to hold the actual contract binding and expose:
 *   POST /api/proposals/build  { title, description, durationDays, creator } -> { xdr }
 *   POST /api/proposals/submit { signedXdr }                                 -> { proposal }
 *   POST /api/votes/build      { proposalId, voter, support }                -> { xdr }
 *   POST /api/votes/submit     { signedXdr }                                 -> { proposal }
 * This keeps the contract ABI out of the browser bundle and means every
 * write is signed by the connected wallet before it touches the chain.
 */
export function buildCreateProposalTx(input: {
  title: string;
  description: string;
  durationDays: number;
  creator: string;
}): Promise<{ xdr: string }> {
  return request<{ xdr: string }>('/api/proposals/build', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function submitCreateProposalTx(signedXdr: string): Promise<{ proposal: Proposal }> {
  return request<{ proposal: Proposal }>('/api/proposals/submit', {
    method: 'POST',
    body: JSON.stringify({ signedXdr }),
  });
}

export function buildVoteTx(input: {
  proposalId: number;
  voter: string;
  support: boolean;
}): Promise<{ xdr: string }> {
  return request<{ xdr: string }>('/api/votes/build', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function submitVoteTx(signedXdr: string): Promise<{ proposal: Proposal }> {
  return request<{ proposal: Proposal }>('/api/votes/submit', {
    method: 'POST',
    body: JSON.stringify({ signedXdr }),
  });
}
