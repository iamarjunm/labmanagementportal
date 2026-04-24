import type {AccessRequest} from '../types';

type RequestsTabProps = {
  requests: AccessRequest[];
  requestStatus: string | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  onReviewClick: (request: AccessRequest) => void;
};

export function RequestsTab({requests, requestStatus, isSuperAdmin, isAdmin, onReviewClick}: RequestsTabProps) {
  return (
    <section className="space-y-4">
      {requestStatus ? <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{requestStatus}</p> : null}
      <div className="grid gap-4">
        {requests.map((item) => (
          <article key={item._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">{item.status}</p>
                <h3 className="text-xl font-semibold text-slate-900">{item.lab?.labName || 'Unknown lab'}</h3>
                <p className="text-sm text-slate-600">Requested by {item.requestedBy?.fullName || 'Unknown'} (@{item.requestedBy?.username || '-'})</p>
                <p className="text-sm text-slate-600">
                  {item.requestDate ? new Date(item.requestDate).toLocaleDateString() : '-'} • {item.startTime ? new Date(item.startTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '-'} to {item.endTime ? new Date(item.endTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '-'}
                </p>
                <p className="text-sm leading-7 text-slate-600">{item.reason || 'No reason provided'}</p>
                {item.lab?.assignedAdmins?.length ? <p className="text-xs text-slate-500">Assigned admins: {item.lab.assignedAdmins.map((admin) => admin.fullName).join(', ')}</p> : null}
                
                {/* Review Information */}
                {item.status !== 'pending' && item.reviewedBy && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">Review</p>
                    <p className="mt-1 text-sm text-slate-700">Reviewed by <span className="font-semibold">{item.reviewedBy.fullName}</span> (@{item.reviewedBy.username})</p>
                    {item.reviewNote && (
                      <p className="mt-2 text-sm leading-6 text-slate-700 italic">"{item.reviewNote}"</p>
                    )}
                  </div>
                )}
              </div>
              {item.status === 'pending' && (isSuperAdmin || isAdmin) ? (
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700" onClick={() => onReviewClick(item)}>Review</button>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
