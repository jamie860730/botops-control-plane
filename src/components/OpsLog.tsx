import { Activity, Download, PlayCircle, Save, ShieldCheck } from 'lucide-react';
import type { AuditEvent } from '../types';

interface OpsLogProps {
  events: AuditEvent[];
}

const eventIconMap = {
  scenario_run: PlayCircle,
  eval_case_saved: Save,
  eval_runner_started: Activity,
  eval_runner_completed: ShieldCheck,
  csv_exported: Download
};

export function OpsLog({ events }: OpsLogProps) {
  return (
    <section className="screen-grid" data-testid="ops-log">
      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Ops Log</p>
            <h3>Persistent action history for product and operations review</h3>
          </div>
          <span className="count-pill">{events.length} events</span>
        </div>
        <div className="audit-list">
          {events.map((event) => {
            const Icon = eventIconMap[event.eventType];
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
        <p className="eyebrow">Why this page exists</p>
        <h3>Prove governance, not only answer quality</h3>
        <p>
          Bot management needs a review trail for scenario runs, saved eval cases, offline eval execution, exports, and
          release decisions. P1 stores this locally now; the same event shape can later be persisted by a backend audit
          log service.
        </p>
      </div>
    </section>
  );
}
