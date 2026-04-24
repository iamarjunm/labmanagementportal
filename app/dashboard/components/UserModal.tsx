import type {Dispatch, SetStateAction} from 'react';
import type {Lab, UserDraft, UserRecord} from '../types';

type UserModalProps = {
  editingUser: UserRecord | null;
  closeUserModal: () => void;
  userDraft: UserDraft;
  setUserDraft: Dispatch<SetStateAction<UserDraft>>;
  setEditUserRole: (role: 'super_admin' | 'admin' | 'user') => void;
  labs: Lab[];
  toggleEditUserLabSelection: (selected: boolean) => void;
  saveUser: () => Promise<void>;
};

export function UserModal({
  editingUser,
  closeUserModal,
  userDraft,
  setUserDraft,
  setEditUserRole,
  labs,
  toggleEditUserLabSelection,
  saveUser,
}: UserModalProps) {
  if (!editingUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Edit profile</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">{editingUser.fullName}</h3>
          </div>
          <button className="text-sm font-semibold text-slate-500" type="button" onClick={closeUserModal}>Close</button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-600">
            <span>Full Name</span>
            <input value={userDraft.fullName} onChange={(event) => setUserDraft((prev) => ({...prev, fullName: event.target.value}))} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            <span>Username</span>
            <input value={userDraft.username} onChange={(event) => setUserDraft((prev) => ({...prev, username: event.target.value}))} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            <span>Email</span>
            <input value={userDraft.email} onChange={(event) => setUserDraft((prev) => ({...prev, email: event.target.value}))} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            <span>Password</span>
            <input type="password" value={userDraft.password} onChange={(event) => setUserDraft((prev) => ({...prev, password: event.target.value}))} className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Leave blank to keep current" />
          </label>
          <label className="space-y-2 text-sm text-slate-600 md:col-span-2">
            <span>Role</span>
            <select value={userDraft.role} onChange={(event) => setEditUserRole(event.target.value as UserDraft['role'])} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </label>
          <label className="flex items-center gap-3 text-sm text-slate-700 md:col-span-2">
            <input type="checkbox" checked={userDraft.isActive} onChange={(event) => setUserDraft((prev) => ({...prev, isActive: event.target.checked}))} /> Active
          </label>
        </div>

        {userDraft.role === 'admin' ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-700">Assigned labs</p>
              <button type="button" className="text-sm font-semibold text-slate-700" onClick={() => toggleEditUserLabSelection(userDraft.assignedLabIds.length !== labs.length)}>
                {userDraft.assignedLabIds.length === labs.length && labs.length > 0 ? 'Clear all' : 'Select all'}
              </button>
            </div>
            <div className="grid max-h-56 gap-2 overflow-auto pr-1 md:grid-cols-2">
              {labs.map((lab) => (
                <label key={lab._id} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={userDraft.assignedLabIds.includes(lab._id)}
                    onChange={() => setUserDraft((prev) => ({...prev, assignedLabIds: prev.assignedLabIds.includes(lab._id) ? prev.assignedLabIds.filter((id) => id !== lab._id) : [...prev.assignedLabIds, lab._id]}))}
                  />
                  <span>{lab.labName || 'Unnamed lab'}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white" onClick={saveUser}>Save profile</button>
          <button type="button" className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700" onClick={closeUserModal}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
