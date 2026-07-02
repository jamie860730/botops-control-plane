import { useMemo, useState } from 'react';
import { Download, Play, X } from 'lucide-react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { EvalCase, EvalResult, EvalRun } from '../types';
import { buildEvalSummaryRows, getEvalSummaryCsvHeader } from '../utils/export';
import { calculateEvaluationSummary } from '../utils/metrics';

interface EvaluationCenterProps {
  evalCases: EvalCase[];
  evalResults: EvalResult[];
  evalRuns: EvalRun[];
  evalRunnerStatus: string;
  locale: Locale;
  onExportCsv: () => void;
  onRunEval: () => void;
  savedEvalCaseId: string | null;
}

export function EvaluationCenter({
  evalCases,
  evalResults,
  evalRuns,
  evalRunnerStatus,
  locale,
  onExportCsv,
  onRunEval,
  savedEvalCaseId
}: EvaluationCenterProps) {
  const [isCsvPreviewOpen, setIsCsvPreviewOpen] = useState(false);
  const rows = evalRuns.map((run) => ({
    run,
    summary: calculateEvaluationSummary(evalResults, run.id)
  }));
  const csvHeader = useMemo(() => getEvalSummaryCsvHeader(), []);
  const csvRows = useMemo(
    () => buildEvalSummaryRows(evalRuns, evalResults, evalCases),
    [evalCases, evalResults, evalRuns]
  );

  function confirmCsvExport() {
    onExportCsv();
    setIsCsvPreviewOpen(false);
  }

  return (
    <section className="screen-grid" data-testid="evaluation-center">
      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Evaluation Center', '評測中心')}</p>
            <h3>{text(locale, 'Compare release configurations on the same approved cases', '用同一批核准案例比較發布設定')}</h3>
          </div>
          <div className="action-row">
            <button className="secondary-action" onClick={() => setIsCsvPreviewOpen(true)} type="button">
              <Download size={15} aria-hidden="true" />
              {text(locale, 'Export CSV', '匯出 CSV')}
            </button>
            <button className="primary-action compact-action" onClick={onRunEval} type="button">
              <Play size={15} aria-hidden="true" />
              {text(locale, 'Run evaluation', '執行評測')}
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
            <span>{text(locale, 'Citation', '引用')}</span>
            <span>{text(locale, 'Handoff Safety Recall', '交接召回')}</span>
            <span>{text(locale, 'Auto-answer', '自動回覆')}</span>
            <span>{text(locale, 'Regressions', '退化')}</span>
          </div>
          {rows.map(({ run, summary }) => (
            <div className="table-row eval-row" key={run.id}>
              <span>{run.label}</span>
              <span>{summary.overallQualityScore.toFixed(2)}</span>
              <span>{summary.citationSupportRate.toFixed(2)}</span>
              <span>{summary.handoffSafetyRecall.toFixed(2)}</span>
              <span>{summary.highRiskAutoAnswerRate.toFixed(2)}</span>
              <span>{summary.regressionCount}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <p className="eyebrow">{text(locale, 'Runner status', '評測執行狀態')}</p>
        <h3 data-testid="eval-runner-status">{text(locale, evalRunnerStatus, evalRunnerStatus === 'Completed' ? '已完成' : '待執行')}</h3>
        <p>
          {text(
            locale,
            'Evaluation runs compare versioned prompts, retrieval settings, and knowledge snapshots before release actions are approved.',
            '評測會比較版本化 prompt、檢索設定與知識庫 snapshot，作為發布核准前的依據。'
          )}
        </p>
      </div>
      <div className="panel">
        <p className="eyebrow">{text(locale, 'Saved evaluation case', '已保存評測案例')}</p>
        <h3>{savedEvalCaseId ?? text(locale, 'No saved interaction yet', '尚未轉存互動紀錄')}</h3>
        <p>
          {text(
            locale,
            'Saved conversations keep the source signal, messages, trace events, and version config so they can be replayed in the eval runner.',
            '轉存互動會保留來源訊號、訊息、trace events 與版本設定，後續可於評測 runner 中 replay。'
          )}
        </p>
      </div>
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
