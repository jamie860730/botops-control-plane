import { ShieldAlert } from 'lucide-react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { HandoffPreview as HandoffPreviewType } from '../types';

interface HandoffPreviewProps {
  locale: Locale;
  preview?: HandoffPreviewType;
}

export function HandoffPreview({ locale, preview }: HandoffPreviewProps) {
  if (!preview) {
    return (
      <section className="panel" data-testid="handoff-preview">
        <h3>{text(locale, 'No handoff preview for this scenario', '此情境沒有人工交接預覽')}</h3>
      </section>
    );
  }

  return (
    <section className="panel handoff-panel" data-testid="handoff-preview">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{text(locale, 'Human Handoff Preview', '人工交接預覽')}</p>
          <h3>{preview.queue}</h3>
        </div>
        <ShieldAlert size={28} aria-hidden="true" />
      </div>
      <dl className="detail-list">
        <div>
          <dt>{text(locale, 'Trigger reason', '觸發原因')}</dt>
          <dd>{preview.reason}</dd>
        </div>
        <div>
          <dt>{text(locale, 'AI summary', 'AI 摘要')}</dt>
          <dd>{preview.summary}</dd>
        </div>
        <div>
          <dt>{text(locale, 'Required fields', '必要欄位')}</dt>
          <dd>{preview.requiredFields.join(', ')}</dd>
        </div>
        <div>
          <dt>{text(locale, 'Risk warning', '風險警示')}</dt>
          <dd>{preview.riskWarning}</dd>
        </div>
      </dl>
    </section>
  );
}
