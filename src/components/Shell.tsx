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
import type { Locale } from '../i18n';
import { text } from '../i18n';

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

const navItems: { key: ViewKey; labelEn: string; labelZh: string; icon: typeof RadioTower }[] = [
  { key: 'intake', labelEn: 'Intake', labelZh: '訊號收件匣', icon: RadioTower },
  { key: 'overview', labelEn: 'Overview', labelZh: '總覽', icon: LayoutDashboard },
  { key: 'chat', labelEn: 'Chat + Trace', labelZh: '回覆與追蹤', icon: Bot },
  { key: 'knowledge', labelEn: 'Knowledge', labelZh: '知識庫', icon: Database },
  { key: 'evaluation', labelEn: 'Evaluation', labelZh: '評測中心', icon: ClipboardCheck },
  { key: 'errors', labelEn: 'Error Analysis', labelZh: '錯誤分析', icon: AlertTriangle },
  { key: 'handoff', labelEn: 'Handoff', labelZh: '人工交接', icon: GitBranch },
  { key: 'release', labelEn: 'Release Center', labelZh: '發布中心', icon: ShieldCheck },
  { key: 'opsLog', labelEn: 'Ops Log', labelZh: '操作紀錄', icon: Activity }
];

interface ShellProps {
  activeView: ViewKey;
  children: ReactNode;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onViewChange: (view: ViewKey) => void;
}

export function Shell({ activeView, children, locale, onLocaleChange, onViewChange }: ShellProps) {
  return (
    <div className="console-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand-block">
          <div className="brand-mark">BO</div>
          <div>
            <p className="eyebrow">{text(locale, 'Bot management MVP', '機器人管理 MVP')}</p>
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
              'P0 uses the real product data model with deterministic seed execution.',
              'P0 使用真實產品資料模型與可重現的 seed execution。'
            )}
          </span>
        </div>
      </aside>
      <main className="workspace">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">{text(locale, 'Policy-aware support automation', '政策感知客服自動化')}</p>
            <h2>{text(locale, 'Quality loop for multi-channel customer support', '多渠道客服機器人的品質管理閉環')}</h2>
          </div>
          <div className="header-status">
            <span>{text(locale, 'Stable IDs enforced', '穩定 ID 已啟用')}</span>
            <span>{text(locale, 'Offline eval ready', '離線評測就緒')}</span>
            <span>{text(locale, 'Live Bot P2', '即時 Bot P2')}</span>
            <div className="locale-toggle" aria-label={text(locale, 'Language switcher', '語言切換')}>
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
            <ArrowUpRight size={16} aria-hidden="true" />
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
