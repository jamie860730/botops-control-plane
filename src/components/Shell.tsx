import {
  AlertTriangle,
  Activity,
  Bot,
  ChartNoAxesCombined,
  ClipboardCheck,
  Database,
  GitBranch,
  LayoutDashboard,
  Menu,
  Tickets,
  RadioTower,
  ShieldCheck,
  X,
  Workflow
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { Locale } from '../i18n';
import { text } from '../i18n';

export type ViewKey =
  | 'intake'
  | 'overview'
  | 'chat'
  | 'knowledge'
  | 'csKpi'
  | 'evaluation'
  | 'errors'
  | 'tickets'
  | 'handoff'
  | 'release'
  | 'opsLog';

const navItems: { key: ViewKey; labelEn: string; labelZh: string; icon: typeof RadioTower }[] = [
  { key: 'overview', labelEn: 'Overview', labelZh: '總覽', icon: LayoutDashboard },
  { key: 'intake', labelEn: 'Signal Intake', labelZh: '訊號受理', icon: RadioTower },
  { key: 'chat', labelEn: 'Response Trace', labelZh: '回覆稽核', icon: Bot },
  { key: 'knowledge', labelEn: 'Knowledge Governance', labelZh: '知識治理', icon: Database },
  { key: 'csKpi', labelEn: 'CS Bot KPI', labelZh: '客服 KPI', icon: ChartNoAxesCombined },
  { key: 'evaluation', labelEn: 'Evaluation', labelZh: '評測中心', icon: ClipboardCheck },
  { key: 'errors', labelEn: 'Error Analysis', labelZh: '錯誤分析', icon: AlertTriangle },
  { key: 'tickets', labelEn: 'Ticket Center', labelZh: '工單中心', icon: Tickets },
  { key: 'handoff', labelEn: 'Handoff', labelZh: '人工交接', icon: GitBranch },
  { key: 'release', labelEn: 'Release Center', labelZh: '發布中心', icon: ShieldCheck },
  { key: 'opsLog', labelEn: 'Audit Log', labelZh: '稽核紀錄', icon: Activity }
];

interface ShellProps {
  activeView: ViewKey;
  children: ReactNode;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onViewChange: (view: ViewKey) => void;
}

export function Shell({ activeView, children, locale, onLocaleChange, onViewChange }: ShellProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  function handleViewChange(view: ViewKey) {
    onViewChange(view);
    setIsNavOpen(false);
  }

  return (
    <div className="console-shell">
      <header className="mobile-topbar">
        <div className="brand-block">
          <div className="brand-mark">BO</div>
          <div>
            <p className="eyebrow">{text(locale, 'Bot management platform', '機器人治理平台')}</p>
            <h1>BotOps Control Plane</h1>
          </div>
        </div>
        <div className="mobile-topbar-actions">
          <LocaleToggle locale={locale} onLocaleChange={onLocaleChange} />
          <button
            aria-expanded={isNavOpen}
            aria-label={text(locale, 'Open navigation menu', '開啟導覽選單')}
            className="mobile-menu-button"
            onClick={() => setIsNavOpen(true)}
            type="button"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>
      </header>
      {isNavOpen && (
        <button
          aria-label={text(locale, 'Close navigation menu', '關閉導覽選單')}
          className="sidebar-backdrop"
          onClick={() => setIsNavOpen(false)}
          type="button"
        />
      )}
      <aside className={isNavOpen ? 'sidebar open' : 'sidebar'} aria-label="Primary navigation">
        <div className="brand-block">
          <div className="brand-mark">BO</div>
          <div>
            <p className="eyebrow">{text(locale, 'Bot management platform', '機器人治理平台')}</p>
            <h1>BotOps Control Plane</h1>
          </div>
        </div>
        <button
          aria-label={text(locale, 'Close navigation menu', '關閉導覽選單')}
          className="drawer-close-button"
          onClick={() => setIsNavOpen(false)}
          type="button"
        >
          <X size={17} aria-hidden="true" />
        </button>
        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                aria-current={activeView === item.key ? 'page' : undefined}
                className={activeView === item.key ? 'nav-button active' : 'nav-button'}
                onClick={() => handleViewChange(item.key)}
                type="button"
              >
                <Icon aria-hidden="true" size={17} />
                <span>{text(locale, item.labelEn, item.labelZh)}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-note">
          <Workflow size={16} aria-hidden="true" />
          <span>
            {text(
              locale,
              'Review signals, knowledge, evaluations, and releases from one control plane.',
              '從同一個控制台審查訊號、知識、評測與發布。'
            )}
          </span>
        </div>
      </aside>
      <main className="workspace">
        <div className="workspace-inner">
          <header className="workspace-header">
            <div>
              <p className="eyebrow">{text(locale, 'Policy-aware support automation', '政策感知客服自動化')}</p>
              <h2>{text(locale, 'Operational quality control for support bots', '客服機器人營運品質控管')}</h2>
            </div>
            <div className="desktop-header-actions">
              <LocaleToggle locale={locale} onLocaleChange={onLocaleChange} />
            </div>
          </header>
          <div className="view-surface">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function LocaleToggle({
  locale,
  onLocaleChange
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}) {
  return (
    <div className="locale-toggle" role="group" aria-label={text(locale, 'Language switcher', '語言切換')}>
      <button
        aria-label="Switch language to English"
        className={locale === 'en' ? 'active' : ''}
        onClick={() => onLocaleChange('en')}
        type="button"
      >
        EN
      </button>
      <button
        aria-label="切換語言為繁體中文"
        className={locale === 'zh-TW' ? 'active' : ''}
        onClick={() => onLocaleChange('zh-TW')}
        type="button"
      >
        繁中
      </button>
    </div>
  );
}
