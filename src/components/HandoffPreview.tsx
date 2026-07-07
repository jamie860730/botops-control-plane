import { ShieldAlert } from 'lucide-react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { HandoffPreview as HandoffPreviewType } from '../types';
import { formatDisplayText } from '../utils/display';

interface HandoffPreviewProps {
  locale: Locale;
  preview?: HandoffPreviewType;
}

/**
 * Handoff-package block rendered inside the ticket detail drawer: the bot-generated
 * context a human agent receives when a case is escalated.
 */
export function HandoffPreview({ locale, preview }: HandoffPreviewProps) {
  if (!preview) {
    return (
      <section className="record-detail-panel" data-testid="handoff-preview">
        <p className="eyebrow">{text(locale, 'Human Handoff Preview', '人工交接預覽')}</p>
        <h4>{text(locale, 'No handoff package for this ticket', '此工單無交接包')}</h4>
        <p>
          {text(
            locale,
            'The selected ticket was not escalated with a bot-generated handoff package.',
            '所選工單沒有由 bot 產生的人工交接包。'
          )}
        </p>
      </section>
    );
  }

  return (
    <section className="record-detail-panel handoff-panel" data-testid="handoff-preview">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{text(locale, 'Human Handoff Preview', '人工交接預覽')}</p>
          <h4>{preview.queue}</h4>
        </div>
        <ShieldAlert size={24} aria-hidden="true" />
      </div>
      <dl className="detail-list">
        <div>
          <dt>{text(locale, 'Trigger reason', '觸發原因')}</dt>
          <dd>{formatDisplayText(locale, preview.reason)}</dd>
        </div>
        <div>
          <dt>{text(locale, 'AI summary', 'AI 摘要')}</dt>
          <dd>{formatDisplayText(locale, preview.summary)}</dd>
        </div>
        <div>
          <dt>{text(locale, 'Required fields', '必要欄位')}</dt>
          <dd>{formatDisplayText(locale, preview.requiredFields.join(', '))}</dd>
        </div>
        <div>
          <dt>{text(locale, 'Risk warning', '風險警示')}</dt>
          <dd>{formatDisplayText(locale, preview.riskWarning)}</dd>
        </div>
      </dl>
    </section>
  );
}
