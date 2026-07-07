import { Clock, TicketCheck } from 'lucide-react';
import { useState } from 'react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { HandoffPreview as HandoffPreviewType, SupportTicket } from '../types';
import { formatDisplayText, formatRiskLevel, formatTicketId } from '../utils/display';
import {
  persistTicketOwnerOverrides,
  persistTicketStatusOverrides,
  readTicketOwnerOverrides,
  readTicketStatusOverrides
} from '../utils/ticketState';
import { Drawer } from './Drawer';
import { HandoffPreview } from './HandoffPreview';

interface TicketCenterProps {
  /** When true, opens the selected ticket's detail drawer on mount (cross-view CTA). */
  focusDetailOnMount?: boolean;
  /** Handoff package for the selected ticket, rendered inside the detail drawer. */
  handoffPreview?: HandoffPreviewType;
  locale: Locale;
  onSelectTicket: (ticketId: string) => void;
  selectedTicketId: string;
  tickets: SupportTicket[];
}

export function TicketCenter({
  focusDetailOnMount = false,
  handoffPreview,
  locale,
  onSelectTicket,
  selectedTicketId,
  tickets
}: TicketCenterProps) {
  const [statusById, setStatusById] = useState<Record<string, SupportTicket['status']>>(() =>
    readTicketStatusOverrides(tickets)
  );
  const [ownerById, setOwnerById] = useState<Record<string, SupportTicket['owner']>>(() =>
    readTicketOwnerOverrides(tickets)
  );
  const [ticketUpdateMessage, setTicketUpdateMessage] = useState('');
  // Cross-view CTA targets (dashboard "Open ticket detail" / "Go to tickets") land with the drawer open.
  const [detailOpen, setDetailOpen] = useState(focusDetailOnMount);
  const highPriorityCount = tickets.filter((ticket) => ticket.priority === 'High').length;
  const escalatedCount = tickets.filter((ticket) => (statusById[ticket.id] ?? ticket.status) === 'Escalated').length;
  const slaRiskCount = tickets.filter((ticket) => new Date(ticket.slaDueAt).getTime() <= Date.parse('2026-07-01T12:00:00.000Z')).length;
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) ?? tickets[0];

  function openDetail(ticketId: string) {
    if (ticketId !== selectedTicket?.id) {
      // Drop the previous ticket's inline update message when switching tickets.
      setTicketUpdateMessage('');
    }
    onSelectTicket(ticketId);
    setDetailOpen(true);
  }

  function updateTicketStatus(ticketId: string, status: SupportTicket['status']) {
    setStatusById((current) => {
      const next = { ...current, [ticketId]: status };
      persistTicketStatusOverrides(next);
      return next;
    });
    setTicketUpdateMessage(text(locale, `${formatTicketId(ticketId)} status updated.`, `${formatTicketId(ticketId)} 處理狀態已更新。`));
  }

  function updateTicketOwner(ticketId: string, owner: SupportTicket['owner']) {
    setOwnerById((current) => {
      const next = { ...current, [ticketId]: owner };
      persistTicketOwnerOverrides(next);
      return next;
    });
    setTicketUpdateMessage(
      text(locale, `${formatTicketId(ticketId)} owner (PIC) updated.`, `${formatTicketId(ticketId)} 負責人（PIC）已更新。`)
    );
  }

  return (
    <section className="screen-grid ticket-grid" data-testid="ticket-center">
      <div className="panel span-3">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Tickets & Handoff', '工單與交接')}</p>
            <h3>
              {text(
                locale,
                'Bot-created support cases by queue, owner, SLA, and next action',
                '依隊列、負責人、SLA 與下一步追蹤 bot 工單'
              )}
            </h3>
          </div>
          <span className="count-pill">{text(locale, `${tickets.length} tickets`, `${tickets.length} 張工單`)}</span>
        </div>
        <div className="data-table ticket-table">
          <div className="table-row table-head ticket-table-row">
            <span>{text(locale, 'Ticket', '工單')}</span>
            <span>{text(locale, 'Problem', '問題')}</span>
            <span>{text(locale, 'Queue', '隊列')}</span>
            <span>{text(locale, 'Priority', '優先級')}</span>
            <span>{text(locale, 'SLA', 'SLA')}</span>
            <span>{text(locale, 'Status', '處理狀態')}</span>
            <span>{text(locale, 'Owner (PIC)', '負責人（PIC）')}</span>
            <span>{text(locale, 'Operation', '操作')}</span>
          </div>
          {tickets.map((ticket) => (
            <div
              className={
                detailOpen && ticket.id === selectedTicket?.id
                  ? 'table-row ticket-table-row row-clickable selected'
                  : 'table-row ticket-table-row row-clickable'
              }
              key={ticket.id}
              onClick={() => openDetail(ticket.id)}
            >
              <span data-label={text(locale, 'Ticket', '工單')}>
                <strong>{formatTicketId(ticket.id)}</strong>
                <small>{new Date(ticket.slaDueAt).toLocaleDateString(locale === 'zh-TW' ? 'zh-TW' : 'en-US')}</small>
              </span>
              <span data-label={text(locale, 'Problem', '問題')}>
                <strong>{formatDisplayText(locale, ticket.summary)}</strong>
                <small>{formatDisplayText(locale, ticket.nextAction)}</small>
              </span>
              <span data-label={text(locale, 'Queue', '隊列')}>{formatDisplayText(locale, ticket.queue)}</span>
              <span data-label={text(locale, 'Priority', '優先級')}>
                <span className={`risk-pill ${ticket.priority.toLowerCase()}`}>
                  {formatRiskLevel(locale, ticket.priority)}
                </span>
              </span>
              <span data-label={text(locale, 'SLA', 'SLA')}>
                <span className="sla-pill">
                  <Clock size={13} aria-hidden="true" />
                  {new Date(ticket.slaDueAt).toLocaleTimeString(locale === 'zh-TW' ? 'zh-TW' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </span>
              <span data-label={text(locale, 'Status', '處理狀態')}>
                <select
                  aria-label={text(
                    locale,
                    `Status for ${formatTicketId(ticket.id)}`,
                    `${formatTicketId(ticket.id)} 處理狀態`
                  )}
                  className="table-select"
                  onChange={(event) => updateTicketStatus(ticket.id, event.target.value as SupportTicket['status'])}
                  onClick={(event) => event.stopPropagation()}
                  value={statusById[ticket.id] ?? ticket.status}
                >
                  <option value="Open">{formatDisplayText(locale, 'Open')}</option>
                  <option value="Pending review">{formatDisplayText(locale, 'Pending review')}</option>
                  <option value="Escalated">{formatDisplayText(locale, 'Escalated')}</option>
                  <option value="Resolved">{formatDisplayText(locale, 'Resolved')}</option>
                </select>
              </span>
              <span data-label={text(locale, 'Owner (PIC)', '負責人（PIC）')}>
                <select
                  aria-label={text(locale, `PIC for ${formatTicketId(ticket.id)}`, `${formatTicketId(ticket.id)} 負責人（PIC）`)}
                  className="table-select"
                  onChange={(event) => updateTicketOwner(ticket.id, event.target.value as SupportTicket['owner'])}
                  onClick={(event) => event.stopPropagation()}
                  value={ownerById[ticket.id] ?? ticket.owner}
                >
                  <option value="Support Ops">{formatDisplayText(locale, 'Support Ops')}</option>
                  <option value="Security Ops">{formatDisplayText(locale, 'Security Ops')}</option>
                  <option value="KYC Ops">{formatDisplayText(locale, 'KYC Ops')}</option>
                  <option value="Knowledge Owner">{formatDisplayText(locale, 'Knowledge Owner')}</option>
                  <option value="Compliance">{formatDisplayText(locale, 'Compliance')}</option>
                </select>
              </span>
              <span data-label={text(locale, 'Operation', '操作')}>
                <button className="table-action" onClick={() => openDetail(ticket.id)} type="button">
                  {text(locale, 'Open detail', '開啟詳情')}
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <p className="eyebrow">{text(locale, 'Queue health', '隊列狀態')}</p>
        <h3>{text(locale, 'Ticket risk summary', '工單風險摘要')}</h3>
        <div className="stacked-list ticket-summary-list">
          <SummaryRow label={text(locale, 'High priority', '高優先')} value={highPriorityCount} />
          <SummaryRow label={text(locale, 'Escalated', '已升級')} value={escalatedCount} />
          <SummaryRow label={text(locale, 'SLA watch', 'SLA 關注')} value={slaRiskCount} />
        </div>
      </div>
      <Drawer
        eyebrow={text(locale, 'Ticket detail', '工單詳情')}
        locale={locale}
        onClose={() => setDetailOpen(false)}
        open={detailOpen && Boolean(selectedTicket)}
        title={selectedTicket ? formatTicketId(selectedTicket.id) : ''}
      >
        {selectedTicket && (
        <div data-testid="ticket-detail-panel">
          <div className="pill-stack drawer-pill-stack">
            <span className={`risk-pill ${selectedTicket.priority.toLowerCase()}`}>
              {formatRiskLevel(locale, selectedTicket.priority)}
            </span>
          </div>
          <dl className="compact-detail-list">
            <div>
              <dt>{text(locale, 'Queue', '隊列')}</dt>
              <dd>{formatDisplayText(locale, selectedTicket.queue)}</dd>
            </div>
            <div>
              <dt>{text(locale, 'Status', '處理狀態')}</dt>
              <dd>{formatDisplayText(locale, statusById[selectedTicket.id] ?? selectedTicket.status)}</dd>
            </div>
            <div>
              <dt>{text(locale, 'Owner (PIC)', '負責人（PIC）')}</dt>
              <dd>{formatDisplayText(locale, ownerById[selectedTicket.id] ?? selectedTicket.owner)}</dd>
            </div>
            <div>
              <dt>{text(locale, 'SLA due', 'SLA 到期')}</dt>
              <dd>{new Date(selectedTicket.slaDueAt).toLocaleString(locale === 'zh-TW' ? 'zh-TW' : 'en-US')}</dd>
            </div>
            <div>
              <dt>{text(locale, 'Source signals', '來源訊號')}</dt>
              <dd>{selectedTicket.sourceSignalIds.join(', ')}</dd>
            </div>
            <div>
              <dt>{text(locale, 'Trace reference', 'Trace 參照')}</dt>
              <dd>{selectedTicket.scenarioId}</dd>
            </div>
          </dl>
          <div className="ticket-detail-strip">
            <TicketCheck size={16} aria-hidden="true" />
            <span>{formatDisplayText(locale, selectedTicket.caseSummary)}</span>
          </div>
          <div className="record-detail-panel">
            <p className="eyebrow">{text(locale, 'Next action', '下一步')}</p>
            <p>{formatDisplayText(locale, selectedTicket.nextAction)}</p>
          </div>
          {ticketUpdateMessage && (
            <div className="inline-status" role="status">
              {ticketUpdateMessage}
            </div>
          )}
          <div className="record-detail-panel">
            <p className="eyebrow">{text(locale, 'Timeline', '處理時間線')}</p>
            <ol className="timeline-list">
              <li>
                <strong>{text(locale, 'Bot routed case', 'Bot 建立交接')}</strong>
                <span>{text(locale, 'Source trace attached', '已附上來源 trace')}</span>
              </li>
              <li>
                <strong>{text(locale, 'Queue intake confirmed', '隊列收件確認')}</strong>
                <span>{formatDisplayText(locale, ownerById[selectedTicket.id] ?? selectedTicket.owner)}</span>
              </li>
              <li>
                <strong>{text(locale, 'SLA checkpoint', 'SLA 檢查點')}</strong>
                <span>{new Date(selectedTicket.slaDueAt).toLocaleTimeString(locale === 'zh-TW' ? 'zh-TW' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </li>
            </ol>
          </div>
          <HandoffPreview locale={locale} preview={handoffPreview} />
        </div>
        )}
      </Drawer>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="distribution-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

