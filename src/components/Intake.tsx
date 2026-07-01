import { Eye, SignalHigh } from 'lucide-react';
import type { SourceChannel, SupportScenario, SupportSignal } from '../types';

const sourceChannels: (SourceChannel | 'All')[] = [
  'All',
  'Web/App Chat',
  'X',
  'LINE',
  'Telegram',
  'Discord',
  'Internal Report'
];

interface IntakeProps {
  selectedSource: SourceChannel | 'All';
  signals: SupportSignal[];
  scenarios: SupportScenario[];
  onSourceChange: (source: SourceChannel | 'All') => void;
  onReviewInteraction: (id: string) => void;
}

export function Intake({
  selectedSource,
  signals,
  scenarios,
  onSourceChange,
  onReviewInteraction
}: IntakeProps) {
  return (
    <section className="screen-grid intake-grid">
      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Multi-channel Intake</p>
            <h3>Normalize support signals before the bot answers</h3>
          </div>
          <span className="count-pill">{signals.length} signals</span>
        </div>
        <div className="source-tabs" aria-label="Source filters">
          {sourceChannels.map((source) => (
            <button
              key={source}
              className={selectedSource === source ? 'chip selected' : 'chip'}
              onClick={() => onSourceChange(source)}
              type="button"
            >
              {source}
            </button>
          ))}
        </div>
        <div className="signal-list" data-testid="support-signal-list">
          {signals.map((signal) => (
            <article className="signal-row" key={signal.id}>
              <div className="row-icon">
                <SignalHigh size={16} aria-hidden="true" />
              </div>
              <div>
                <div className="row-title">
                  <strong>{signal.sourceChannel}</strong>
                  <span>{signal.reporterType}</span>
                  <span>{signal.region}</span>
                </div>
                <p>{signal.rawText}</p>
              </div>
              <span className={`risk-pill ${signal.priority.toLowerCase()}`}>{signal.priority}</span>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Scenario Launcher</p>
            <h3>Open live bot replies and retained traces</h3>
          </div>
        </div>
        <div className="scenario-list" data-testid="scenario-list">
          {scenarios.map((scenario) => (
            <article className="scenario-card" key={scenario.id}>
              <div>
                <strong>{scenario.title}</strong>
                <p>{scenario.expectedBehavior}</p>
              </div>
              <dl className="mini-meta">
                <div>
                  <dt>Source</dt>
                  <dd>{scenario.sourceChannel}</dd>
                </div>
                <div>
                  <dt>Risk</dt>
                  <dd>{scenario.riskTag}</dd>
                </div>
                <div>
                  <dt>Region</dt>
                  <dd>{scenario.region}</dd>
                </div>
              </dl>
              <button
                aria-label={`Review live reply and trace for ${scenario.title}`}
                className="primary-action"
                onClick={() => onReviewInteraction(scenario.id)}
                type="button"
              >
                <Eye size={15} aria-hidden="true" />
                Review live reply + trace
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
