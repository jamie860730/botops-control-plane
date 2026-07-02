import { useState } from 'react';
import { Activity, Download, PlayCircle, Save, ShieldCheck } from 'lucide-react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { AuditEvent, AuditEventType } from '../types';

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

const eventFilters: Array<{ value: AuditEventType | 'All'; labelEn: string; labelZh: string }> = [
  { value: 'All', labelEn: 'All', labelZh: '全部' },
  { value: 'live_trace_review', labelEn: 'Trace review', labelZh: 'Trace 審查' },
  { value: 'eval_case_saved', labelEn: 'Eval case', labelZh: '評測案例' },
  { value: 'eval_runner_completed', labelEn: 'Eval completed', labelZh: '評測完成' },
  { value: 'csv_exported', labelEn: 'CSV export', labelZh: 'CSV 匯出' },
  { value: 'release_decision', labelEn: 'Release decision', labelZh: '發布決策' }
];

export function OpsLog({ events, locale }: OpsLogProps) {
  const [selectedFilter, setSelectedFilter] = useState<AuditEventType | 'All'>('All');
  const filteredEvents =
    selectedFilter === 'All' ? events : events.filter((event) => event.eventType === selectedFilter);
  const eventCountLabel =
    locale === 'zh-TW'
      ? `${filteredEvents.length} 筆事件`
      : `${filteredEvents.length} ${filteredEvents.length === 1 ? 'event' : 'events'}`;

  return (
    <section className="screen-grid" data-testid="ops-log">
      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Ops Log', '操作紀錄')}</p>
            <h3>{text(locale, 'Persistent action history for product and operations review', '產品與營運審查操作紀錄')}</h3>
          </div>
          <span className="count-pill">{eventCountLabel}</span>
        </div>
        <div className="source-tabs" aria-label={text(locale, 'Audit event filters', '稽核事件篩選')}>
          {eventFilters.map((filter) => (
            <button
              aria-pressed={selectedFilter === filter.value}
              className={selectedFilter === filter.value ? 'chip selected' : 'chip'}
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              type="button"
            >
              {text(locale, filter.labelEn, filter.labelZh)}
            </button>
          ))}
        </div>
        <div className="audit-list">
          {filteredEvents.map((event) => {
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
          {filteredEvents.length === 0 && (
            <div className="empty-state">
              <strong>{text(locale, 'No events match this filter', '沒有符合此篩選的事件')}</strong>
              <p>{text(locale, 'Run an operation or choose another event type.', '請執行操作或選擇其他事件類型。')}</p>
            </div>
          )}
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
