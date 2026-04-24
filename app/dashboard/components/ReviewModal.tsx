import type {Dispatch, SetStateAction} from 'react';
import type {AccessRequest, ReviewDraft} from '../types';

type ReviewModalProps = {
  request: AccessRequest | null;
  reviewDraft: ReviewDraft;
  setReviewDraft: Dispatch<SetStateAction<ReviewDraft>>;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting?: boolean;
};

export function ReviewModal({request, reviewDraft, setReviewDraft, onClose, onSubmit, isSubmitting}: ReviewModalProps) {
  if (!request) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-lg">
        {/* Header */}
        <div className="border-b border-slate-200 px-8 py-6">
          <h2 className="text-2xl font-semibold text-slate-900">Review Request</h2>
          <p className="mt-1 text-sm text-slate-600">{request.lab?.labName || 'Unknown Lab'}</p>
        </div>

        {/* Content */}
        <div className="space-y-6 px-8 py-6">
          {/* Request Details */}
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">Request Details</p>
            <div className="mt-3 space-y-2 text-sm">
              <p><span className="font-semibold text-slate-700">Requested by:</span> {request.requestedBy?.fullName} (@{request.requestedBy?.username})</p>
              <p><span className="font-semibold text-slate-700">Reason:</span> {request.reason}</p>
              <p><span className="font-semibold text-slate-700">Date:</span> {request.requestDate ? new Date(request.requestDate).toLocaleDateString() : '-'}</p>
              <p><span className="font-semibold text-slate-700">Time:</span> {request.startTime ? new Date(request.startTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '-'} to {request.endTime ? new Date(request.endTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '-'}</p>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Decision</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setReviewDraft((prev) => ({...prev, status: 'approved'}))}
                className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  reviewDraft.status === 'approved'
                    ? 'bg-emerald-600 text-white'
                    : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                ✓ Approve
              </button>
              <button
                type="button"
                onClick={() => setReviewDraft((prev) => ({...prev, status: 'rejected'}))}
                className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  reviewDraft.status === 'rejected'
                    ? 'bg-rose-600 text-white'
                    : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                ✕ Reject
              </button>
            </div>
          </div>

          {/* Review Note */}
          <div>
            <label htmlFor="reviewNote" className="block text-sm font-semibold text-slate-700 mb-2">
              Review Note {reviewDraft.status && '(optional)'}
            </label>
            <textarea
              id="reviewNote"
              value={reviewDraft.reviewNote}
              onChange={(e) => setReviewDraft((prev) => ({...prev, reviewNote: e.target.value}))}
              placeholder="Add a note to explain your decision (visible to requester and lab admins)..."
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              rows={4}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 flex gap-3 justify-end px-8 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-2xl border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!reviewDraft.status || isSubmitting}
            className="rounded-2xl bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
