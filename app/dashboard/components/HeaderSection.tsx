import type {Dispatch, SetStateAction} from 'react';
import type {PortalUser, TabKey} from '../types';

type HeaderSectionProps = {
  user: PortalUser | null;
  activeTab: TabKey;
  visibleTabs: Array<{key: TabKey; label: string}>;
  setActiveTab: Dispatch<SetStateAction<TabKey>>;
  handleLogout: () => Promise<void>;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

export function HeaderSection({user, activeTab, visibleTabs, setActiveTab, handleLogout, onRefresh, isRefreshing}: HeaderSectionProps) {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">Manipal University Jaipur</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Lab Management Portal</h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">Single tabbed workspace for labs, users, imports, and request approvals.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              Signed in as <span className="font-semibold">{user?.name}</span>
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  isRefreshing
                    ? 'border-slate-300 bg-slate-100 text-slate-600 cursor-not-allowed'
                    : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <span className={`inline-flex items-center gap-2 ${isRefreshing ? 'animate-spin' : ''}`}>
                  ↻ Refresh
                </span>
              </button>
            )}
            <button className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
