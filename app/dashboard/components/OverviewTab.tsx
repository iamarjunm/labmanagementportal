import type {Lab, AccessRequest} from '../types';

type OverviewTabProps = {
  role?: 'super_admin' | 'admin' | 'user';
  user?: {
    fullName?: string;
    username?: string;
  } | null;
  labs: Lab[];
  assignedLabs: Lab[];
  totalUsers?: number;
  pendingRequests: AccessRequest[];
  approvedRequests: AccessRequest[];
  allRequests: AccessRequest[];
};

export function OverviewTab({role, user, labs, assignedLabs, totalUsers = 0, pendingRequests, approvedRequests, allRequests}: OverviewTabProps) {
  const userAssignedLabCount = assignedLabs.length;
  const adminPendingCount = pendingRequests.filter((r) => r.status === 'pending').length;
  const adminApprovedCount = approvedRequests.filter((r) => r.status === 'approved').length;
  const userPendingCount = allRequests.filter((r) => r.status === 'pending').length;
  const userApprovedCount = allRequests.filter((r) => r.status === 'approved').length;

  return (
    <section className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Welcome, {user?.fullName || 'User'}</h2>
        <p className="mt-1 text-sm text-slate-600">@{user?.username || 'username'}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Labs - All Roles */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Total Labs Available</p>
          <p className="mt-3 text-4xl font-bold text-emerald-600">{labs.length}</p>
        </div>

        {/* Role-specific Stats */}
        {role === 'super_admin' && (
          <>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Portal Users</p>
              <p className="mt-3 text-4xl font-bold text-blue-600">{totalUsers}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Pending Requests</p>
              <p className="mt-3 text-4xl font-bold text-amber-600">{pendingRequests.length}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Approved Requests</p>
              <p className="mt-3 text-4xl font-bold text-green-600">{approvedRequests.length}</p>
            </div>
          </>
        )}

        {role === 'admin' && (
          <>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Labs You Manage</p>
              <p className="mt-3 text-4xl font-bold text-blue-600">{userAssignedLabCount}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Pending Reviews</p>
              <p className="mt-3 text-4xl font-bold text-amber-600">{adminPendingCount}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Approved Requests</p>
              <p className="mt-3 text-4xl font-bold text-green-600">{adminApprovedCount}</p>
            </div>
          </>
        )}

        {role === 'user' && (
          <>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Your Pending Requests</p>
              <p className="mt-3 text-4xl font-bold text-amber-600">{userPendingCount}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Your Approved Requests</p>
              <p className="mt-3 text-4xl font-bold text-green-600">{userApprovedCount}</p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
