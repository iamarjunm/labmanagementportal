import type {Dispatch, SetStateAction} from 'react';
import type {Lab} from '../types';

type LabsTabProps = {
  isSuperAdmin: boolean;
  isAdmin?: boolean;
  labs: Lab[];
  assignedLabs?: Lab[];
  selectedLabs: string[];
  setSelectedLabs: Dispatch<SetStateAction<string[]>>;
  toggleSelectAllLabs: (selected: boolean) => void;
  deleteSelectedLabs: () => Promise<void>;
  openLabModal: (lab: Lab) => void;
  deleteLab: (id: string) => Promise<void>;
  toggleLabActive: (id: string, isActive: boolean) => Promise<void>;
  bulkSetLabStatus: (isActive: boolean) => Promise<void>;
  labStatus: string | null;
  isDeletingLabs?: boolean;
};

export function LabsTab({
  isSuperAdmin,
  isAdmin,
  labs,
  assignedLabs = [],
  selectedLabs,
  setSelectedLabs,
  toggleSelectAllLabs,
  deleteSelectedLabs,
  openLabModal,
  deleteLab,
  toggleLabActive,
  bulkSetLabStatus,
  labStatus,
  isDeletingLabs,
}: LabsTabProps) {
  // For admins, separate labs into managed and others
  const managedLabIds = new Set(assignedLabs.map((lab) => lab._id));
  const otherLabs = labs.filter((lab) => !managedLabIds.has(lab._id));

  const renderLabCard = (lab: Lab, isManaged: boolean = false) => (
    <article key={lab._id} className={`rounded-3xl border p-5 shadow-sm ${isManaged ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          {isSuperAdmin ? (
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300"
              checked={selectedLabs.includes(lab._id)}
              onChange={() => setSelectedLabs((prev) => prev.includes(lab._id) ? prev.filter((id) => id !== lab._id) : [...prev, lab._id])}
            />
          ) : null}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-slate-900">{lab.labName || 'Unnamed lab'}</h3>
              {isManaged && <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">Managed</span>}
            </div>
            <p className="mt-1 text-sm text-slate-500">Lab Number: {lab.labNumber || '-'} • Location: {lab.locationBuildingName || '-'}</p>
            <p className="mt-1 text-sm text-slate-500">Department: {lab.departmentName || '-'}</p>
            {lab.assignedAdmins?.length ? (
              <p className="mt-1 text-sm text-slate-500">Managed by: {lab.assignedAdmins.map((admin) => admin.fullName).join(', ')}</p>
            ) : null}
          </div>
        </div>

        {lab.images && lab.images.length > 0 && (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {lab.images.map((img) => (
              <img key={img.asset._id} src={img.asset.url} alt="Lab preview" className="h-24 w-36 rounded-xl object-cover border border-slate-200" />
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {!lab.isActive && <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">Inactive</span>}
            {(isManaged || isSuperAdmin) && (
              <label className="flex cursor-pointer items-center gap-2">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={lab.isActive ?? true} onChange={(e) => toggleLabActive(lab._id, e.target.checked)} />
                  <div className={`block h-6 w-10 rounded-full transition-colors ${lab.isActive !== false ? 'bg-emerald-400' : 'bg-slate-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${lab.isActive !== false ? 'translate-x-4' : ''}`}></div>
                </div>
                <span className="text-sm font-medium text-slate-600">{lab.isActive !== false ? 'Active' : 'Inactive'}</span>
              </label>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {isManaged ? (
              <button type="button" className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={() => openLabModal(lab)}>
                View
              </button>
            ) : lab.isActive !== false ? (
              <button type="button" className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={() => openLabModal(lab)}>
                Request Access
              </button>
            ) : (
              <button type="button" disabled className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400 cursor-not-allowed">
                Currently Unavailable
              </button>
            )}
            {isSuperAdmin && (
              <>
                <button type="button" className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={() => openLabModal(lab)}>
                  Edit
                </button>
                <button type="button" className="rounded-2xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50" onClick={() => deleteLab(lab._id)}>
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );

  return (
    <section className="space-y-8">
      {isSuperAdmin ? (
        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            onClick={() => toggleSelectAllLabs(selectedLabs.length !== labs.length)}
          >
            {selectedLabs.length === labs.length && labs.length > 0 ? 'Clear all' : 'Select all'}
          </button>
          <button
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            onClick={() => bulkSetLabStatus(true)}
            disabled={!selectedLabs.length}
          >
            Set Active
          </button>
          <button
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            onClick={() => bulkSetLabStatus(false)}
            disabled={!selectedLabs.length}
          >
            Set Inactive
          </button>
          <button
            className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            onClick={deleteSelectedLabs}
            disabled={!selectedLabs.length}
          >
            Delete selected labs
          </button>
        </div>
      ) : null}

      {/* For Admins: Show Managed Labs Section */}
      {isAdmin && assignedLabs.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">Your Managed Labs</h2>
          <div className="grid gap-4">
            {assignedLabs.map((lab) => renderLabCard(lab, true))}
          </div>
        </div>
      )}

      {/* For Admins: Show Other Labs Section */}
      {isAdmin && otherLabs.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">Other Available Labs</h2>
          <div className="grid gap-4">
            {otherLabs.map((lab) => renderLabCard(lab, false))}
          </div>
        </div>
      )}

      {/* For Super Admin and Users: Show All Labs */}
      {!isAdmin && (
        <div className="grid gap-4">
          {labs.map((lab) => renderLabCard(lab, false))}
        </div>
      )}

      {labStatus ? <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{labStatus}</p> : null}
    </section>
  );
}
