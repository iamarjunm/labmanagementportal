"use client";

import {useEffect, useMemo, useState} from 'react';

type Lab = {
  _id: string;
  labName: string;
};

type Role = 'super_admin' | 'admin' | 'user';

export default function AddUserPage() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('user');
  const [labs, setLabs] = useState<Lab[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadLabs() {
      const response = await fetch('/api/labs', {cache: 'no-store'});
      if (!response.ok) return;

      const payload = (await response.json()) as {labs: Lab[]};
      setLabs(payload.labs);
    }

    loadLabs();
  }, []);

  const canAssignLabs = useMemo(() => role === 'admin' || role === 'user', [role]);

  function toggleLab(labId: string) {
    setSelectedLabs((prev) =>
      prev.includes(labId) ? prev.filter((id) => id !== labId) : [...prev, labId],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          fullName,
          username,
          email,
          password,
          role,
          assignedLabIds: canAssignLabs ? selectedLabs : [],
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Failed to create user.');
      }

      setStatus('User created successfully.');
      setFullName('');
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('user');
      setSelectedLabs([]);
    } catch (createError) {
      setStatus(createError instanceof Error ? createError.message : 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white lg:px-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-3xl font-semibold">Add user</h1>
          <p className="mt-2 text-slate-300">
            Create portal users for Manipal University Jaipur. Username or email can be used for login.
          </p>
        </header>

        <form className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Full Name</span>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Username</span>
              <input value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Email (optional)</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white" />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-300 block">
            <span>Role</span>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white">
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </label>

          {canAssignLabs ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-300">Assign Labs</p>
              <div className="grid gap-2 md:grid-cols-2">
                {labs.map((lab) => (
                  <label key={lab._id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm">
                    <input type="checkbox" checked={selectedLabs.includes(lab._id)} onChange={() => toggleLab(lab._id)} />
                    <span>{lab.labName}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <button type="submit" disabled={loading} className="rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-60">
            {loading ? 'Creating user...' : 'Create user'}
          </button>

          {status ? <p className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200">{status}</p> : null}
        </form>
      </div>
    </main>
  );
}
