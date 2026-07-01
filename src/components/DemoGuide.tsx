import { CheckCircle2, Circle } from 'lucide-react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { ViewKey } from './Shell';

interface DemoGuideProps {
  activeView: ViewKey;
  locale: Locale;
  savedEvalCaseId: string | null;
}

const demoSteps: { view: ViewKey; title: string; titleZh: string; detail: string; detailZh: string }[] = [
  {
    view: 'overview',
    title: 'Review operating model',
    titleZh: '審查營運模型',
    detail: 'Review quality gates, source distribution, and functional coverage.',
    detailZh: '審查品質門檻、來源分布與功能覆蓋。'
  },
  {
    view: 'intake',
    title: 'Select interaction record',
    titleZh: '選取互動紀錄',
    detail: 'Filter by channel and inspect the retained response trace.',
    detailZh: '依渠道篩選並檢視保留的回覆 trace。'
  },
  {
    view: 'chat',
    title: 'Audit response trace',
    titleZh: '稽核回覆 trace',
    detail: 'Review response, citation, risk guard, retrieval, and verification.',
    detailZh: '審查回覆、引用、風險守門、檢索與驗證。'
  },
  {
    view: 'evaluation',
    title: 'Run offline eval',
    titleZh: '執行離線評測',
    detail: 'Compare baseline and candidate, then export CSV evidence.',
    detailZh: '比較 baseline / candidate，並匯出 CSV 依據。'
  },
  {
    view: 'errors',
    title: 'Review badcases',
    titleZh: '審查失敗案例',
    detail: 'Turn failures into owner-specific improvement tasks.',
    detailZh: '將失敗案例轉換為責任歸屬明確的改善項目。'
  },
  {
    view: 'release',
    title: 'Make a release decision',
    titleZh: '執行發布決策',
    detail: 'Block unsafe versions or mark safe bundles ready for review.',
    detailZh: '阻擋不合規版本，或標記合格版本進入審查。'
  },
  {
    view: 'opsLog',
    title: 'Verify audit trail',
    titleZh: '核對稽核軌跡',
    detail: 'Confirm admin actions are persisted for governance.',
    detailZh: '確認管理操作已持久化並可供稽核。'
  }
];

export function DemoGuide({ activeView, locale, savedEvalCaseId }: DemoGuideProps) {
  const activeIndex = Math.max(
    0,
    demoSteps.findIndex((step) => step.view === activeView)
  );

  return (
    <aside className="demo-guide" aria-label={text(locale, 'Operational workflow', '營運作業流程')}>
      <div>
        <p className="eyebrow">{text(locale, 'Operational workflow', '營運作業流程')}</p>
        <h3>{text(locale, 'Bot governance review sequence', '機器人治理審查序列')}</h3>
      </div>
      <div className="demo-step-list">
        {demoSteps.map((step, index) => {
          const isComplete = index < activeIndex || (step.view === 'chat' && Boolean(savedEvalCaseId));
          const isActive = index === activeIndex;
          const Icon = isComplete ? CheckCircle2 : Circle;
          return (
            <article className={isActive ? 'demo-step active' : 'demo-step'} key={step.title}>
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
