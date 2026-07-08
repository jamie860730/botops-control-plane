import { useMemo, useState } from 'react';
import { Download, Loader2, Play, ShieldAlert, X } from 'lucide-react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { EvalCase, EvalResult, EvalRun, JudgeCalibration } from '../types';
import { formatDisplayText } from '../utils/display';
import { buildEvalSummaryRows, getEvalSummaryCsvHeader } from '../utils/export';
import {
  calculateEvaluationSummary,
  getBelowThresholdJudgeVersions,
  isJudgeBelowThreshold
} from '../utils/metrics';

interface EvaluationCenterProps {
  evalCases: EvalCase[];
  evalResults: EvalResult[];
  evalRuns: EvalRun[];
  evalRunnerStatus: string;
  judgeCalibrations: JudgeCalibration[];
  locale: Locale;
  onExportCsv: () => void;
  onRunEval: () => void;
  /** Saved conversation eval cases keyed by scenario id. */
  savedEvalCaseIds: Record<string, string>;
}

export function EvaluationCenter({
  evalCases,
  evalResults,
  evalRuns,
  evalRunnerStatus,
  judgeCalibrations,
  locale,
  onExportCsv,
  onRunEval,
  savedEvalCaseIds
}: EvaluationCenterProps) {
  const [isCsvPreviewOpen, setIsCsvPreviewOpen] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState(evalRuns[0]?.id ?? '');
  const rows = evalRuns.map((run) => ({
    run,
    summary: calculateEvaluationSummary(evalResults, run.id)
  }));
  const csvHeader = useMemo(() => getEvalSummaryCsvHeader(), []);
  const csvRows = useMemo(
    () => buildEvalSummaryRows(evalRuns, evalResults, evalCases),
    [evalCases, evalResults, evalRuns]
  );
  const savedEvalCaseList = Object.values(savedEvalCaseIds);
  const selectedRun = evalRuns.find((run) => run.id === selectedRunId) ?? evalRuns[0];
  const selectedSummary = selectedRun ? calculateEvaluationSummary(evalResults, selectedRun.id) : null;
  const belowThresholdJudgeVersions = getBelowThresholdJudgeVersions(judgeCalibrations);
  const isRunning = evalRunnerStatus === 'Running';
  // Baseline (current release) vs candidate (proposed release) comparison shown after a run completes.
  const baselineRun = evalRuns[0];
  const candidateRun = evalRuns[1];
  const runComparison =
    evalRunnerStatus === 'Completed' && baselineRun && candidateRun
      ? {
          baselineLabel: baselineRun.label,
          candidateLabel: candidateRun.label,
          baselineOverall: calculateEvaluationSummary(evalResults, baselineRun.id).overallQualityScore,
          candidateOverall: calculateEvaluationSummary(evalResults, candidateRun.id).overallQualityScore
        }
      : null;
  const overallDelta = runComparison ? runComparison.candidateOverall - runComparison.baselineOverall : 0;
  const overallDeltaLabel = `${overallDelta >= 0 ? '+' : ''}${overallDelta.toFixed(2)}`;

  function confirmCsvExport() {
    onExportCsv();
    setIsCsvPreviewOpen(false);
  }

  return (
    <section className="screen-grid" data-testid="evaluation-center">
      <div className="panel span-3">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Evaluation Center', '評測中心')}</p>
            <h3>{text(locale, 'Release configuration evaluation runs', '發布設定評測批次')}</h3>
            <p className="metric-scale-note">
              {text(locale, 'Scores range 0–1; 1.00 is a full pass.', '分數區間 0–1，1 為滿分。')}
            </p>
          </div>
          <div className="action-row">
            <button className="secondary-action" onClick={() => setIsCsvPreviewOpen(true)} type="button">
              <Download size={15} aria-hidden="true" />
              {text(locale, 'Export CSV', '匯出 CSV')}
            </button>
            <button
              className="primary-action compact-action"
              disabled={isRunning}
              onClick={onRunEval}
              type="button"
            >
              {isRunning ? (
                <Loader2 className="spinning" size={15} aria-hidden="true" />
              ) : (
                <Play size={15} aria-hidden="true" />
              )}
              {isRunning ? text(locale, 'Running…', '評測中…') : text(locale, 'Start eval run', '啟動評測')}
            </button>
            <span className="count-pill">
              {text(locale, `${evalCases.length} eval cases`, `${evalCases.length} 個評測案例`)}
            </span>
          </div>
        </div>
        <div className="data-table">
          <div className="table-row table-head eval-row">
            <span>{text(locale, 'Run', '評測批次')}</span>
            <span>{text(locale, 'Overall', '整體')}</span>
            <span title={text(locale, 'Share of answers that cite a valid source; higher is better.', '回答有附上有效引用來源的比例，越高越好')}>
              {text(locale, 'With source', '有附來源')}
            </span>
            <span title={text(locale, 'Share of high-risk cases handed to a human; closer to 1 is better.', '高風險案例有轉給真人的比例，越接近 1 越好')}>
              {text(locale, 'High-risk to human', '高風險轉人工')}
            </span>
            <span title={text(locale, 'Share of high-risk cases the bot answered directly without a handoff; closer to 0 is better.', '高風險案例被 bot 直接回掉、沒轉人工的比例，越接近 0 越好')}>
              {text(locale, 'High-risk by bot', '高風險被 bot 回')}
            </span>
            <span title={text(locale, 'Number of cases worse than the last version; fewer is better.', '比前一版變差的案例數，越少越好')}>
              {text(locale, 'Worse cases', '變差案例')}
            </span>
          </div>
          {rows.map(({ run, summary }) => (
            <button
              className={run.id === selectedRun?.id ? 'table-row eval-row interactive-row selected' : 'table-row eval-row interactive-row'}
              key={run.id}
              onClick={() => setSelectedRunId(run.id)}
              type="button"
            >
              <span data-label={text(locale, 'Run', '評測批次')}>
                {formatDisplayText(locale, run.label)}
                {belowThresholdJudgeVersions.has(run.versionConfig.judgeVersion) && (
                  <span className="risk-pill high pending-review-pill" data-testid={`pending-human-review-${run.id}`}>
                    {text(locale, 'Pending human review', '待人工複核')}
                  </span>
                )}
              </span>
              <span data-label={text(locale, 'Overall', '整體')}>{summary.overallQualityScore.toFixed(2)}</span>
              <span data-label={text(locale, 'With source', '有附來源')}>{summary.citationSupportRate.toFixed(2)}</span>
              <span data-label={text(locale, 'High-risk to human', '高風險轉人工')}>{summary.handoffSafetyRecall.toFixed(2)}</span>
              <span data-label={text(locale, 'High-risk by bot', '高風險被 bot 回')}>{summary.highRiskAutoAnswerRate.toFixed(2)}</span>
              <span data-label={text(locale, 'Worse cases', '變差案例')}>{summary.regressionCount}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="panel span-3" data-testid="judge-calibration-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Judge calibration', 'Judge 校準')}</p>
            <h3>{text(locale, 'Can the LLM judge itself be trusted?', 'LLM judge 本身可不可信？')}</h3>
          </div>
          <span className="count-pill">
            {text(locale, `Agreement threshold ${judgeCalibrations[0]?.threshold ?? '—'}`, `一致率門檻 ${judgeCalibrations[0]?.threshold ?? '—'}`)}
          </span>
        </div>
        <div className="judge-cal-grid">
          {judgeCalibrations.map((calibration) => {
            const belowThreshold = isJudgeBelowThreshold(calibration);
            return (
              <article
                className={belowThreshold ? 'judge-cal-card below-threshold' : 'judge-cal-card'}
                data-testid={`judge-cal-${calibration.judgeVersion}`}
                key={calibration.id}
              >
                <div className="judge-cal-head">
                  <strong>{calibration.judgeVersion}</strong>
                  {belowThreshold ? (
                    <span className="risk-pill high">{text(locale, 'Below threshold', '低於門檻')}</span>
                  ) : (
                    <span className="risk-pill low">{text(locale, 'Calibrated', '校準正常')}</span>
                  )}
                </div>
                <dl className="judge-cal-metrics">
                  <div>
                    <dt>{text(locale, 'Human agreement', '與人工一致率')}</dt>
                    <dd>
                      {calibration.humanAgreementRate.toFixed(2)}
                      <span className="judge-cal-threshold">
                        {text(locale, ` / threshold ${calibration.threshold.toFixed(2)}`, ` ／ 門檻 ${calibration.threshold.toFixed(2)}`)}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>{text(locale, 'Sampled cases', '抽樣案例')}</dt>
                    <dd>{calibration.sampledCases}</dd>
                  </div>
                  <div>
                    <dt>{text(locale, 'Sampling review queue', '抽樣複核佇列')}</dt>
                    <dd>{text(locale, `${calibration.pendingReviewCount} pending`, `${calibration.pendingReviewCount} 筆待複核`)}</dd>
                  </div>
                  <div>
                    <dt>{text(locale, 'Version drift', '換版漂移')}</dt>
                    <dd>
                      {calibration.driftAlert
                        ? text(locale, 'Drift alert', '漂移警示')
                        : text(locale, 'No drift detected', '未偵測到漂移')}
                    </dd>
                  </div>
                </dl>
                {calibration.driftNote && <p className="judge-cal-note">{formatDisplayText(locale, calibration.driftNote)}</p>}
                {belowThreshold && (
                  <p className="inline-status danger" data-testid={`judge-review-warning-${calibration.judgeVersion}`}>
                    <ShieldAlert size={15} aria-hidden="true" />
                    {text(
                      locale,
                      'Eval results are pending human review and must not be used as a release basis.',
                      '評測結果待人工複核，不得作為發布依據。'
                    )}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </div>
      <div className="panel">
        <p className="eyebrow">{text(locale, 'Runner status', '評測執行狀態')}</p>
        <h3 data-testid="eval-runner-status">{runnerStatusLabel(locale, evalRunnerStatus)}</h3>
        <p>
          {text(
            locale,
            'Latest runner state for release evaluation jobs.',
            '發布評測工作的最新 runner 狀態。'
          )}
        </p>
        {runComparison && (
          <p className="inline-status" data-testid="eval-run-result-summary" role="status">
            {text(
              locale,
              `${runComparison.candidateLabel} overall ${runComparison.candidateOverall.toFixed(2)} vs ${runComparison.baselineLabel} ${runComparison.baselineOverall.toFixed(2)} (${overallDeltaLabel} overall).`,
              `${formatDisplayText(locale, runComparison.candidateLabel)} 整體 ${runComparison.candidateOverall.toFixed(2)}，對比 ${formatDisplayText(locale, runComparison.baselineLabel)} ${runComparison.baselineOverall.toFixed(2)}（整體 ${overallDeltaLabel}）。`
            )}
          </p>
        )}
      </div>
      <div className="panel">
        <p className="eyebrow">{text(locale, 'Linked eval cases', '連結評測案例')}</p>
        {savedEvalCaseList.length > 0 ? (
          <ul className="linked-eval-case-list" data-testid="linked-eval-case-list">
            {savedEvalCaseList.map((evalCaseId) => (
              <li key={evalCaseId}>{evalCaseId}</li>
            ))}
          </ul>
        ) : (
          <h3>{text(locale, 'No saved interaction yet', '尚未轉存互動紀錄')}</h3>
        )}
        <p>
          {text(
            locale,
            'Linked records retain source, messages, trace events, and version config.',
            '連結紀錄保留來源、訊息、trace events 與版本設定。'
          )}
        </p>
      </div>
      {selectedRun && selectedSummary && (
        <div className="panel span-2" data-testid="eval-run-detail">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{text(locale, 'Run detail', '評測批次詳情')}</p>
              <h3>{formatDisplayText(locale, selectedRun.label)}</h3>
            </div>
            <span className="count-pill">{formatDisplayText(locale, selectedRun.status)}</span>
          </div>
          <dl className="compact-detail-list">
            <div>
              <dt>{text(locale, 'Evaluation dataset', '評測資料集')}</dt>
              <dd>{selectedRun.datasetId}</dd>
            </div>
            <div>
              <dt>{text(locale, 'Flow version', '流程版本')}</dt>
              <dd>{selectedRun.versionConfig.flowVersion}</dd>
            </div>
            <div>
              <dt>{text(locale, 'Prompt version', 'Prompt 版本')}</dt>
              <dd>{selectedRun.versionConfig.promptVersion}</dd>
            </div>
            <div>
              <dt>{text(locale, 'KB snapshot', '知識庫快照')}</dt>
              <dd>{selectedRun.versionConfig.kbSnapshot}</dd>
            </div>
            <div>
              <dt>{text(locale, 'Retrieval config', '檢索設定')}</dt>
              <dd>{selectedRun.versionConfig.retrievalConfig}</dd>
            </div>
            <div>
              <dt>{text(locale, 'Overall', '整體')}</dt>
              <dd>{selectedSummary.overallQualityScore.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      )}
      {isCsvPreviewOpen && (
        <div
          aria-labelledby="csv-preview-title"
          aria-modal="true"
          className="modal-backdrop"
          data-testid="csv-preview-modal"
          role="dialog"
        >
          <div className="modal-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{text(locale, 'CSV Preview', 'CSV 預覽')}</p>
                <h3 id="csv-preview-title">
                  {text(locale, 'Export fields and data scope', '匯出欄位與資料範圍')}
                </h3>
              </div>
              <button
                aria-label={text(locale, 'Close CSV preview', '關閉 CSV 預覽')}
                className="icon-button"
                onClick={() => setIsCsvPreviewOpen(false)}
                type="button"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <p className="modal-copy">
              {text(
                locale,
                'This export contains run-level evaluation metrics only. It does not include customer identifiers, raw private messages, or account data.',
                '此匯出僅包含 run-level 評測指標，不包含客戶識別資訊、私人原文訊息或帳戶資料。'
              )}
            </p>
            <div className="data-table csv-preview-table">
              <div className="table-row table-head csv-row">
                {csvHeader.map((column) => (
                  <span key={column}>{column}</span>
                ))}
              </div>
              {csvRows.map((row) => (
                <div className="table-row csv-row" key={row[0]}>
                  {row.map((cell, index) => (
                    <span key={`${row[0]}_${csvHeader[index]}`}>{cell}</span>
                  ))}
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="tertiary-action" onClick={() => setIsCsvPreviewOpen(false)} type="button">
                {text(locale, 'Cancel', '取消')}
              </button>
              <button className="primary-action compact-action" onClick={confirmCsvExport} type="button">
                <Download size={15} aria-hidden="true" />
                {text(locale, 'Download CSV', '下載 CSV')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function runnerStatusLabel(locale: Locale, status: string) {
  if (status === 'Running') {
    return text(locale, 'Running', '評測中');
  }
  if (status === 'Completed') {
    return text(locale, 'Completed', '已完成');
  }
  return text(locale, 'Idle', '待執行');
}
