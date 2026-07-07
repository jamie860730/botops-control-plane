import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { FlowNodeChangeType, FlowVersionDiff } from '../types';
import { formatDisplayText, formatTraceNode } from '../utils/display';

interface FlowVersionDiffViewProps {
  diff: FlowVersionDiff;
  locale: Locale;
}

const changeTypePillClass: Record<Exclude<FlowNodeChangeType, 'unchanged'>, string> = {
  added: 'risk-pill low',
  modified: 'risk-pill medium',
  removed: 'risk-pill high'
};

export function changeTypeLabel(locale: Locale, changeType: FlowNodeChangeType) {
  if (changeType === 'added') {
    return text(locale, 'added', '新增');
  }
  if (changeType === 'removed') {
    return text(locale, 'removed', '移除');
  }
  if (changeType === 'modified') {
    return text(locale, 'modified', '修改');
  }
  return text(locale, 'unchanged', '未變更');
}

/** One-line summary of the diff, used to prefill the release decision reason. */
export function flowDiffSummary(diff: FlowVersionDiff, locale: Locale): string {
  const segments: string[] = [];
  const changeOrder: Exclude<FlowNodeChangeType, 'unchanged'>[] = ['removed', 'added', 'modified'];
  for (const changeType of changeOrder) {
    const names = diff.nodeChanges
      .filter((change) => change.changeType === changeType)
      .map((change) => formatTraceNode(locale, change.nodeName));
    if (names.length > 0) {
      segments.push(
        locale === 'zh-TW'
          ? `${changeTypeLabel(locale, changeType)} ${names.join('、')}`
          : `${changeTypeLabel(locale, changeType)} ${names.join(', ')}`
      );
    }
  }
  if (diff.promptChanges.length > 0) {
    segments.push(
      text(locale, `${diff.promptChanges.length} prompt section updated`, `${diff.promptChanges.length} 段 prompt 更新`)
    );
  }
  if (diff.kbSnapshotChange) {
    segments.push(`KB ${diff.kbSnapshotChange.from} → ${diff.kbSnapshotChange.to}`);
  }
  if (diff.retrievalConfigChange) {
    segments.push(
      text(
        locale,
        `retriever ${diff.retrievalConfigChange.from} → ${diff.retrievalConfigChange.to}`,
        `檢索設定 ${diff.retrievalConfigChange.from} → ${diff.retrievalConfigChange.to}`
      )
    );
  }
  const header = `${formatDisplayText(locale, diff.baseVersionLabel)} → ${formatDisplayText(
    locale,
    diff.candidateVersionLabel
  )}`;
  return locale === 'zh-TW' ? `${header}：${segments.join('；')}。` : `${header}: ${segments.join('; ')}.`;
}

export function FlowVersionDiffView({ diff, locale }: FlowVersionDiffViewProps) {
  const changedNodes = diff.nodeChanges.filter((change) => change.changeType !== 'unchanged');

  return (
    <div className="flow-diff-panel" data-testid={`flow-diff-${diff.bundleId}`}>
      <div className="flow-diff-header">
        <span className="count-pill">{formatDisplayText(locale, diff.baseVersionLabel)}</span>
        <span className="flow-diff-arrow" aria-hidden="true" />
        <span className="count-pill">{formatDisplayText(locale, diff.candidateVersionLabel)}</span>
      </div>

      <div className="flow-diff-section">
        <p className="eyebrow">{text(locale, 'Flow topology (read-only)', '流程拓撲（唯讀）')}</p>
        <ol className="flow-topology">
          {diff.nodeChanges.map((change, index) => (
            <li className="flow-topology-step" key={change.nodeName}>
              {index > 0 && <span className="flow-diff-arrow" aria-hidden="true" />}
              <span
                className={`flow-node-pill ${change.changeType}`}
                data-testid={`flow-node-${change.changeType}`}
              >
                {formatTraceNode(locale, change.nodeName)}
                <small>{changeTypeLabel(locale, change.changeType)}</small>
              </span>
            </li>
          ))}
        </ol>
      </div>

      {changedNodes.length > 0 && (
        <div className="flow-diff-section">
          <p className="eyebrow">{text(locale, 'Node changes', '節點變更')}</p>
          <ul className="flow-diff-node-list">
            {changedNodes.map((change) => (
              <li className={`flow-diff-node-item ${change.changeType}`} key={change.nodeName}>
                <div className="flow-diff-node-head">
                  <strong>{formatTraceNode(locale, change.nodeName)}</strong>
                  {change.changeType !== 'unchanged' && (
                    <span className={changeTypePillClass[change.changeType]}>
                      {changeTypeLabel(locale, change.changeType)}
                    </span>
                  )}
                </div>
                {change.detail && <p>{formatDisplayText(locale, change.detail)}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {diff.promptChanges.map((change) => (
        <div className="flow-diff-section" key={change.section}>
          <p className="eyebrow">
            {text(locale, 'Prompt change', 'Prompt 變更')} · {formatDisplayText(locale, change.section)}
          </p>
          <p className="flow-diff-note">{formatDisplayText(locale, change.summary)}</p>
          <div className="prompt-diff-grid">
            <div className="prompt-diff-excerpt before">
              <span>{text(locale, 'Before', '修改前')}</span>
              <p>{formatDisplayText(locale, change.beforeExcerpt)}</p>
            </div>
            <div className="prompt-diff-excerpt after">
              <span>{text(locale, 'After', '修改後')}</span>
              <p>{formatDisplayText(locale, change.afterExcerpt)}</p>
            </div>
          </div>
        </div>
      ))}

      {(diff.kbSnapshotChange || diff.retrievalConfigChange) && (
        <div className="flow-diff-section">
          <p className="eyebrow">{text(locale, 'Snapshot & retrieval changes', '知識快照與檢索設定異動')}</p>
          {diff.kbSnapshotChange && (
            <div className="flow-diff-config-row">
              <strong>{text(locale, 'KB snapshot', '知識庫快照')}</strong>{' '}
              <code>{diff.kbSnapshotChange.from}</code> → <code>{diff.kbSnapshotChange.to}</code>
              <p>{formatDisplayText(locale, diff.kbSnapshotChange.summary)}</p>
            </div>
          )}
          {diff.retrievalConfigChange && (
            <div className="flow-diff-config-row">
              <strong>{text(locale, 'Retrieval config', '檢索設定')}</strong>{' '}
              <code>{diff.retrievalConfigChange.from}</code> → <code>{diff.retrievalConfigChange.to}</code>
              <p>{formatDisplayText(locale, diff.retrievalConfigChange.summary)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
