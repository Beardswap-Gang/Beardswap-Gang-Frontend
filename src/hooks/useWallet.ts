'use client';

import { useCallback, useEffect, useState } from 'react';
import { connectWallet, getWalletPublicKeySilent, watchWalletChanges } from '@/lib/freighter';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getWalletPublicKeySilent().then((addr) => {
      if (!cancelled) setAddress(addr);
    });

    const unwatch = watchWalletChanges((data) => {
      setAddress(data.address || null);
    });

    return () => {
      cancelled = true;
      unwatch();
    };
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const addr = await connectWallet();
      setAddress(addr);
      return addr;
    } finally {
      setConnecting(false);
    }
  }, []);

  return {
    address,
    isConnected: !!address,
    connecting,
    connect,
  };
}
