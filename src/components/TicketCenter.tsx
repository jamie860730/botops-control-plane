import { Clock, TicketCheck } from 'lucide-react';
import { useState } from 'react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { SupportTicket } from '../types';
import { formatDisplayText, formatRiskLevel, formatTicketId } from '../utils/display';

interface TicketCenterProps {
  locale: Locale;
  tickets: SupportTicket[];
}

export function TicketCenter({ locale, tickets }: TicketCenterProps) {
  const [statusById, setStatusById] = useState<Record<string, SupportTicket['status']>>(() =>
    Object.fromEntries(tickets.map((ticket) => [ticket.id, ticket.status]))
  );
  const [ownerById, setOwnerById] = useState<Record<string, SupportTicket['owner']>>(() =>
    Object.fromEntries(tickets.map((ticket) => [ticket.id, ticket.owner]))
  );
  const highPriorityCount = tickets.filter((ticket) => ticket.priority === 'High').length;
  const escalatedCount = tickets.filter((ticket) => ticket.status === 'Escalated').length;
  const slaRiskCount = tickets.filter((ticket) => new Date(ticket.slaDueAt).getTime() <= Date.parse('2026-07-01T12:00:00.000Z')).length;

  return (
    <section className="screen-grid ticket-grid" data-testid="ticket-center">
      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Ticket Center', '工單中心')}</p>
            <h3>{text(locale, 'Operational queue for bot-reviewed support cases', '機器人審查後客服案例隊列')}</h3>
          </div>
          <span className="count-pill">{text(locale, `${tickets.length} tickets`, `${tickets.length} 張工單`)}</span>
        </div>
        <div className="ticket-list">
          {tickets.map((ticket) => (
            <article className="ticket-row" key={ticket.id}>
              <div>
                <div className="ticket-meta-line">
                  <span className="row-icon">
                    <TicketCheck size={15} aria-hidden="true" />
                  </span>
                  <span className="sla-pill">
                    <Clock size={13} aria-hidden="true" />
                    {new Date(ticket.slaDueAt).toLocaleTimeString(locale === 'zh-TW' ? 'zh-TW' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className={`risk-pill ${ticket.priority.toLowerCase()}`}>
                    {formatRiskLevel(locale, ticket.priority)}
                  </span>
                </div>
                <div className="row-title">
                  <strong>{formatDisplayText(locale, ticket.summary)}</strong>
                </div>
                <dl className="ticket-meta-list">
                  <div>
                    <dt>{text(locale, 'Ticket ID', '工單編號')}</dt>
                    <dd>{formatTicketId(ticket.id)}</dd>
                  </div>
                  <div>
                    <dt>{text(locale, 'Queue', '隊列')}</dt>
                    <dd>{formatDisplayText(locale, ticket.queue)}</dd>
                  </div>
                </dl>
                <p>{formatDisplayText(locale, ticket.caseSummary)}</p>
                <div className="ticket-next-action">
                  <strong>{text(locale, 'Next action', '下一步')}</strong>
                  <span>{formatDisplayText(locale, ticket.nextAction)}</span>
                </div>
              </div>
              <aside className="ticket-status-panel">
                <label>
                  <span>{text(locale, 'Status', '處理狀態')}</span>
                  <select
                    aria-label={text(
                      locale,
                      `Status for ${formatTicketId(ticket.id)}`,
                      `${formatTicketId(ticket.id)} 處理狀態`
                    )}
                    onChange={(event) =>
                      setStatusById((current) => ({
                        ...current,
                        [ticket.id]: event.target.value as SupportTicket['status']
                      }))
                    }
                    value={statusById[ticket.id] ?? ticket.status}
                  >
                    <option value="Open">{formatDisplayText(locale, 'Open')}</option>
                    <option value="Pending review">{formatDisplayText(locale, 'Pending review')}</option>
                    <option value="Escalated">{formatDisplayText(locale, 'Escalated')}</option>
                    <option value="Resolved">{formatDisplayText(locale, 'Resolved')}</option>
                  </select>
                </label>
                <label>
                  <span>PIC</span>
                  <select
                    aria-label={text(locale, `PIC for ${formatTicketId(ticket.id)}`, `${formatTicketId(ticket.id)} PIC`)}
                    onChange={(event) =>
                      setOwnerById((current) => ({
                        ...current,
                        [ticket.id]: event.target.value as SupportTicket['owner']
                      }))
                    }
                    value={ownerById[ticket.id] ?? ticket.owner}
                  >
                    <option value="Support Ops">{formatDisplayText(locale, 'Support Ops')}</option>
                    <option value="Security Ops">{formatDisplayText(locale, 'Security Ops')}</option>
                    <option value="KYC Ops">{formatDisplayText(locale, 'KYC Ops')}</option>
                    <option value="Knowledge Owner">{formatDisplayText(locale, 'Knowledge Owner')}</option>
                    <option value="Compliance">{formatDisplayText(locale, 'Compliance')}</option>
                  </select>
                </label>
              </aside>
            </article>
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
