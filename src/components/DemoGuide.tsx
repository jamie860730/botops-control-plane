import { CheckCircle2, Circle } from 'lucide-react';
import type { ViewKey } from './Shell';

interface DemoGuideProps {
  activeView: ViewKey;
  savedEvalCaseId: string | null;
}

const demoSteps: { view: ViewKey; title: string; detail: string }[] = [
  {
    view: 'overview',
    title: 'Map the control loop',
    detail: 'Start with quality gates, source distribution, and page purpose.'
  },
  {
    view: 'intake',
    title: 'Choose a live signal',
    detail: 'Filter a channel and open the bot reply with retained trace.'
  },
  {
    view: 'chat',
    title: 'Inspect live reply and trace',
    detail: 'Check the already-sent response, citation, risk guard, retrieval, and verification.'
  },
  {
    view: 'evaluation',
    title: 'Run offline eval',
    detail: 'Compare baseline and candidate, then export CSV evidence.'
  },
  {
    view: 'errors',
    title: 'Review badcases',
    detail: 'Turn failures into owner-specific improvement tasks.'
  },
  {
    view: 'release',
    title: 'Make a release decision',
    detail: 'Block unsafe versions or mark safe bundles ready for review.'
  },
  {
    view: 'opsLog',
    title: 'Verify audit trail',
    detail: 'Confirm admin actions are persisted for governance.'
  }
];

export function DemoGuide({ activeView, savedEvalCaseId }: DemoGuideProps) {
  const activeIndex = Math.max(
    0,
    demoSteps.findIndex((step) => step.view === activeView)
  );

  return (
    <aside className="demo-guide" aria-label="Demo walkthrough">
      <div>
        <p className="eyebrow">Admin walkthrough</p>
        <h3>Demo path for a bot manager</h3>
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
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
              </div>
            </article>
          );
        })}
      </div>
    </aside>
  );
}
