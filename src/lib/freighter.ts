/**
 * Freighter Wallet Integration for beardswap Gang DAO Governance
 *
 * IMPORTANT: The Freighter browser extension does NOT inject a `window.freighter`
 * object with `getPublicKey`/`signTransaction`/etc. methods. It communicates with
 * the page through the official `@stellar/freighter-api` package (already listed
 * in package.json), which internally handles the extension's messaging protocol.
 * Calling into a hand-rolled `window.freighter` object — as the previous version
 * of this file did — silently fails for every real user with the extension
 * installed, because that object never exists.
 */
import {
  isConnected as freighterIsConnected,
  isAllowed as freighterIsAllowed,
  requestAccess,
  getAddress,
  signTransaction as freighterSignTransaction,
  signAuthEntry as freighterSignAuthEntry,
  WatchWalletChanges,
} from '@stellar/freighter-api';

export type StellarNetwork = 'TESTNET' | 'MAINNET';

export class FreighterError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'FreighterError';
  }
}

/** Network configuration for Soroban RPC + signing. */
export const NETWORK_CONFIG: Record<StellarNetwork, { networkPassphrase: string; rpcUrl: string }> = {
  TESTNET: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org',
  },
  MAINNET: {
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    rpcUrl: 'https://mainnet.soroban.stellar.org',
  },
};

export function getNetworkConfig(network: StellarNetwork = 'TESTNET') {
  return NETWORK_CONFIG[network];
}

/** Detects whether the Freighter browser extension is installed at all. */
export async function isFreighterAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const { isConnected, error } = await freighterIsConnected();
    if (error) return false;
    return isConnected;
  } catch {
    return false;
  }
}

/** Whether this site has already been granted access (no popup needed). */
export async function isWalletConnected(): Promise<boolean> {
  try {
    const { isAllowed, error } = await freighterIsAllowed();
    if (error) return false;
    return isAllowed;
  } catch (error) {
    console.error('Error checking wallet permission:', error);
    return false;
  }
}

/**
 * Prompts the user (via the Freighter popup, if not already authorized) and
 * returns their public key. Use this for the "Connect Wallet" button.
 */
export async function connectWallet(): Promise<string> {
  const available = await isFreighterAvailable();
  if (!available) {
    throw new FreighterError(
      'Freighter wallet extension not detected. Install it from freighter.app and refresh the page.'
    );
  }

  const { address, error } = await requestAccess();
  if (error) {
    throw new FreighterError('User declined wallet access, or Freighter is locked.', error);
  }
  if (!address) {
    throw new FreighterError('Freighter returned no address.');
  }
  return address;
}

/**
 * Reads the current public key WITHOUT prompting the user. Returns null if
 * the wallet isn't installed, is locked, or hasn't authorized this site yet —
 * callers should fall back to showing a "Connect Wallet" button in that case.
 */
export async function getWalletPublicKeySilent(): Promise<string | null> {
  const available = await isFreighterAvailable();
  if (!available) return null;

  const allowed = await isWalletConnected();
  if (!allowed) return null;

  try {
    const { address, error } = await getAddress();
    if (error || !address) return null;
    return address;
  } catch (error) {
    console.error('Error reading wallet address:', error);
    return null;
  }
}

/**
 * Signs a transaction XDR for submission to the network. `networkPassphrase`
 * must match the network the transaction was built for — mismatches are a
 * common source of "transaction signed for wrong network" failures.
 */
export async function signTransaction(
  xdr: string,
  opts: { network?: StellarNetwork; address?: string } = {}
): Promise<string> {
  const network = opts.network ?? 'TESTNET';
  const { networkPassphrase } = getNetworkConfig(network);

  const available = await isFreighterAvailable();
  if (!available) {
    throw new FreighterError('Freighter wallet is not available.');
  }

  try {
    const result = await freighterSignTransaction(xdr, {
      networkPassphrase,
      address: opts.address,
    });
    if (result.error) {
      throw new FreighterError('Freighter rejected the signing request.', result.error);
    }
    return result.signedTxXdr;
  } catch (error) {
    if (error instanceof FreighterError) throw error;
    console.error('Error signing transaction:', error);
    throw new FreighterError('Failed to sign transaction.', error);
  }
}

/** Signs a Soroban auth entry (needed for some contract invocations). */
export async function signAuthEntry(
  entryXdr: string,
  opts: { address?: string } = {}
): Promise<string> {
  const available = await isFreighterAvailable();
  if (!available) {
    throw new FreighterError('Freighter wallet is not available.');
  }

  try {
    const result = await freighterSignAuthEntry(entryXdr, { address: opts.address });
    if (result.error) {
      throw new FreighterError('Freighter rejected the auth entry signing request.', result.error);
    }
    return result.signedAuthEntry ?? '';
  } catch (error) {
    if (error instanceof FreighterError) throw error;
    console.error('Error signing auth entry:', error);
    throw new FreighterError('Failed to sign auth entry.', error);
  }
}

/**
 * Subscribes to wallet account/network changes (e.g. user switches accounts
 * or networks inside the extension) so the UI can react instead of going stale.
 * Returns an unsubscribe function.
 */
export function watchWalletChanges(onChange: (data: { address: string; network: string }) => void): () => void {
  const watcher = new WatchWalletChanges(3000);
  watcher.watch((data) => onChange(data));
  return () => watcher.stop();
}
