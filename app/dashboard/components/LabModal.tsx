import type {Dispatch, SetStateAction} from 'react';
import type {Lab, LabDraft, RequestDraft, UserRecord} from '../types';

type LabModalProps = {
  labModal: Lab | null;
  mode: 'edit' | 'request' | 'view';
  closeLabModal: () => void;
  isSuperAdmin: boolean;
  labDraft: LabDraft;
  setLabDraft: Dispatch<SetStateAction<LabDraft>>;
  adminUsers: UserRecord[];
  toggleLabAdminSelection: (selected: boolean) => void;
  saveLab: () => Promise<void>;
  requestDraft: RequestDraft;
  setRequestDraft: Dispatch<SetStateAction<RequestDraft>>;
  submitRequest: () => Promise<void>;
  requestStatus: string | null;
};

export function LabModal({
  labModal,
  mode,
  closeLabModal,
  isSuperAdmin,
  labDraft,
  setLabDraft,
  adminUsers,
  toggleLabAdminSelection,
  saveLab,
  requestDraft,
  setRequestDraft,
  submitRequest,
  requestStatus,
}: LabModalProps) {
  if (!labModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Lab details</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">{labModal.labName || 'Unnamed lab'}</h3>
            <p className="mt-1 text-sm text-slate-500">{labModal.labNumber || '-'} • {labModal.departmentName || '-'}</p>
          </div>
          <button className="text-sm font-semibold text-slate-500" onClick={closeLabModal}>Close</button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm leading-7 text-slate-700">Location: {labModal.locationBuildingName || '-'}</p>
            <p className="text-sm leading-7 text-slate-700">Department: {labModal.departmentName || '-'}</p>
            <p className="text-sm leading-7 text-slate-700">Lab Number: {labModal.labNumber || '-'}</p>
            <p className="text-sm leading-7 text-slate-700">Status: {labModal.isActive ? 'Active' : 'Inactive'}</p>
            {labModal.assignedAdmins?.length ? <p className="text-sm leading-7 text-slate-700">Assigned admins: {labModal.assignedAdmins.map((admin) => admin.fullName).join(', ')}</p> : null}
            {labModal.description ? <p className="text-sm leading-7 text-slate-600">{labModal.description}</p> : null}
          </div>

          {mode === 'edit' && isSuperAdmin ? (
            <div className="space-y-4 rounded-2xl border border-slate-200 p-5">
              <h4 className="text-lg font-semibold text-slate-900">Edit lab and assignments</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-600">
                  <span>Lab Name</span>
                  <input value={labDraft.labName} onChange={(event) => setLabDraft((prev) => ({...prev, labName: event.target.value}))} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>
                <label className="space-y-2 text-sm text-slate-600">
                  <span>Lab Number</span>
                  <input value={labDraft.labNumber} onChange={(event) => setLabDraft((prev) => ({...prev, labNumber: event.target.value}))} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>
                <label className="space-y-2 text-sm text-slate-600 md:col-span-2">
                  <span>Location/Building name</span>
                  <input value={labDraft.locationBuildingName} onChange={(event) => setLabDraft((prev) => ({...prev, locationBuildingName: event.target.value}))} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>
                <label className="space-y-2 text-sm text-slate-600 md:col-span-2">
                  <span>Department Name</span>
                  <input value={labDraft.departmentName} onChange={(event) => setLabDraft((prev) => ({...prev, departmentName: event.target.value}))} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>
                <label className="space-y-2 text-sm text-slate-600 md:col-span-2">
                  <span>Website URL</span>
                  <input value={labDraft.websiteUrl} onChange={(event) => setLabDraft((prev) => ({...prev, websiteUrl: event.target.value}))} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>
                <label className="space-y-2 text-sm text-slate-600 md:col-span-2">
                  <span>Description</span>
                  <textarea value={labDraft.description} onChange={(event) => setLabDraft((prev) => ({...prev, description: event.target.value}))} rows={4} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>
                <div className="space-y-3 md:col-span-2">
                  <span className="text-sm text-slate-600">Images</span>
                  {labDraft.existingImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {labDraft.existingImages.map((img) => (
                        <div key={img.assetId} className="relative group overflow-hidden rounded-xl border border-slate-200">
                          <img src={img.url} alt="Lab" className="h-24 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setLabDraft(prev => ({...prev, existingImages: prev.existingImages.filter(i => i.assetId !== img.assetId)}))}
                            className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {labDraft.newFiles.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 mt-2">
                      {labDraft.newFiles.map((file, idx) => (
                        <div key={idx} className="relative group overflow-hidden rounded-xl border border-slate-200">
                          <img src={URL.createObjectURL(file)} alt="New Lab Image" className="h-24 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setLabDraft(prev => ({...prev, newFiles: prev.newFiles.filter((_, i) => i !== idx)}))}
                            className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => {
                      const files = Array.from(event.target.files || []);
                      setLabDraft(prev => ({...prev, newFiles: [...prev.newFiles, ...files]}));
                      event.target.value = '';
                    }}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input type="checkbox" checked={labDraft.isActive} onChange={(event) => setLabDraft((prev) => ({...prev, isActive: event.target.checked}))} /> Active
              </label>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-700">Assigned admins</p>
                  <button type="button" className="text-sm font-semibold text-slate-700" onClick={() => toggleLabAdminSelection(labDraft.assignedAdminIds.length !== adminUsers.length)}>
                    {labDraft.assignedAdminIds.length === adminUsers.length && adminUsers.length > 0 ? 'Clear all' : 'Select all'}
                  </button>
                </div>
                <div className="grid max-h-56 gap-2 overflow-auto pr-1 md:grid-cols-2">
                  {adminUsers.map((adminUser) => (
                    <label key={adminUser._id} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                      <input type="checkbox" checked={labDraft.assignedAdminIds.includes(adminUser._id)} onChange={() => setLabDraft((prev) => ({...prev, assignedAdminIds: prev.assignedAdminIds.includes(adminUser._id) ? prev.assignedAdminIds.filter((id) => id !== adminUser._id) : [...prev.assignedAdminIds, adminUser._id]}))} />
                      <span>{adminUser.fullName}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white" onClick={saveLab}>Save changes</button>
                <button type="button" className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700" onClick={closeLabModal}>Cancel</button>
              </div>
            </div>
          ) : mode === 'request' ? (
            <div className="space-y-4 rounded-2xl border border-slate-200 p-5">
              <h4 className="text-lg font-semibold text-slate-900">Request access</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-600">
                  <span>Date</span>
                  <input type="date" value={requestDraft.requestDate} onChange={(event) => setRequestDraft((prev) => ({...prev, requestDate: event.target.value}))} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>
                <label className="space-y-2 text-sm text-slate-600">
                  <span>Start Time</span>
                  <input type="time" value={requestDraft.startTime} onChange={(event) => setRequestDraft((prev) => ({...prev, startTime: event.target.value}))} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>
                <label className="space-y-2 text-sm text-slate-600">
                  <span>End Time</span>
                  <input type="time" value={requestDraft.endTime} onChange={(event) => setRequestDraft((prev) => ({...prev, endTime: event.target.value}))} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>
                <label className="space-y-2 text-sm text-slate-600 md:col-span-2">
                  <span>Reason</span>
                  <textarea value={requestDraft.reason} onChange={(event) => setRequestDraft((prev) => ({...prev, reason: event.target.value}))} rows={4} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white" onClick={submitRequest}>Submit request</button>
                <button type="button" className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700" onClick={closeLabModal}>Cancel</button>
                {requestStatus ? <p className="text-sm font-medium text-rose-600">{requestStatus}</p> : null}
              </div>
            </div>
          ) : (
            <div className="space-y-4 rounded-2xl border border-slate-200 p-5 flex items-center justify-center bg-slate-50">
              <p className="text-sm text-slate-500">You are managing this lab. Use the dashboard controls to edit its availability.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
