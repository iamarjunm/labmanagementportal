import type {FormEvent} from 'react';
import type {Lab, UserDraft, UserRecord} from '../types';

type UsersTabProps = {
  users: UserRecord[];
  labs: Lab[];
  adminUserForm: UserDraft;
  setAdminUserForm: React.Dispatch<React.SetStateAction<UserDraft>>;
  setCreateUserRole: (role: 'super_admin' | 'admin' | 'user') => void;
  toggleCreateUserLabSelection: (selected: boolean) => void;
  createUser: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  openEditUser: (user: UserRecord) => void;
  deleteUser: (id: string) => Promise<void>;
  userStatus: string | null;
};

export function UsersTab({
  users,
  labs,
  adminUserForm,
  setAdminUserForm,
  setCreateUserRole,
  toggleCreateUserLabSelection,
  createUser,
  openEditUser,
  deleteUser,
  userStatus,
}: UsersTabProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <form onSubmit={createUser} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">Add user</h2>
        <p className="text-sm leading-7 text-slate-600">Create admin or user accounts. Super admin accounts are also allowed.</p>

        {([
          ['fullName', 'Full Name'],
          ['username', 'Username'],
          ['email', 'Email'],
          ['password', 'Password'],
        ] as Array<[keyof UserDraft, string]>).map(([key, label]) => (
          <label key={key} className="block space-y-2 text-sm text-slate-600">
            <span>{label}</span>
            <input
              type={key === 'password' ? 'password' : key === 'email' ? 'email' : 'text'}
              value={adminUserForm[key] as string}
              onChange={(event) => setAdminUserForm((prev) => ({...prev, [key]: event.target.value}))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
          </label>
        ))}

        <label className="block space-y-2 text-sm text-slate-600">
          <span>Role</span>
          <select value={adminUserForm.role} onChange={(event) => setCreateUserRole(event.target.value as UserDraft['role'])} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </label>

        {adminUserForm.role === 'admin' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-600">Assign labs to admin</span>
              <button type="button" className="text-sm font-semibold text-slate-700" onClick={() => toggleCreateUserLabSelection(adminUserForm.assignedLabIds.length !== labs.length)}>
                {adminUserForm.assignedLabIds.length === labs.length && labs.length > 0 ? 'Clear all' : 'Select all'}
              </button>
            </div>
            <div className="grid max-h-72 gap-2 overflow-auto pr-1 md:grid-cols-2">
              {labs.map((lab) => (
                <label key={lab._id} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={adminUserForm.assignedLabIds.includes(lab._id)}
                    onChange={() => setAdminUserForm((prev) => ({
                      ...prev,
                      assignedLabIds: prev.assignedLabIds.includes(lab._id)
                        ? prev.assignedLabIds.filter((id) => id !== lab._id)
                        : [...prev.assignedLabIds, lab._id],
                    }))}
                  />
                  <span>{lab.labName || 'Unnamed lab'}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <label className="flex items-center gap-3 text-sm text-slate-700">
          <input type="checkbox" checked={adminUserForm.isActive} onChange={(event) => setAdminUserForm((prev) => ({...prev, isActive: event.target.checked}))} />
          Active
        </label>

        <button type="submit" className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white">Create user</button>
        {userStatus ? <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{userStatus}</p> : null}
      </form>

      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Existing users</h2>
          <div className="mt-4 space-y-3">
            {users.map((record) => (
              <article key={record._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{record.fullName}</p>
                    <p className="text-sm text-slate-600">@{record.username} • {record.role.replace('_', ' ')}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600">{record.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{record.email || 'No email set'}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Assigned labs: {record.assignedLabs?.length ? record.assignedLabs.map((lab) => lab.labName).join(', ') : 'None'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100" onClick={() => openEditUser(record)}>Edit</button>
                  <button type="button" className="rounded-xl border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50" onClick={() => deleteUser(record._id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
