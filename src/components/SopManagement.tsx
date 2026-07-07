import { useState } from 'react';
import type { SopAutomationBoundary, SopRecord } from '../types';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import { formatDisplayText, formatRiskLevel, formatTraceNode } from '../utils/display';
import { Drawer } from './Drawer';

interface SopManagementProps {
  sopRecords: SopRecord[];
  locale: Locale;
}

const boundaryPillClass: Record<SopAutomationBoundary, string> = {
  auto: 'risk-pill low',
  human_confirm: 'risk-pill medium',
  forbidden: 'risk-pill high'
};

export function SopManagement({ sopRecords, locale }: SopManagementProps) {
  // The SOP detail lives in a drawer, so nothing is selected until a row is clicked.
  const [selectedSopId, setSelectedSopId] = useState('');

  const selectedSop = sopRecords.find((record) => record.id === selectedSopId);
  const publishedCount = sopRecords.filter((record) => record.status === 'Published').length;
  const forbiddenStepCount = sopRecords
    .flatMap((record) => record.steps)
    .filter((step) => step.automationBoundary === 'forbidden').length;

  const labels = {
    id: 'ID',
    title: text(locale, 'Title', '標題'),
    trigger: text(locale, 'Trigger scenario', '觸發情境'),
    risk: text(locale, 'Risk', '風險等級'),
    owner: text(locale, 'Owner', '負責單位'),
    status: text(locale, 'Status', '狀態'),
    steps: text(locale, 'Steps', '步驟數')
  };

  return (
    <section className="screen-grid" data-testid="sop-management">
      <div className="panel span-3">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'SOP management', 'SOP 管理')}</p>
            <h3>
              {text(
                locale,
                'Structured SOPs with per-step automation boundaries',
                '結構化 SOP 與每一步驟的自動化邊界'
              )}
            </h3>
          </div>
          <span className="count-pill">
            {locale === 'zh-TW'
              ? `${publishedCount} 筆已發布 · ${forbiddenStepCount} 個禁止自動化步驟`
              : `${publishedCount} published · ${forbiddenStepCount} automation-forbidden steps`}
          </span>
        </div>
        <div className="data-table">
          <div className="table-row table-head sop-row">
            <span>{labels.id}</span>
            <span>{labels.title}</span>
            <span>{labels.trigger}</span>
            <span>{labels.risk}</span>
            <span>{labels.owner}</span>
            <span>{labels.status}</span>
            <span>{labels.steps}</span>
          </div>
          {sopRecords.map((record) => (
            <button
              className={
                record.id === selectedSop?.id
                  ? 'table-row sop-row interactive-row selected'
                  : 'table-row sop-row interactive-row'
              }
              key={record.id}
              onClick={() => setSelectedSopId(record.id)}
              type="button"
            >
              <span data-label={labels.id}>{shortSopId(record.id)}</span>
              <span data-label={labels.title}>
                <strong>{formatDisplayText(locale, record.title)}</strong>
              </span>
              <span data-label={labels.trigger}>
                <small>{formatDisplayText(locale, record.triggerScenario)}</small>
              </span>
              <span data-label={labels.risk}>
                <span className={`risk-pill ${record.riskClass.toLowerCase()}`}>
                  {formatRiskLevel(locale, record.riskClass)}
                </span>
              </span>
              <span data-label={labels.owner}>{formatDisplayText(locale, record.owner)}</span>
              <span data-label={labels.status}>{formatDisplayText(locale, record.status)}</span>
              <span data-label={labels.steps}>{record.steps.length}</span>
            </button>
          ))}
        </div>
      </div>

      <Drawer
        eyebrow={text(locale, 'SOP detail', 'SOP 詳情')}
        locale={locale}
        onClose={() => setSelectedSopId('')}
        open={Boolean(selectedSop)}
        title={selectedSop ? formatDisplayText(locale, selectedSop.title) : ''}
      >
        {selectedSop && (
          <>
            <dl className="compact-detail-list">
              <div>
                <dt>{labels.trigger}</dt>
                <dd>{formatDisplayText(locale, selectedSop.triggerScenario)}</dd>
              </div>
              <div>
                <dt>{labels.risk}</dt>
                <dd>{formatRiskLevel(locale, selectedSop.riskClass)}</dd>
              </div>
              <div>
                <dt>{labels.owner}</dt>
                <dd>{formatDisplayText(locale, selectedSop.owner)}</dd>
              </div>
              <div>
                <dt>{labels.status}</dt>
                <dd>{formatDisplayText(locale, selectedSop.status)}</dd>
              </div>
            </dl>

            <div className="record-detail-panel">
              <p className="eyebrow">{text(locale, 'Step timeline', '步驟時間軸')}</p>
              <ol className="timeline-list sop-step-list">
                {selectedSop.steps.map((step) => (
                  <li
                    className={step.automationBoundary === 'forbidden' ? 'sop-step forbidden' : 'sop-step'}
                    data-testid={`sop-step-${step.automationBoundary}`}
                    key={step.id}
                  >
                    <div className="sop-step-head">
                      <strong>
                        {text(locale, `Step ${step.order}`, `步驟 ${step.order}`)}
                      </strong>
                      <span className={boundaryPillClass[step.automationBoundary]}>
                        {boundaryLabel(locale, step.automationBoundary)}
                      </span>
                    </div>
                    <p className="sop-step-instruction">{formatDisplayText(locale, step.instruction)}</p>
                    {step.branchCondition && (
                      <p className="sop-step-branch">
                        <strong>{text(locale, 'Branch', '分支條件')}</strong>
                        {formatDisplayText(locale, step.branchCondition)}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </div>

            <div className="record-detail-panel">
              <p className="eyebrow">{text(locale, 'Linked chat flow nodes', '對應 chat flow 節點')}</p>
              <p>
                {text(
                  locale,
                  'Flow nodes that enforce this SOP inside the bot trace.',
                  '在 bot 處理紀錄中負責執行此 SOP 的 flow 節點。'
                )}
              </p>
              <div className="tag-list sop-flow-map">
                {selectedSop.linkedFlowNodes.map((nodeName) => (
                  <span className="count-pill" key={nodeName}>
                    {formatTraceNode(locale, nodeName)}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </Drawer>

      <div className="panel span-3">
        <p className="eyebrow">{text(locale, 'Automation boundary', '自動化邊界')}</p>
        <h3>{text(locale, 'What the bot may, must confirm, or must never do', 'Bot 可做、需確認、絕不可做的事')}</h3>
        <dl className="detail-list">
          <div>
            <dt>
              <span className="risk-pill low">{boundaryLabel(locale, 'auto')}</span>
            </dt>
            <dd>
              {text(
                locale,
                'Low-risk, reversible steps the bot executes directly, e.g. collecting non-sensitive fields or queueing re-index jobs.',
                '低風險且可逆的步驟由 bot 直接執行，例如收集非敏感欄位、排入重建索引。'
              )}
            </dd>
          </div>
          <div>
            <dt>
              <span className="risk-pill medium">{boundaryLabel(locale, 'human_confirm')}</span>
            </dt>
            <dd>
              {text(
                locale,
                'The bot prepares the action, but a named owner confirms it before it runs, e.g. account freezes or incident declaration.',
                'Bot 準備好動作，但需指定負責人確認後才執行，例如帳戶凍結、事故宣告。'
              )}
            </dd>
          </div>
          <div>
            <dt>
              <span className="risk-pill high">{boundaryLabel(locale, 'forbidden')}</span>
            </dt>
            <dd>
              {text(
                locale,
                'Never automated regardless of confidence: asset movement decisions, refunds, compensation promises. These always stay with humans.',
                '無論信心多高都不得自動化：資產移動決策、退款、補償承諾，永遠由人工處理。'
              )}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function boundaryLabel(locale: Locale, boundary: SopAutomationBoundary) {
  if (boundary === 'auto') {
    return text(locale, 'Auto-executable', '可自動執行');
  }
  if (boundary === 'human_confirm') {
    return text(locale, 'Needs human confirm', '需人工確認');
  }
  return text(locale, 'Automation forbidden', '禁止自動化');
}

function shortSopId(value: string) {
  return value.replace(/^sop_/, '').replace(/_/g, '-');
}
