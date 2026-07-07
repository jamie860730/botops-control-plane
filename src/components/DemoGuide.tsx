import { CheckCircle2, Circle } from 'lucide-react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { ViewKey } from './Shell';

interface WorkflowGuideProps {
  activeView: ViewKey;
  locale: Locale;
  savedEvalCaseId: string | null;
}

const workflowSteps: { view: ViewKey; title: string; titleZh: string; detail: string; detailZh: string }[] = [
  {
    view: 'overview',
    title: 'Review dashboard status',
    titleZh: '檢視儀表板',
    detail: 'Review bot KPI, knowledge gaps, handoff risk, and release readiness.',
    detailZh: '檢視 Bot KPI、知識缺口、交接風險與發布狀態。'
  },
  {
    view: 'conversations',
    title: 'Review conversations',
    titleZh: '審查對話',
    detail: 'Filter source signals, inspect delivered replies, and save eval cases.',
    detailZh: '篩選來源訊號、審查已送出回覆並保存評測案例。'
  },
  {
    view: 'knowledge',
    title: 'Check knowledge coverage',
    titleZh: '檢查知識覆蓋',
    detail: 'Review FAQ, SOP, RAG sources, index state, and citation chunks.',
    detailZh: '檢視 FAQ、SOP、RAG 來源、索引狀態與引用 chunks。'
  },
  {
    view: 'tickets',
    title: 'Track tickets and handoff',
    titleZh: '追蹤工單與交接',
    detail: 'Scan bot-created ticket pressure, owners, SLA, and handoff package.',
    detailZh: '掃描 Bot 造成的工單壓力、owner、SLA 與交接包。'
  },
  {
    view: 'quality',
    title: 'Decide quality and release',
    titleZh: '決定品質與發布',
    detail: 'Run eval, inspect badcases, decide release gates, and verify audit trail.',
    detailZh: '執行評測、檢查失敗案例、決定發布門檻並核對稽核軌跡。'
  }
];

export function WorkflowGuide({ activeView, locale, savedEvalCaseId }: WorkflowGuideProps) {
  const activeIndex = Math.max(
    0,
    workflowSteps.findIndex((step) => step.view === activeView)
  );

  return (
    <aside className="workflow-guide" aria-label={text(locale, 'Operational workflow', '營運作業流程')}>
      <div>
        <p className="eyebrow">{text(locale, 'Operational workflow', '營運作業流程')}</p>
        <h3>{text(locale, 'Bot governance review sequence', '機器人治理審查序列')}</h3>
      </div>
      <div className="workflow-step-list">
        {workflowSteps.map((step, index) => {
          const isComplete = index < activeIndex || (step.view === 'conversations' && Boolean(savedEvalCaseId));
          const isActive = index === activeIndex;
          const Icon = isComplete ? CheckCircle2 : Circle;
          return (
            <article className={isActive ? 'workflow-step active' : 'workflow-step'} key={step.title}>
              <Icon size={15} aria-hidden="true" />
              <div>
                <strong>{text(locale, step.title, step.titleZh)}</strong>
                <p>{text(locale, step.detail, step.detailZh)}</p>
              </div>
            </article>
          );
        })}
      </div>
    </aside>
  );
}
