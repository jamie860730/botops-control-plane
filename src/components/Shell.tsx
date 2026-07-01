import {
  AlertTriangle,
  ArrowUpRight,
  Activity,
  Bot,
  ClipboardCheck,
  Database,
  GitBranch,
  LayoutDashboard,
  RadioTower,
  ShieldCheck,
  Workflow
} from 'lucide-react';
import type { ReactNode } from 'react';

export type ViewKey =
  | 'intake'
  | 'overview'
  | 'chat'
  | 'knowledge'
  | 'evaluation'
  | 'errors'
  | 'handoff'
  | 'release'
  | 'opsLog';

const navItems: { key: ViewKey; label: string; icon: typeof RadioTower }[] = [
  { key: 'intake', label: 'Intake', icon: RadioTower },
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'chat', label: 'Chat + Trace', icon: Bot },
  { key: 'knowledge', label: 'Knowledge', icon: Database },
  { key: 'evaluation', label: 'Evaluation', icon: ClipboardCheck },
  { key: 'errors', label: 'Error Analysis', icon: AlertTriangle },
  { key: 'handoff', label: 'Handoff', icon: GitBranch },
  { key: 'release', label: 'Release Center', icon: ShieldCheck },
  { key: 'opsLog', label: 'Ops Log', icon: Activity }
];

interface ShellProps {
  activeView: ViewKey;
  children: ReactNode;
  onViewChange: (view: ViewKey) => void;
}

export function Shell({ activeView, children, onViewChange }: ShellProps) {
  return (
    <div className="console-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand-block">
          <div className="brand-mark">BO</div>
          <div>
            <p className="eyebrow">Bot management MVP</p>
            <h1>BotOps Control Plane</h1>
          </div>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={activeView === item.key ? 'nav-button active' : 'nav-button'}
                onClick={() => onViewChange(item.key)}
                type="button"
              >
                <Icon aria-hidden="true" size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-note">
          <Workflow size={16} aria-hidden="true" />
          <span>P0 uses the real product data model with deterministic seed execution.</span>
        </div>
      </aside>
      <main className="workspace">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">Policy-aware support automation</p>
            <h2>Quality loop for multi-channel customer support</h2>
          </div>
          <div className="header-status">
            <span>Stable IDs enforced</span>
            <span>Offline eval ready</span>
            <span>Live Bot P2</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
