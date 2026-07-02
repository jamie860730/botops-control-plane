import { Clock, ShieldAlert, TicketCheck } from 'lucide-react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { SupportTicket } from '../types';
import { formatDisplayText, formatRiskLevel } from '../utils/display';

interface TicketCenterProps {
  locale: Locale;
  tickets: SupportTicket[];
}

export function TicketCenter({ locale, tickets }: TicketCenterProps) {
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
              <div className="row-icon">
                {ticket.priority === 'High' ? <ShieldAlert size={15} aria-hidden="true" /> : <TicketCheck size={15} aria-hidden="true" />}
              </div>
              <div>
                <div className="row-title">
                  <strong>{formatDisplayText(locale, ticket.summary)}</strong>
                  <span>{ticket.id}</span>
                  <span>{formatDisplayText(locale, ticket.queue)}</span>
                </div>
                <p>{formatDisplayText(locale, ticket.caseSummary)}</p>
                <div className="ticket-next-action">
                  <strong>{text(locale, 'Next action', '下一步')}</strong>
                  <span>{formatDisplayText(locale, ticket.nextAction)}</span>
                </div>
              </div>
              <aside className="ticket-status-panel">
                <span className={`risk-pill ${ticket.priority.toLowerCase()}`}>
                  {formatRiskLevel(locale, ticket.priority)}
                </span>
                <strong>{formatDisplayText(locale, ticket.status)}</strong>
                <span>{formatDisplayText(locale, ticket.owner)}</span>
                <span className="sla-pill">
                  <Clock size={13} aria-hidden="true" />
                  {new Date(ticket.slaDueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
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
