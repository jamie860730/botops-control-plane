import { ShieldAlert } from 'lucide-react';
import type { HandoffPreview as HandoffPreviewType } from '../types';

interface HandoffPreviewProps {
  preview?: HandoffPreviewType;
}

export function HandoffPreview({ preview }: HandoffPreviewProps) {
  if (!preview) {
    return (
      <section className="panel" data-testid="handoff-preview">
        <h3>No handoff preview for this scenario</h3>
      </section>
    );
  }

  return (
    <section className="panel handoff-panel" data-testid="handoff-preview">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Human Handoff Preview</p>
          <h3>{preview.queue}</h3>
        </div>
        <ShieldAlert size={28} aria-hidden="true" />
      </div>
      <dl className="detail-list">
        <div>
          <dt>Trigger reason</dt>
          <dd>{preview.reason}</dd>
        </div>
        <div>
          <dt>AI summary</dt>
          <dd>{preview.summary}</dd>
        </div>
        <div>
          <dt>Required fields</dt>
          <dd>{preview.requiredFields.join(', ')}</dd>
        </div>
        <div>
          <dt>Risk warning</dt>
          <dd>{preview.riskWarning}</dd>
        </div>
      </dl>
    </section>
  );
}
