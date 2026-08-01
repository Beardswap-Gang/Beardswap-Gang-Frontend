'use client';

import { useEffect, useState } from 'react';
import { buildCreateProposalTx, submitCreateProposalTx } from '@/lib/api';
import { signTransaction } from '@/lib/freighter';
import { useToast } from '@/components/Toast';

const MIN_DURATION_DAYS = 1;
const MAX_DURATION_DAYS = 30;

interface CreateProposalModalProps {
  walletAddress: string | null;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateProposalModal({ walletAddress, onClose, onCreated }: CreateProposalModalProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('7');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, isSubmitting]);

  const validate = (): string | null => {
    if (!walletAddress) return 'Connect your wallet first.';
    if (!title.trim()) return 'Title is required.';
    if (title.length > 120) return 'Title must be 120 characters or fewer.';
    if (!description.trim()) return 'Description is required.';
    if (description.length > 2000) return 'Description must be 2000 characters or fewer.';
    const durationDays = Number(duration);
    if (!Number.isFinite(durationDays) || durationDays < MIN_DURATION_DAYS || durationDays > MAX_DURATION_DAYS) {
      return `Duration must be between ${MIN_DURATION_DAYS} and ${MAX_DURATION_DAYS} days.`;
    }
    return null;
  };

  const handleCreate = async () => {
    const validationError = validate();
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { xdr } = await buildCreateProposalTx({
        title: title.trim(),
        description: description.trim(),
        durationDays: Number(duration),
        creator: walletAddress as string,
      });
      const signedXdr = await signTransaction(xdr, { address: walletAddress ?? undefined });
      await submitCreateProposalTx(signedXdr);

      showToast('Proposal created.', 'success');
      onCreated();
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to create proposal.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-proposal-title"
      onClick={() => !isSubmitting && onClose()}
    >
      <div
        className="bg-slate-800 rounded-xl p-8 max-w-lg w-full mx-4 border border-purple-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="create-proposal-title" className="text-2xl font-bold text-white mb-6">
          Create New Proposal
        </h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="proposal-title" className="block text-purple-300 text-sm font-medium mb-2">
              Title
            </label>
            <input
              id="proposal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="w-full px-4 py-3 bg-slate-700 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500"
              placeholder="Enter proposal title"
            />
          </div>

          <div>
            <label htmlFor="proposal-description" className="block text-purple-300 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="proposal-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={2000}
              className="w-full px-4 py-3 bg-slate-700 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500 resize-none"
              placeholder="Enter proposal description"
            />
          </div>

          <div>
            <label htmlFor="proposal-duration" className="block text-purple-300 text-sm font-medium mb-2">
              Voting Duration (days)
            </label>
            <input
              id="proposal-duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min={MIN_DURATION_DAYS}
              max={MAX_DURATION_DAYS}
              className="w-full px-4 py-3 bg-slate-700 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500"
              placeholder="7"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Proposal'}
          </button>
        </div>
      </div>
    </div>
  );
}
