'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, fetchMetrics, fetchProposals, GovernanceMetrics, Proposal } from '@/lib/api';

interface WsMessage {
  type: 'proposal_update' | 'vote_cast' | string;
}

export function useProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [metrics, setMetrics] = useState<GovernanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tracks whether the component is still mounted, so the reconnect loop
  // below stops instead of running forever after unmount (the original
  // implementation had no cleanup at all — every unmount/remount pair left
  // a zombie WebSocket reconnecting in the background indefinitely).
  const mountedRef = useRef(true);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadProposals = useCallback(async () => {
    try {
      const { proposals } = await fetchProposals();
      if (mountedRef.current) setProposals(proposals);
      setError(null);
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof ApiError ? err.message : 'Failed to load proposals.');
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const loadMetrics = useCallback(async () => {
    try {
      const data = await fetchMetrics();
      if (mountedRef.current) setMetrics(data);
    } catch (err) {
      // Metrics are secondary — log but don't block the proposal list on it.
      console.error('Failed to load governance metrics:', err);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadProposals();
    loadMetrics();

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) {
      console.warn('[useProposals] NEXT_PUBLIC_WS_URL is not set; live updates disabled.');
      return () => {
        mountedRef.current = false;
      };
    }

    const connect = () => {
      if (!mountedRef.current) return;
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onmessage = (event) => {
        try {
          const message: WsMessage = JSON.parse(event.data);
          if (message.type === 'proposal_update' || message.type === 'vote_cast') {
            loadProposals();
          }
          if (message.type === 'vote_cast') {
            loadMetrics();
          }
        } catch (err) {
          console.error('Malformed WebSocket message:', err);
        }
      };

      socket.onerror = (err) => {
        console.error('WebSocket error:', err);
      };

      socket.onclose = () => {
        if (!mountedRef.current) return;
        reconnectTimerRef.current = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, [loadProposals, loadMetrics]);

  return { proposals, metrics, loading, error, refresh: loadProposals, refreshMetrics: loadMetrics };
}
