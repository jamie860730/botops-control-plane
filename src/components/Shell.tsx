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

const viewIntents: Record<
  ViewKey,
  { labelEn: string; labelZh: string; titleEn: string; titleZh: string; decisionEn: string; decisionZh: string }
> = {
  intake: {
    labelEn: 'Operator intent',
    labelZh: '管理目的',
    titleEn: 'Prioritize post-reply signals that require product review.',
    titleZh: '判斷哪些回覆後訊號需要產品審查。',
    decisionEn: 'Decision: select a source or scenario for retained trace review.',
    decisionZh: '決策：選擇來源或案例，進入 retained trace 審查。'
  },
  overview: {
    labelEn: 'Dashboard',
    labelZh: '總覽',
    titleEn: 'Monitor bot quality, support workload, and release risk.',
    titleZh: '監控機器人品質、客服工作量與發布風險。',
    decisionEn: 'Decision: choose the queue, knowledge gap, or release package that needs attention.',
    decisionZh: '決策：選擇需要處理的隊列、知識缺口或發布套件。'
  },
  chat: {
    labelEn: 'Trace review',
    labelZh: 'Trace 審查',
    titleEn: 'Validate the answer that was already delivered by the bot.',
    titleZh: '審查機器人已送出的回答是否可被追溯與驗證。',
    decisionEn: 'Decision: accept the trace, open evidence, or save it as an eval case.',
    decisionZh: '決策：接受 trace、檢視證據，或保存為 eval case。'
  },
  knowledge: {
    labelEn: 'Knowledge control',
    labelZh: '知識控管',
    titleEn: 'Confirm whether retrieval evidence is current, indexed, and citeable.',
    titleZh: '確認檢索依據是否有效、已索引且可引用。',
    decisionEn: 'Decision: inspect the source document, chunk, snapshot, and retrieval config.',
    decisionZh: '決策：檢查來源文件、chunk、snapshot 與 retrieval config。'
  },
  csKpi: {
    labelEn: 'KPI review',
    labelZh: 'KPI 審查',
    titleEn: 'Review CS bot impact metrics and the user cases behind them.',
    titleZh: '檢視客服 Bot 影響指標，以及背後的用戶案例。',
    decisionEn: 'Decision: choose the channel, case cluster, or owner that needs improvement.',
    decisionZh: '決策：選擇需要改善的渠道、案例群或負責 owner。'
  },
  evaluation: {
    labelEn: 'Quality gate',
    labelZh: '品質門檻',
    titleEn: 'Replay saved interactions before release decisions are made.',
    titleZh: '在發布決策前重播已保存互動並檢查指標。',
    decisionEn: 'Decision: run offline eval, compare versions, or export evidence.',
    decisionZh: '決策：執行離線評測、比較版本，或匯出證據。'
  },
  errors: {
    labelEn: 'Remediation',
    labelZh: '修正管理',
    titleEn: 'Convert failed eval cases into accountable product fixes.',
    titleZh: '將失敗 eval case 轉換為可追蹤的產品修正。',
    decisionEn: 'Decision: assign the failure to PM, Bot Ops, Knowledge, or Compliance.',
    decisionZh: '決策：將失敗歸因給 PM、Bot Ops、知識庫或法遵。'
  },
  tickets: {
    labelEn: 'Ticket operations',
    labelZh: '工單營運',
    titleEn: 'Track escalated and review-ready cases after bot handling.',
    titleZh: '追蹤機器人處理後需升級或審查的客服工單。',
    decisionEn: 'Decision: confirm queue, owner, SLA, case summary, and next action.',
    decisionZh: '決策：確認隊列、負責人、SLA、案例摘要與下一步。'
  },
  handoff: {
    labelEn: 'Escalation',
    labelZh: '升級處理',
    titleEn: 'Package high-risk interactions for a human support queue.',
    titleZh: '將高風險互動封裝成人工隊列可處理的案例。',
    decisionEn: 'Decision: verify required fields, queue, summary, and safety warning.',
    decisionZh: '決策：確認必要欄位、隊列、摘要與安全警示。'
  },
  release: {
    labelEn: 'Release decision',
    labelZh: '發布決策',
    titleEn: 'Promote, block, or request review based on visible release gates.',
    titleZh: '依據可見發布門檻決定推進、阻擋或請求審查。',
    decisionEn: 'Decision: leave an auditable release action for the selected bundle.',
    decisionZh: '決策：為所選 bundle 留下可稽核的發布動作。'
  },
  opsLog: {
    labelEn: 'Auditability',
    labelZh: '稽核性',
    titleEn: 'Review the action trail produced by product and operations decisions.',
    titleZh: '檢查產品與營運決策留下的操作軌跡。',
    decisionEn: 'Decision: confirm that critical review, eval, export, and release actions are logged.',
    decisionZh: '決策：確認關鍵審查、評測、匯出與發布動作已留存。'
  }
};

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
          <section className="page-intent" aria-label={text(locale, 'Current page intent', '目前頁面目的')}>
            <div>
              <p className="eyebrow">{text(locale, viewIntents[activeView].labelEn, viewIntents[activeView].labelZh)}</p>
              <h3>{text(locale, viewIntents[activeView].titleEn, viewIntents[activeView].titleZh)}</h3>
            </div>
            <p>{text(locale, viewIntents[activeView].decisionEn, viewIntents[activeView].decisionZh)}</p>
          </section>
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
