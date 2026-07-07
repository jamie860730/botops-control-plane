import { useState } from 'react';
import { Activity, ClipboardCheck, Download, Flag, PlayCircle, RefreshCw, Save, ShieldCheck } from 'lucide-react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { AuditEvent, AuditEventType } from '../types';
import { formatDisplayText } from '../utils/display';

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
  release_decision: ShieldCheck,
  faq_candidate_reviewed: ClipboardCheck,
  assist_badcase_flagged: Flag,
  knowledge_index_queued: RefreshCw
};

const eventFilters: Array<{ value: AuditEventType | 'All'; labelEn: string; labelZh: string }> = [
  { value: 'All', labelEn: 'All', labelZh: '全部' },
  { value: 'live_trace_review', labelEn: 'Trace review', labelZh: 'Trace 審查' },
  { value: 'eval_case_saved', labelEn: 'Eval case', labelZh: '評測案例' },
  { value: 'eval_runner_completed', labelEn: 'Eval completed', labelZh: '評測完成' },
  { value: 'csv_exported', labelEn: 'CSV export', labelZh: 'CSV 匯出' },
  { value: 'release_decision', labelEn: 'Release decision', labelZh: '發布決策' },
  { value: 'faq_candidate_reviewed', labelEn: 'FAQ review', labelZh: 'FAQ 審核' },
  { value: 'assist_badcase_flagged', labelEn: 'Assist badcase', labelZh: '座席輔助 badcase' },
  { value: 'knowledge_index_queued', labelEn: 'Index queued', labelZh: '排入索引' }
];

/**
 * Renders an audit event's title/detail in the active locale. Events created after
 * the bilingual format carry titleZh/detailZh; legacy localStorage events fall back
 * to the static display map, then to their original English copy.
 */
function auditEventText(locale: Locale, en: string, zh: string | undefined) {
  if (locale === 'zh-TW' && zh) {
    return zh;
  }
  return formatDisplayText(locale, en);
}

export function OpsLog({ events, locale }: OpsLogProps) {
  const [selectedFilter, setSelectedFilter] = useState<AuditEventType | 'All'>('All');
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id ?? '');
  const filteredEvents =
    selectedFilter === 'All' ? events : events.filter((event) => event.eventType === selectedFilter);
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? filteredEvents[0];
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
            <h3>{text(locale, 'Governance event ledger', '治理事件紀錄')}</h3>
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
              <button
                className={event.id === selectedEvent?.id ? 'audit-row interactive-row selected' : 'audit-row interactive-row'}
                key={event.id}
                onClick={() => setSelectedEventId(event.id)}
                type="button"
              >
                <div className="row-icon">
                  <Icon size={15} aria-hidden="true" />
                </div>
                <div>
                  <div className="row-title">
                    <strong>{auditEventText(locale, event.title, event.titleZh)}</strong>
                    <span>{formatDisplayText(locale, event.actor)}</span>
                    <span>{event.entityRef}</span>
                  </div>
                  <p>{auditEventText(locale, event.detail, event.detailZh)}</p>
                </div>
                <time>
                  {new Date(event.createdAt).toLocaleTimeString(locale === 'zh-TW' ? 'zh-TW' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </time>
              </button>
            );
          })}
          {filteredEvents.length === 0 && (
            <div className="empty-state">
              <strong>{text(locale, 'No events match this filter', '沒有符合此篩選的事件')}</strong>
              <p>{text(locale, 'No ledger entries for the selected event type.', '所選事件類型目前沒有稽核紀錄。')}</p>
            </div>
          )}
        </div>
      </div>
      <div className="panel">
        <p className="eyebrow">{text(locale, 'Audit scope', '稽核範圍')}</p>
        <h3>{text(locale, 'Trace, evaluation, export, and release events', 'Trace、評測、匯出與發布事件')}</h3>
        {selectedEvent && (
          <dl className="compact-detail-list">
            <div>
              <dt>{text(locale, 'Event type', '事件類型')}</dt>
              <dd>{formatDisplayText(locale, selectedEvent.eventType)}</dd>
            </div>
            <div>
              <dt>{text(locale, 'Actor', '操作者')}</dt>
              <dd>{formatDisplayText(locale, selectedEvent.actor)}</dd>
            </div>
            <div>
              <dt>{text(locale, 'Entity', '實體')}</dt>
              <dd>{selectedEvent.entityRef}</dd>
            </div>
            <div>
              <dt>{text(locale, 'Created at', '建立時間')}</dt>
              <dd>{new Date(selectedEvent.createdAt).toLocaleString(locale === 'zh-TW' ? 'zh-TW' : 'en-US')}</dd>
            </div>
          </dl>
        )}
      </div>
    </section>
  );
}
