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
    title: 'Map the control loop',
    titleZh: '建立管理閉環',
    detail: 'Start with quality gates, source distribution, and page purpose.',
    detailZh: '先看品質門檻、來源分布與頁面用途。'
  },
  {
    view: 'intake',
    title: 'Choose a live signal',
    titleZh: '選擇 live signal',
    detail: 'Filter a channel and open the bot reply with retained trace.',
    detailZh: '篩選 channel，打開 Bot 已送出回覆與保留 trace。'
  },
  {
    view: 'chat',
    title: 'Inspect live reply and trace',
    titleZh: '檢查回覆與 trace',
    detail: 'Check the already-sent response, citation, risk guard, retrieval, and verification.',
    detailZh: '檢查已送出回覆、引用、風險守門、檢索與驗證。'
  },
  {
    view: 'evaluation',
    title: 'Run offline eval',
    titleZh: '執行離線評測',
    detail: 'Compare baseline and candidate, then export CSV evidence.',
    detailZh: '比較 baseline / candidate，並匯出 CSV 證據。'
  },
  {
    view: 'errors',
    title: 'Review badcases',
    titleZh: '檢視 badcases',
    detail: 'Turn failures into owner-specific improvement tasks.',
    detailZh: '把失敗案例轉成 owner-specific 改善任務。'
  },
  {
    view: 'release',
    title: 'Make a release decision',
    titleZh: '做發布決策',
    detail: 'Block unsafe versions or mark safe bundles ready for review.',
    detailZh: '阻擋不安全版本，或標記安全版本可審查。'
  },
  {
    view: 'opsLog',
    title: 'Verify audit trail',
    titleZh: '確認 audit trail',
    detail: 'Confirm admin actions are persisted for governance.',
    detailZh: '確認管理員動作有被保存以支援稽核。'
  }
];

export function DemoGuide({ activeView, locale, savedEvalCaseId }: DemoGuideProps) {
  const activeIndex = Math.max(
    0,
    demoSteps.findIndex((step) => step.view === activeView)
  );

  return (
    <aside className="demo-guide" aria-label={text(locale, 'Demo walkthrough', 'Demo 操作導引')}>
      <div>
        <p className="eyebrow">{text(locale, 'Admin walkthrough', '管理員操作導引')}</p>
        <h3>{text(locale, 'Demo path for a bot manager', 'Bot 管理員 demo 路徑')}</h3>
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
