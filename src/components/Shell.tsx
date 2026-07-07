import {
  AlertTriangle,
  Bot,
  ClipboardCheck,
  Database,
  Headset,
  LayoutDashboard,
  Menu,
  Tickets,
  X,
  Workflow
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { SourceChannel } from '../types';

export type ViewKey =
  | 'overview'
  | 'conversations'
  | 'knowledge'
  | 'assist'
  | 'tickets'
  | 'quality';

/** Optional cross-view target so a navigation can pre-select a specific entity. */
export interface NavigationTarget {
  ticketId?: string;
  knowledgeDocId?: string;
  /** Pre-applies the Conversations source filter (KPI segment drilldown); lands on the list layer. */
  sourceChannel?: SourceChannel | 'All';
  /** Opens the Conversations review layer directly for this scenario. */
  scenarioId?: string;
  /** Lands Quality & Release on a specific tab instead of the default release gates. */
  qualityTab?: 'release' | 'kpi' | 'eval' | 'badcases' | 'audit';
  /** Focuses this metric card after landing on the Quality KPI tab (dashboard card drill-through). */
  kpiMetricId?: string;
}

const navItems: {
  key: ViewKey;
  labelEn: string;
  labelZh: string;
  /** One-line task statement shown under the workspace title. */
  taskEn: string;
  taskZh: string;
  icon: typeof LayoutDashboard;
}[] = [
  {
    key: 'overview',
    labelEn: 'Dashboard',
    labelZh: '儀表板',
    taskEn: 'See the current state of bot operations and decide what to handle first today.',
    taskZh: '掌握 bot 營運現況，決定今天優先處理什麼。',
    icon: LayoutDashboard
  },
  {
    key: 'conversations',
    labelEn: 'Conversations',
    labelZh: '對話審查',
    taskEn: 'Check the quality of replies the bot already sent and turn problems into eval cases.',
    taskZh: '檢查 bot 已送出回覆的品質，把問題轉成評測案例。',
    icon: Bot
  },
  {
    key: 'knowledge',
    labelEn: 'Knowledge',
    labelZh: '知識治理',
    taskEn: 'Manage the knowledge the bot answers from, its gaps, and the related SOPs.',
    taskZh: '管理 bot 回答依據的知識、缺口與 SOP。',
    icon: Database
  },
  {
    key: 'assist',
    labelEn: 'Agent Assist',
    labelZh: '座席輔助',
    taskEn: 'Measure AI assist quality through what agents actually do with each suggestion.',
    taskZh: '用座席的實際行為量測 AI 輔助品質。',
    icon: Headset
  },
  {
    key: 'tickets',
    labelEn: 'Tickets & Handoff',
    labelZh: '工單與交接',
    taskEn: 'Track tickets the bot created and the quality of each human handoff.',
    taskZh: '追蹤 bot 建立的工單與交接品質。',
    icon: Tickets
  },
  {
    key: 'quality',
    labelEn: 'Quality & Release',
    labelZh: '品質與發布',
    taskEn: 'Guard every release with evaluation evidence.',
    taskZh: '用評測證據守住每一次發布。',
    icon: ClipboardCheck
  }
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
  const activeNavItem = navItems.find((item) => item.key === activeView) ?? navItems[0];

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
            <p className="eyebrow">{text(locale, 'Bot management platform', '機器人管理平台')}</p>
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
            <p className="eyebrow">{text(locale, 'Bot management platform', '機器人管理平台')}</p>
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
              'Quality governance, knowledge operations, handoff control, release audit.',
              '品質治理、知識營運、交接控管、發布稽核。'
            )}
          </span>
        </div>
      </aside>
      <main className="workspace">
        <div className="workspace-inner">
          <header className="workspace-header">
            <div>
              <h2>{text(locale, activeNavItem.labelEn, activeNavItem.labelZh)}</h2>
              <p className="workspace-task">{text(locale, activeNavItem.taskEn, activeNavItem.taskZh)}</p>
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
