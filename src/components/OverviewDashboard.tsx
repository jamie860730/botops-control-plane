import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import {
  calculateEconomics,
  calculateEvaluationSummary,
  defaultEconomicsAssumptions,
  type EconomicsAssumptions
} from '../utils/metrics';
import type { RiskLevel, SeedData, SourceChannel, SupportTicket } from '../types';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import { formatDisplayText, formatRiskLevel, formatSourceChannel, formatTicketId } from '../utils/display';
import { applyKnowledgeState } from '../utils/knowledgeState';
import { applyTicketOverrides } from '../utils/ticketState';
import type { NavigationTarget, ViewKey } from './Shell';

interface OverviewDashboardProps {
  data: SeedData;
  locale: Locale;
  onNavigate: (view: ViewKey, target?: NavigationTarget) => void;
}

export function OverviewDashboard({ data, locale, onNavigate }: OverviewDashboardProps) {
  const [selectedQueueName, setSelectedQueueName] = useState('');
  const [assumptions, setAssumptions] = useState<EconomicsAssumptions>(defaultEconomicsAssumptions);
  const [isAssumptionsOpen, setIsAssumptionsOpen] = useState(false);
  const economics = calculateEconomics(assumptions, data.csBotKpiSegments, data.badcases);

  function updateAssumption(key: keyof EconomicsAssumptions, value: number) {
    setAssumptions((current) => ({ ...current, [key]: value }));
  }
  const summary = calculateEvaluationSummary(data.evalResults, 'run_v19_candidate');
  const sourceCounts = data.supportSignals.reduce<Record<string, number>>((counts, signal) => {
    counts[signal.sourceChannel] = (counts[signal.sourceChannel] ?? 0) + 1;
    return counts;
  }, {});
  // Live cross-view state: apply the localStorage-backed overrides written by
  // TicketCenter / KnowledgeBase instead of reading raw seed values.
  const tickets = applyTicketOverrides(data.supportTickets);
  const documents = applyKnowledgeState(data.knowledgeDocuments);
  const activeTickets = tickets.filter((ticket) => ticket.status !== 'Resolved');
  const activeTicketCount = activeTickets.length;
  const reindexCount = documents.filter((document) => document.indexStatus === 'Needs re-index').length;
  const blockedReleaseCount = data.releaseBundles.filter((bundle) => bundle.status === 'Blocked').length;
  const openBadcaseCount = data.badcases.filter((badcase) => badcase.status !== 'Fixed').length;
  const highRiskTicketCount = activeTickets.filter((ticket) => ticket.priority === 'High').length;
  const topSegments = [...data.csBotKpiSegments].sort((a, b) => b.volume - a.volume).slice(0, 5);
  // Entity targets for the priority queue CTAs so the destination view can pre-select them.
  const reindexTargetDoc = [...documents]
    .filter((document) => document.indexStatus === 'Needs re-index')
    .sort((a, b) => b.citationUsage - a.citationUsage)[0];
  const securityTicket = tickets.find((ticket) => ticket.queue === 'Security-L2') ?? tickets[0];
  const priorityItems: Array<{
    title: string;
    severity: string;
    owner: string;
    due: string;
    detail: string;
    action: string;
    view: ViewKey;
    target?: NavigationTarget;
  }> = [
    {
      title: text(locale, 'Blocked release package', '阻擋發布套件'),
      severity: text(locale, 'High', '高'),
      owner: 'PM',
      due: text(locale, 'Today', '今日'),
      detail: text(
        locale,
        'Policy release package v18 fails handoff safety, high-risk auto-answer, and regression gates.',
        '政策發布套件 v18 未通過交接召回、高風險自動回覆與退化門檻。'
      ),
      action: text(locale, 'Review release gates', '審查發布門檻'),
      view: 'quality' as ViewKey
    },
    {
      title: text(locale, 'Security-L2 ticket SLA', 'Security-L2 工單 SLA'),
      severity: text(locale, 'High', '高'),
      owner: 'Security Ops',
      due: '18:12',
      detail: text(
        locale,
        'Account takeover case is escalated and requires verified handoff package before SLA breach.',
        '帳戶盜用案例已升級，需在 SLA 前確認人工交接包。'
      ),
      action: text(locale, 'Open ticket detail', '開啟工單詳情'),
      view: 'tickets' as ViewKey,
      target: securityTicket ? { ticketId: securityTicket.id } : undefined
    },
    {
      title: text(locale, 'Knowledge re-index required', '知識需重建索引'),
      severity: text(locale, 'Medium', '中'),
      owner: 'Knowledge Owner',
      due: text(locale, 'This week', '本週'),
      detail: text(
        locale,
        'Global transfer FAQ has the highest query count and an outdated retrieval index.',
        '全球轉帳 FAQ 查詢量最高且檢索索引已過期。'
      ),
      action: text(locale, 'Review KB record', '審查知識紀錄'),
      view: 'knowledge' as ViewKey,
      target: reindexTargetDoc ? { knowledgeDocId: reindexTargetDoc.id } : undefined
    }
  ];
  // Each queue card carries the tickets that actually belong to it so the detail
  // panel can compute live counts, priority, and SLA instead of static copy.
  const operations: Array<{
    name: string;
    value: number;
    detail: string;
    tickets: SupportTicket[];
  }> = [
    {
      name: text(locale, 'Signals awaiting review', '待審訊號'),
      value: data.supportSignals.length,
      detail: text(locale, 'Repeated post-reply issues by source.', '依來源彙整重複回覆後問題。'),
      tickets: tickets.filter((ticket) => ticket.sourceSignalIds.length > 0)
    },
    {
      name: text(locale, 'Active support tickets', '進行中工單'),
      value: activeTicketCount,
      detail: text(locale, 'Escalated queues, owners, and SLA exposure.', '升級隊列、負責人與 SLA 風險。'),
      tickets: activeTickets
    },
    {
      name: text(locale, 'Knowledge items to re-index', '需重建索引文件'),
      value: reindexCount,
      detail: text(locale, 'Retrieval evidence requires refresh.', '檢索依據需更新。'),
      tickets: tickets.filter((ticket) => ticket.queue === 'Knowledge Ops')
    },
    {
      name: text(locale, 'Blocked releases', '阻擋發布'),
      value: blockedReleaseCount,
      detail: text(locale, 'Release gates blocking rollout.', '阻擋 rollout 的發布門檻。'),
      tickets: tickets.filter((ticket) => ticket.queue === 'Compliance Support')
    }
  ];
  const selectedOperation = operations.find((operation) => operation.name === selectedQueueName) ?? operations[0];
  const highestPriority = getHighestPriority(selectedOperation.tickets);
  const nearestSlaTicket = [...selectedOperation.tickets].sort(
    (a, b) => new Date(a.slaDueAt).getTime() - new Date(b.slaDueAt).getTime()
  )[0];

  return (
    <section className="screen-grid overview-grid" data-testid="pm-dashboard">
      <div className="panel span-3 priority-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Priority queue', '優先工作')}</p>
            <h3>{text(locale, 'Operational work requiring action', '需要處理的營運工作')}</h3>
          </div>
          <span className="count-pill">{text(locale, `${priorityItems.length} active`, `${priorityItems.length} 項進行中`)}</span>
        </div>
        <div className="priority-list">
          {priorityItems.map((item) => (
            <article className="priority-row" key={item.title}>
              <div>
                <div className="row-title">
                  <strong>{item.title}</strong>
                  <span className={item.severity === text(locale, 'High', '高') ? 'risk-pill high' : 'risk-pill medium'}>
                    {item.severity}
                  </span>
                </div>
                <p>{item.detail}</p>
              </div>
              <dl className="priority-meta">
                <div>
                  <dt>{text(locale, 'Owner', '負責單位')}</dt>
                  <dd>{formatDisplayText(locale, item.owner)}</dd>
                </div>
                <div>
                  <dt>{text(locale, 'Due', '期限')}</dt>
                  <dd>{item.due}</dd>
                </div>
              </dl>
              <button
                className="primary-action compact-action"
                onClick={() => onNavigate(item.view, item.target)}
                type="button"
              >
                {item.action}
              </button>
            </article>
          ))}
        </div>
      </div>
      <div className="panel span-2 pm-dashboard-hero">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Operations Dashboard', '營運儀表板')}</p>
            <h3>
              {text(
                locale,
                'Bot quality, knowledge coverage, handoff exposure, and release status',
                'Bot 品質、知識覆蓋、交接風險與發布狀態'
              )}
            </h3>
          </div>
        </div>
        <div className="pm-metric-grid">
          <PmMetric
            label={text(locale, 'Reviewed interactions', '已審互動')}
            value={data.scenarios.length.toString()}
            detail={text(locale, 'Retained trace records', '保留 trace 的互動紀錄')}
            openLabel={text(locale, 'Open Conversations for reviewed interactions', '開啟已審互動的對話審查')}
            onOpen={() => onNavigate('conversations')}
          />
          <PmMetric
            label={text(locale, 'Auto-resolution quality', '自動解決品質')}
            value={summary.overallQualityScore.toFixed(2)}
            detail={text(locale, 'Approved eval set', '核准評測集')}
            openLabel={text(locale, 'Open KPI detail for auto-resolution quality', '開啟自動解決品質的 KPI 詳情')}
            onOpen={() => onNavigate('quality', { qualityTab: 'kpi', kpiMetricId: 'kpi_auto_resolution_rate' })}
          />
          <PmMetric
            label={text(locale, 'Knowledge gaps', '知識缺口')}
            value={reindexCount.toString()}
            detail={text(locale, 'Needs re-index or missing source review', '需重建索引或補來源')}
            openLabel={text(locale, 'Open Knowledge for gap review', '開啟知識治理檢視缺口')}
            onOpen={() => onNavigate('knowledge')}
          />
          <PmMetric
            label={text(locale, 'Bot-created tickets', 'Bot 造成工單')}
            value={activeTicketCount.toString()}
            detail={text(locale, `${highRiskTicketCount} high-risk cases`, `${highRiskTicketCount} 件高風險案例`)}
            danger={highRiskTicketCount > 0}
            openLabel={text(locale, 'Open Tickets & Handoff', '開啟工單與交接')}
            onOpen={() => onNavigate('tickets')}
          />
          <PmMetric
            label={text(locale, 'Open badcases', '未結失敗案例')}
            value={openBadcaseCount.toString()}
            detail={text(locale, 'Assigned repair backlog', '已指派修正 backlog')}
            openLabel={text(locale, 'Open Quality badcases', '開啟品質失敗案例')}
            onOpen={() => onNavigate('quality', { qualityTab: 'badcases' })}
          />
          <PmMetric
            label={text(locale, 'Release readiness', '發布狀態')}
            value={blockedReleaseCount > 0 ? text(locale, 'Blocked', '阻擋') : text(locale, 'Ready', '可發布')}
            detail={text(locale, 'Release gate result', '發布門檻結果')}
            danger={blockedReleaseCount > 0}
            openLabel={text(locale, 'Open release gates', '開啟發布門檻')}
            onOpen={() => onNavigate('quality', { qualityTab: 'release' })}
          />
        </div>
      </div>
      <div className="panel span-3 economics-panel" data-testid="economics-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Operating economics', '營運經濟學')}</p>
            <h3>{text(locale, 'Estimated bot value in cost language', '以成本語言估算 bot 價值')}</h3>
            <p className="metric-scale-note" data-testid="econ-seed-note">
              {text(
                locale,
                'Seed mode = estimates computed from local demo data, not production statistics.',
                'seed 模式＝以本地示範資料計算的估算值，非生產統計。'
              )}
            </p>
          </div>
          <button
            aria-expanded={isAssumptionsOpen}
            className="secondary-action"
            data-testid="econ-assumptions-toggle"
            onClick={() => setIsAssumptionsOpen((open) => !open)}
            type="button"
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
            {text(locale, 'Assumptions', '假設參數')}
          </button>
        </div>
        <div className="econ-card-grid">
          <article className="econ-card" data-testid="econ-card-cost">
            <span className="econ-card-label">
              {text(locale, 'Cost per auto-resolved ticket', '每張自動解決工單成本')}
            </span>
            <strong data-testid="econ-cost-value">${economics.botCostPerTicketUsd.toFixed(2)}</strong>
            <p>
              {text(
                locale,
                `vs estimated human handling $${economics.humanCostPerTicketUsd.toFixed(2)} per ticket, an estimated $${economics.costSavedPerTicketUsd.toFixed(2)} saved each.`,
                `對比估算人工處理每張 $${economics.humanCostPerTicketUsd.toFixed(2)}，估算每張節省 $${economics.costSavedPerTicketUsd.toFixed(2)}。`
              )}
            </p>
            <span
              className="econ-note"
              title={text(
                locale,
                'Seed mode = estimates computed from local demo data, not production statistics.',
                'seed 模式＝以本地示範資料計算的估算值，非生產統計。'
              )}
            >
              {text(locale, 'Seed-mode illustrative', 'seed 模式示意值')}
            </span>
          </article>
          <article className="econ-card" data-testid="econ-card-deflection">
            <span className="econ-card-label">
              {text(locale, 'Deflection saved hours (this period)', '本期 deflection 節省人時')}
            </span>
            <strong data-testid="econ-deflection-value">
              {text(locale, `${economics.deflectionSavedHours} h`, `${economics.deflectionSavedHours} 小時`)}
            </strong>
            <p>
              {text(
                locale,
                `${economics.autoResolvedTickets.toLocaleString('en-US')} auto-resolved tickets × ${assumptions.humanMinutesPerTicket} min ÷ 60 ≈ estimated $${economics.deflectionSavedCostUsd.toLocaleString('en-US')} of human handling.`,
                `${economics.autoResolvedTickets.toLocaleString('en-US')} 張自動解決工單 × ${assumptions.humanMinutesPerTicket} 分鐘 ÷ 60，估算相當於 $${economics.deflectionSavedCostUsd.toLocaleString('en-US')} 人工處理成本。`
              )}
            </p>
            <span
              className="econ-note"
              title={text(
                locale,
                'Seed mode = estimates computed from local demo data, not production statistics.',
                'seed 模式＝以本地示範資料計算的估算值，非生產統計。'
              )}
            >
              {text(locale, 'Seed-mode illustrative', 'seed 模式示意值')}
            </span>
          </article>
          <article className="econ-card" data-testid="econ-card-badcase">
            <span className="econ-card-label">
              {text(locale, 'Badcase repair payback', 'badcase 修復量化回收')}
            </span>
            <strong data-testid="econ-badcase-value">
              ${economics.badcaseRecoveredCostUsd.toLocaleString('en-US')}
            </strong>
            <p>
              {text(
                locale,
                `${economics.fixedBadcaseCount} fixed badcases × ${assumptions.ticketsAvoidedPerFixedBadcase} avoided tickets ≈ estimated ${economics.badcaseRecoveredHours} h of human handling recovered.`,
                `${economics.fixedBadcaseCount} 件已修復 badcase × ${assumptions.ticketsAvoidedPerFixedBadcase} 張避免工單，估算回收約 ${economics.badcaseRecoveredHours} 小時人工處理。`
              )}
            </p>
            <span
              className="econ-note"
              title={text(
                locale,
                'Seed mode = estimates computed from local demo data, not production statistics.',
                'seed 模式＝以本地示範資料計算的估算值，非生產統計。'
              )}
            >
              {text(locale, 'Seed-mode illustrative', 'seed 模式示意值')}
            </span>
          </article>
        </div>
        {isAssumptionsOpen && (
          <div className="econ-assumptions" data-testid="econ-assumptions-panel">
            <p className="eyebrow">{text(locale, 'Editable assumptions', '可編輯假設參數')}</p>
            <p className="econ-assumptions-copy">
              {text(
                locale,
                'Estimates recalculate immediately; nothing is persisted. Auto-resolved volume is derived from seed KPI segments unless overridden.',
                '估算值即時重算，不會保存。自動解決量預設由 seed KPI 分群推導，可手動覆寫。'
              )}
            </p>
            <div className="econ-assumptions-grid">
              <EconField
                label={text(locale, 'Human cost (USD / hr)', '人工單位成本（USD／小時）')}
                value={assumptions.humanHourlyCostUsd}
                onChange={(value) => updateAssumption('humanHourlyCostUsd', value)}
              />
              <EconField
                label={text(locale, 'Human minutes per ticket', '平均人工處理分鐘數')}
                value={assumptions.humanMinutesPerTicket}
                onChange={(value) => updateAssumption('humanMinutesPerTicket', value)}
              />
              <EconField
                label={text(locale, 'Bot cost per auto-resolved ticket (USD)', '每張自動解決工單 bot 成本（USD）')}
                step={0.01}
                value={assumptions.botCostPerResolvedTicketUsd}
                onChange={(value) => updateAssumption('botCostPerResolvedTicketUsd', value)}
              />
              <EconField
                label={text(locale, 'Tickets avoided per fixed badcase', '每件修復 badcase 避免工單數')}
                value={assumptions.ticketsAvoidedPerFixedBadcase}
                onChange={(value) => updateAssumption('ticketsAvoidedPerFixedBadcase', value)}
              />
              <EconField
                label={text(locale, 'Auto-resolved tickets (this period)', '本期自動解決量')}
                value={economics.autoResolvedTickets}
                onChange={(value) => updateAssumption('autoResolvedTickets', value)}
              />
            </div>
          </div>
        )}
      </div>
      <div className="panel overview-kpi">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Release gates', '發布門檻')}</p>
            <h3>{text(locale, 'Gate metrics for release approval', '發布核准門檻指標')}</h3>
            <p className="metric-scale-note">
              {text(locale, 'Scores range 0–1; 1.00 is a full pass.', '分數區間 0–1，1 為滿分。')}
            </p>
          </div>
        </div>
        <div className="metric-grid">
          <Metric label={text(locale, 'Overall Quality', '整體品質')} value={summary.overallQualityScore.toFixed(2)} />
          <Metric label={text(locale, 'Citation Support', '引用支撐率')} value={summary.citationSupportRate.toFixed(2)} />
          <Metric label={text(locale, 'Handoff Safety Recall', '交接召回率')} value={summary.handoffSafetyRecall.toFixed(2)} />
          <Metric label={text(locale, 'High-risk Auto-answer', '高風險自動回覆')} value={summary.highRiskAutoAnswerRate.toFixed(2)} danger />
        </div>
      </div>
      <div className="panel overview-source">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Source Distribution', '來源分布')}</p>
            <h3>{text(locale, 'Signal volume by source', '各來源訊號量')}</h3>
          </div>
        </div>
        <div className="stacked-list">
          {Object.entries(sourceCounts).map(([source, count]) => (
            <div className="distribution-row" key={source}>
              <span>{formatSourceChannel(locale, source as SourceChannel)}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="panel overview-map">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Work status', '工作狀態')}</p>
            <h3>{text(locale, 'Operational queue summary', '營運隊列摘要')}</h3>
          </div>
        </div>
        <div className="page-purpose-grid">
          {operations.map((operation) => (
            <button
              className={
                selectedQueueName === operation.name
                  ? 'page-purpose detail-card-button selected'
                  : 'page-purpose detail-card-button'
              }
              key={operation.name}
              onClick={() => setSelectedQueueName(operation.name)}
              type="button"
            >
              <strong>{operation.value}</strong>
              <p>{operation.name}</p>
              <p>{operation.detail}</p>
            </button>
          ))}
        </div>
        <div className="record-detail-panel" data-testid="queue-detail-panel">
          <p className="eyebrow">{text(locale, 'Queue detail', '隊列詳情')}</p>
          <h4>{selectedOperation.name}</h4>
          <dl className="compact-detail-list">
            <div>
              <dt>{text(locale, 'Related tickets', '相關工單')}</dt>
              <dd data-testid="queue-ticket-count">
                {text(
                  locale,
                  `${selectedOperation.tickets.length} ticket${selectedOperation.tickets.length === 1 ? '' : 's'}`,
                  `${selectedOperation.tickets.length} 張工單`
                )}
              </dd>
            </div>
            <div>
              <dt>{text(locale, 'Highest priority', '最高優先級')}</dt>
              <dd>{highestPriority ? formatRiskLevel(locale, highestPriority) : text(locale, 'None', '無')}</dd>
            </div>
            <div>
              <dt>{text(locale, 'Nearest SLA', '最近 SLA')}</dt>
              <dd>
                {nearestSlaTicket
                  ? `${formatTicketId(nearestSlaTicket.id)} · ${new Date(nearestSlaTicket.slaDueAt).toLocaleString(
                      locale === 'zh-TW' ? 'zh-TW' : 'en-US'
                    )}`
                  : text(locale, 'No SLA exposure', '無 SLA 風險')}
              </dd>
            </div>
          </dl>
          {nearestSlaTicket && (
            <div className="record-action-bar">
              <button
                className="primary-action compact-action"
                data-testid="queue-open-tickets"
                onClick={() => onNavigate('tickets', { ticketId: nearestSlaTicket.id })}
                type="button"
              >
                {text(locale, 'Go to tickets', '前往工單')}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Top user cases', '高量用戶案例')}</p>
            <h3>{text(locale, 'Case clusters affecting KPI movement', '影響 KPI 的案例群')}</h3>
          </div>
        </div>
        <div className="data-table">
          <div className="table-row table-head overview-case-row">
            <span>{text(locale, 'Case cluster', '案例群')}</span>
            <span>{text(locale, 'Volume', '量體')}</span>
            <span>{text(locale, 'Repeat contact', '重複進線')}</span>
            <span>{text(locale, 'SLA risk', 'SLA 風險')}</span>
            <span>{text(locale, 'PM focus', 'PM 關注')}</span>
          </div>
          {topSegments.map((segment) => (
            <div className="table-row overview-case-row" key={segment.id}>
              <span data-label={text(locale, 'Case cluster', '案例群')}>{formatDisplayText(locale, segment.segment)}</span>
              <span data-label={text(locale, 'Volume', '量體')}>{segment.volume}</span>
              <span data-label={text(locale, 'Repeat contact', '重複進線')}>{Math.round(segment.repeatContactRate * 100)}%</span>
              <span data-label={text(locale, 'SLA risk', 'SLA 風險')}>{segment.slaRiskCount}</span>
              <span data-label={text(locale, 'PM focus', 'PM 關注')}>{formatDisplayText(locale, segment.reviewFocus)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function getHighestPriority(tickets: SupportTicket[]): RiskLevel | null {
  const order: RiskLevel[] = ['High', 'Medium', 'Low'];
  return order.find((level) => tickets.some((ticket) => ticket.priority === level)) ?? null;
}

function PmMetric({
  label,
  value,
  detail,
  danger = false,
  openLabel,
  onOpen
}: {
  label: string;
  value: string;
  detail: string;
  danger?: boolean;
  /** Accessible name describing where the card drill-through lands. */
  openLabel: string;
  onOpen: () => void;
}) {
  return (
    <button
      aria-label={openLabel}
      className={danger ? 'pm-metric-card danger' : 'pm-metric-card'}
      onClick={onOpen}
      type="button"
    >
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </button>
  );
}

function EconField({
  label,
  value,
  onChange,
  step = 1
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  return (
    <label className="econ-field">
      <span>{label}</span>
      <input
        aria-label={label}
        min={0}
        onChange={(event) => {
          const parsed = Number(event.target.value);
          onChange(Number.isFinite(parsed) && parsed >= 0 ? parsed : 0);
        }}
        step={step}
        type="number"
        value={value}
      />
    </label>
  );
}

function Metric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className={danger ? 'metric-tile danger' : 'metric-tile'}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
