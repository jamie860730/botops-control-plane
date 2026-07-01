import { Activity, Download, PlayCircle, Save, ShieldCheck } from 'lucide-react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { AuditEvent } from '../types';

interface OpsLogProps {
  events: AuditEvent[];
  locale: Locale;
}

const eventIconMap = {
  live_trace_review: PlayCircle,
  eval_case_saved: Save,
  eval_runner_started: Activity,
  eval_runner_completed: ShieldCheck,
  csv_exported: Download,
  release_decision: ShieldCheck
};

export function OpsLog({ events, locale }: OpsLogProps) {
  return (
    <section className="screen-grid" data-testid="ops-log">
      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Ops Log', '操作紀錄')}</p>
            <h3>{text(locale, 'Persistent action history for product and operations review', '產品與營運審查操作紀錄')}</h3>
          </div>
          <span className="count-pill">{text(locale, `${events.length} events`, `${events.length} 筆事件`)}</span>
        </div>
        <div className="audit-list">
          {events.map((event) => {
            const Icon = eventIconMap[event.eventType] ?? Activity;
            return (
              <article className="audit-row" key={event.id}>
                <div className="row-icon">
                  <Icon size={15} aria-hidden="true" />
                </div>
                <div>
                  <div className="row-title">
                    <strong>{event.title}</strong>
                    <span>{event.actor}</span>
                    <span>{event.entityRef}</span>
                  </div>
                  <p>{event.detail}</p>
                </div>
                <time>{new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
              </article>
            );
          })}
        </div>
      </div>
      <div className="panel">
        <p className="eyebrow">{text(locale, 'Why this page exists', '為什麼需要此頁')}</p>
        <h3>{text(locale, 'Governance evidence beyond answer quality', '回答品質之外的治理證據')}</h3>
        <p>
          {text(
            locale,
            'Bot management needs a review trail for live trace reviews, saved eval cases, offline eval execution, exports, and release decisions. P1 stores this locally now; the same event shape can later be persisted by a backend audit log service.',
            'Bot 管理需記錄 trace review、eval case、離線評測、匯出與發布決策。P1 先於本機保存，後續可由後端稽核紀錄服務持久化。'
          )}
        </p>
      </div>
    </section>
  );
}
