import {useMemo, useState} from 'react';
import type {AccessRequest} from '../types';

type RequestsTabProps = {
  requests: AccessRequest[];
  requestStatus: string | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  onReviewClick: (request: AccessRequest) => void;
};

export function RequestsTab({requests, requestStatus, isSuperAdmin, isAdmin, onReviewClick}: RequestsTabProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [filterUser, setFilterUser] = useState<string>('');
  const [filterDept, setFilterDept] = useState<string>('');

  const normalizeDepartmentName = (departmentName: string) => departmentName.trim().toLowerCase();

  // Only show admin/super-admin features if user is admin or super-admin
  const showFilters = isSuperAdmin || isAdmin;

  // Calculate statistics
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === 'pending').length;
    const approved = requests.filter((r) => r.status === 'approved').length;
    const rejected = requests.filter((r) => r.status === 'rejected').length;
    return {total, pending, approved, rejected};
  }, [requests]);

  // Get unique users and departments for filters
  const uniqueUsers = useMemo(() => {
    const users = new Map<string, {id: string; name: string; username: string}>();
    requests.forEach((req) => {
      if (req.requestedBy && req.requestedBy._id) {
        users.set(req.requestedBy._id, {
          id: req.requestedBy._id,
          name: req.requestedBy.fullName,
          username: req.requestedBy.username,
        });
      }
    });
    return Array.from(users.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [requests]);

  const uniqueDepts = useMemo(() => {
    const depts = new Map<string, string>();

    requests.forEach((req) => {
      const departmentName = req.lab?.departmentName?.trim();
      if (!departmentName) return;

      const normalizedDepartmentName = normalizeDepartmentName(departmentName);
      if (!depts.has(normalizedDepartmentName)) {
        depts.set(normalizedDepartmentName, departmentName);
      }
    });

    return Array.from(depts.entries())
      .map(([value, label]) => ({value, label}))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [requests]);

  // Filter requests based on selected filters
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (filterStatus !== 'all' && req.status !== filterStatus) return false;
      if (filterUser && req.requestedBy?._id !== filterUser) return false;
      if (filterDept && normalizeDepartmentName(req.lab?.departmentName ?? '') !== filterDept) return false;
      return true;
    });
  }, [requests, filterStatus, filterUser, filterDept]);

  return (
    <section className="space-y-6">
      {requestStatus ? <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{requestStatus}</p> : null}

      {/* Admin/Super-Admin Only: Statistics & Filters */}
      {showFilters && (
        <>
          {/* Statistics Cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">Total Requests</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">Pending</p>
              <p className="mt-2 text-3xl font-bold text-amber-900">{stats.pending}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Approved</p>
              <p className="mt-2 text-3xl font-bold text-emerald-900">{stats.approved}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">Rejected</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.rejected}</p>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-600">Filters</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* User Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Requested By</label>
                <select
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">All Users</option>
                  {uniqueUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} (@{user.username})
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Department</label>
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">All Departments</option>
                  {uniqueDepts.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(filterStatus !== 'all' || filterUser || filterDept) && (
              <button
                type="button"
                onClick={() => {
                  setFilterStatus('all');
                  setFilterUser('');
                  setFilterDept('');
                }}
                className="mt-4 text-sm font-semibold text-slate-600 hover:text-slate-900 underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Results Count */}
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold">{filteredRequests.length}</span> of <span className="font-semibold">{requests.length}</span> requests
          </p>
        </>
      )}

      {/* Requests List */}
      <div className="grid gap-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((item) => (
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
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600">No requests found matching your filters.</p>
          </div>
        )}
      </div>
    </section>
  );
}
