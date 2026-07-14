/**
 * Freighter Wallet Integration for Aesdecodes DAO Governance
 * 
 * This module provides utilities for connecting to the Stellar Freighter wallet
 * and signing transactions for the DAO governance system.
 */

export interface FreighterWallet {
  isConnected: () => Promise<boolean>;
  getPublicKey: () => Promise<string>;
  signTransaction: (xdr: string, network?: string) => Promise<string>;
  signAuthEntry: (entry: string) => Promise<string>;
}

declare global {
  interface Window {
    freighter?: FreighterWallet;
  }
}

/**
 * Check if Freighter wallet is available
 */
export function isFreighterAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.freighter;
}

/**
 * Check if wallet is connected
 */
export async function isWalletConnected(): Promise<boolean> {
  if (!isFreighterAvailable()) {
    return false;
  }
  try {
    return await window.freighter!.isConnected();
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return false;
  }
}

/**
 * Get the public key from the connected wallet
 */
export async function getWalletPublicKey(): Promise<string> {
  if (!isFreighterAvailable()) {
    throw new Error('Freighter wallet is not available');
  }
  try {
    return await window.freighter!.getPublicKey();
  } catch (error) {
    console.error('Error getting public key:', error);
    throw new Error('Failed to get public key from wallet');
  }
}

/**
 * Connect to the Freighter wallet
 */
export async function connectWallet(): Promise<string> {
  if (!isFreighterAvailable()) {
    throw new Error('Freighter walnet is not installed');
  }
  
  try {
    const publicKey = await window.freighter!.getPublicKey();
    return publicKey;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw new Error('Failed to connect to wallet');
  }
}

/**
 * Sign a transaction using Freighter
 */
export async function signTransaction(xdr: string, network: string = 'TESTNET'): Promise<string> {
  if (!isFreighterAvailable()) {
    throw new Error('Freighter wallet is not available');
  }
  
  try {
    const signedXDR = await window.freighter!.signTransaction(xdr, network);
    return signedXDR;
  } catch (error) {
    console.error('Error signing transaction:', error);
    throw new Error('Failed to sign transaction');
  }
}

/**
 * Sign an auth entry using Freighter
 */
export async function signAuthEntry(entry: string): Promise<string> {
  if (!isFreighterAvailable()) {
    throw new Error('Freighter wallet is not available');
  }
  
  try {
    const signedEntry = await window.freighter!.signAuthEntry(entry);
    return signedEntry;
  } catch (error) {
    console.error('Error signing auth entry:', error);
    throw new Error('Failed to sign auth entry');
  }
}

/**
 * Network configuration for Soroban
 */
export const NETWORK_CONFIG = {
  TESTNET: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org',
  },
  MAINNET: {
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    rpcUrl: 'https://mainnet.soroban.stellar.org',
  },
};

/**
 * Get network configuration
 */
export function getNetworkConfig(network: 'TESTNET' | 'MAINNET' = 'TESTNET') {
  return NETWORK_CONFIG[network];
}
