import { useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { FaqCandidate, FaqCandidateStatus, GapCluster, GapClusterStatus } from '../types';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import { formatDisplayText, formatSourceChannel } from '../utils/display';
import { persistFaqCandidateStatusOverrides, readFaqCandidateStatusOverrides } from '../utils/knowledgeState';
import { Drawer } from './Drawer';

export type FaqReviewDecision = 'adopted' | 'returned' | 'not_automatable';

interface GapMiningProps {
  clusters: GapCluster[];
  candidates: FaqCandidate[];
  locale: Locale;
  onCandidateReview: (candidate: FaqCandidate, cluster: GapCluster, decision: FaqReviewDecision) => void;
}

const decisionToCandidateStatus: Record<FaqReviewDecision, FaqCandidateStatus> = {
  adopted: 'Adopted',
  returned: 'Returned',
  not_automatable: 'Not automatable'
};

export function GapMining({ clusters, candidates, locale, onCandidateReview }: GapMiningProps) {
  // The cluster detail lives in a drawer, so nothing is selected until a row is clicked.
  const [selectedClusterId, setSelectedClusterId] = useState('');
  const [candidateStatusOverrides, setCandidateStatusOverrides] = useState<Record<string, FaqCandidateStatus>>(() =>
    readFaqCandidateStatusOverrides()
  );
  const [actionMessage, setActionMessage] = useState('');

  const selectedCluster = clusters.find((cluster) => cluster.id === selectedClusterId);
  const selectedCandidate = selectedCluster
    ? candidates.find((candidate) => candidate.clusterId === selectedCluster.id)
    : undefined;
  const pendingCount = candidates.filter(
    (candidate) => effectiveCandidateStatus(candidate) === 'Pending review'
  ).length;
  const adoptedCount = clusters.filter((cluster) => clusterDisplayStatus(cluster) === 'Adopted').length;

  const labels = {
    cluster: text(locale, 'Recurring questions', '重複問題'),
    volume: text(locale, 'Volume', '量體'),
    trend: text(locale, 'Weekly trend', '週趨勢'),
    samples: text(locale, 'Sample utterances', '樣本語句'),
    relatedKb: text(locale, 'Related KB', '關聯 KB'),
    status: text(locale, 'Status', '狀態')
  };

  function effectiveCandidateStatus(candidate: FaqCandidate): FaqCandidateStatus {
    return candidateStatusOverrides[candidate.id] ?? candidate.status;
  }

  function clusterDisplayStatus(cluster: GapCluster): GapClusterStatus {
    const candidate = candidates.find((entry) => entry.clusterId === cluster.id);
    if (!candidate) {
      return cluster.status;
    }
    const candidateStatus = effectiveCandidateStatus(candidate);
    if (candidateStatus === 'Adopted') {
      return 'Adopted';
    }
    if (candidateStatus === 'Not automatable') {
      return 'Not automatable';
    }
    if (candidateStatus === 'Returned') {
      return 'Candidate drafted';
    }
    return cluster.status;
  }

  function reviewCandidate(decision: FaqReviewDecision) {
    if (!selectedCluster || !selectedCandidate) {
      return;
    }
    setCandidateStatusOverrides((overrides) => {
      const next = { ...overrides, [selectedCandidate.id]: decisionToCandidateStatus[decision] };
      persistFaqCandidateStatusOverrides(next);
      return next;
    });
    setActionMessage(reviewFeedback(locale, decision));
    onCandidateReview(selectedCandidate, selectedCluster, decision);
  }

  const selectedCandidateStatus = selectedCandidate ? effectiveCandidateStatus(selectedCandidate) : undefined;
  const showDeflection =
    selectedCandidate !== undefined &&
    selectedCandidateStatus === 'Adopted' &&
    selectedCandidate.deflectionBefore !== undefined &&
    selectedCandidate.deflectionAfter !== undefined;

  return (
    <section className="screen-grid" data-testid="gap-mining">
      <div className="panel span-3">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Gap mining', '缺口挖掘')}</p>
            <h3>
              {text(
                locale,
                'Recurring questions from unresolved and handed-off conversations',
                '從未解決與交接對話中反覆出現的問題'
              )}
            </h3>
          </div>
          <span className="count-pill">
            {locale === 'zh-TW'
              ? `${pendingCount} 筆候選待審 · ${adoptedCount} 類問題已採納`
              : `${pendingCount} pending review · ${adoptedCount} adopted`}
          </span>
        </div>
        <div className="data-table">
          <div className="table-row table-head gap-row">
            <span>{labels.cluster}</span>
            <span>{labels.volume}</span>
            <span>{labels.trend}</span>
            <span>{labels.samples}</span>
            <span>{labels.relatedKb}</span>
            <span>{labels.status}</span>
          </div>
          {clusters.map((cluster) => (
            <button
              className={
                cluster.id === selectedCluster?.id
                  ? 'table-row gap-row interactive-row selected'
                  : 'table-row gap-row interactive-row'
              }
              key={cluster.id}
              onClick={() => {
                setSelectedClusterId(cluster.id);
                setActionMessage('');
              }}
              type="button"
            >
              <span data-label={labels.cluster}>
                <strong>{formatDisplayText(locale, cluster.label)}</strong>
                <small>{cluster.sourceChannels.map((channel) => formatSourceChannel(locale, channel)).join(' · ')}</small>
              </span>
              <span data-label={labels.volume}>{cluster.volume.toLocaleString()}</span>
              <span data-label={labels.trend} className="gap-trend">
                <TrendIcon trend={cluster.weeklyTrend} />
                {trendLabel(locale, cluster.weeklyTrend)}
              </span>
              <span data-label={labels.samples}>
                <small>{cluster.sampleUtterances[0]}</small>
                {cluster.sampleUtterances.length > 1 && (
                  <small>
                    {locale === 'zh-TW'
                      ? `+${cluster.sampleUtterances.length - 1} 句樣本`
                      : `+${cluster.sampleUtterances.length - 1} more samples`}
                  </small>
                )}
              </span>
              <span data-label={labels.relatedKb}>{kbStatusLabel(locale, cluster.relatedKbStatus)}</span>
              <span data-label={labels.status}>{formatDisplayText(locale, clusterDisplayStatus(cluster))}</span>
            </button>
          ))}
        </div>
      </div>

      <Drawer
        eyebrow={text(locale, 'Recurring questions detail', '重複問題詳情')}
        footer={
          selectedCandidate && (
            <>
              <button
                className="primary-action compact-action"
                onClick={() => reviewCandidate('adopted')}
                type="button"
              >
                {text(locale, 'Adopt into KB', '採納入庫')}
              </button>
              <button
                className="secondary-action compact-action"
                onClick={() => reviewCandidate('returned')}
                type="button"
              >
                {text(locale, 'Return for rewrite', '退回重寫')}
              </button>
              <button
                className="secondary-action compact-action"
                onClick={() => reviewCandidate('not_automatable')}
                type="button"
              >
                {text(locale, 'Mark not automatable', '標記不適合自動化')}
              </button>
            </>
          )
        }
        locale={locale}
        onClose={() => {
          setSelectedClusterId('');
          setActionMessage('');
        }}
        open={Boolean(selectedCluster)}
        title={selectedCluster ? formatDisplayText(locale, selectedCluster.label) : ''}
      >
        {selectedCluster && (
          <>
            <dl className="compact-detail-list">
              <div>
                <dt>{labels.volume}</dt>
                <dd>{selectedCluster.volume.toLocaleString()}</dd>
              </div>
              <div>
                <dt>{labels.trend}</dt>
                <dd>{trendLabel(locale, selectedCluster.weeklyTrend)}</dd>
              </div>
              <div>
                <dt>{labels.relatedKb}</dt>
                <dd>{kbStatusLabel(locale, selectedCluster.relatedKbStatus)}</dd>
              </div>
              <div>
                <dt>{labels.status}</dt>
                <dd>{formatDisplayText(locale, clusterDisplayStatus(selectedCluster))}</dd>
              </div>
            </dl>

            <div className="record-detail-panel">
              <p className="eyebrow">{text(locale, 'Sample utterances', '樣本語句')}</p>
              <div className="chunk-preview-list">
                {selectedCluster.sampleUtterances.map((utterance) => (
                  <article className="chunk-preview" key={utterance}>
                    <p>{utterance}</p>
                  </article>
                ))}
              </div>
            </div>

            {selectedCandidate ? (
              <>
                <div className="record-detail-panel">
                  <p className="eyebrow">{text(locale, 'AI-drafted FAQ candidate', 'AI 起草的 FAQ 候選')}</p>
                  <h4>{formatDisplayText(locale, selectedCandidate.draftQuestion)}</h4>
                  <p>{formatDisplayText(locale, selectedCandidate.draftAnswer)}</p>
                  <dl className="compact-detail-list gap-candidate-meta">
                    <div>
                      <dt>{text(locale, 'Citations', '引用來源')}</dt>
                      <dd>{selectedCandidate.citations.join(', ')}</dd>
                    </div>
                    <div>
                      <dt>{text(locale, 'Review note', '審核意見')}</dt>
                      <dd>{formatDisplayText(locale, selectedCandidate.reviewNote)}</dd>
                    </div>
                    <div>
                      <dt>{text(locale, 'Candidate status', '候選狀態')}</dt>
                      <dd>{formatDisplayText(locale, effectiveCandidateStatus(selectedCandidate))}</dd>
                    </div>
                  </dl>
                </div>
                {actionMessage && (
                  <div className="inline-status" role="status">
                    {actionMessage}
                  </div>
                )}
              </>
            ) : (
              <div className="record-detail-panel">
                <p className="eyebrow">{text(locale, 'Observing', '觀察中')}</p>
                <p>
                  {text(
                    locale,
                    'Sample volume is below the drafting threshold. This question type stays in observation and no FAQ draft is generated yet.',
                    '樣本數低於起草門檻，這類問題維持觀察中，暫不產生 FAQ 草稿。'
                  )}
                </p>
              </div>
            )}

            {showDeflection && selectedCandidate && (
              <div className="record-detail-panel">
                <p className="eyebrow">{text(locale, 'Deflection tracking', 'Deflection 成效追蹤')}</p>
                <dl className="compact-detail-list">
                  <div>
                    <dt>{text(locale, 'Before adoption', '入庫前')}</dt>
                    <dd>{formatRate(selectedCandidate.deflectionBefore!)}</dd>
                  </div>
                  <div>
                    <dt>{text(locale, 'After adoption', '入庫後')}</dt>
                    <dd>{formatRate(selectedCandidate.deflectionAfter!)}</dd>
                  </div>
                </dl>
                <p>
                  {text(
                    locale,
                    'Share of these contacts resolved by the bot without human handoff.',
                    '這類問題由 bot 解決、不用轉人工的比例。'
                  )}
                </p>
              </div>
            )}
          </>
        )}
      </Drawer>

      <div className="panel span-3">
        <p className="eyebrow">{text(locale, 'Workflow', '工作流')}</p>
        <h3>{text(locale, 'From gap discovery to measured deflection', '從發現缺口到量測成效')}</h3>
        <dl className="detail-list">
          <div>
            <dt>{text(locale, 'Discover', '發現')}</dt>
            <dd>
              {text(
                locale,
                'Unresolved and handed-off conversations are automatically grouped by similarity.',
                '系統把未解決與轉人工的對話，依相似度自動歸成同一類。'
              )}
            </dd>
          </div>
          <div>
            <dt>{text(locale, 'Draft', '起草')}</dt>
            <dd>
              {text(
                locale,
                'Question types above the sample threshold get an AI-drafted FAQ candidate with citations.',
                '樣本數達門檻的這類問題會產生附引用的 AI FAQ 候選草稿。'
              )}
            </dd>
          </div>
          <div>
            <dt>{text(locale, 'Review', '審核')}</dt>
            <dd>
              {text(
                locale,
                'Knowledge Owner adopts, returns, or marks the candidate as not automatable; every decision is audited.',
                'Knowledge Owner 決定採納、退回或標記不適合自動化，每個決策都寫入稽核紀錄。'
              )}
            </dd>
          </div>
          <div>
            <dt>{text(locale, 'Track', '追蹤')}</dt>
            <dd>
              {text(
                locale,
                'Adopted question types report deflection before and after the FAQ went live.',
                '已採納的這類問題會追蹤 FAQ 上線前後的 deflection 對照。'
              )}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function TrendIcon({ trend }: { trend: GapCluster['weeklyTrend'] }) {
  if (trend === 'up') {
    return <ArrowUpRight size={17} aria-label="up" />;
  }
  if (trend === 'down') {
    return <ArrowDownRight size={17} aria-label="down" />;
  }
  return <ArrowRight size={17} aria-label="flat" />;
}

function trendLabel(locale: Locale, trend: GapCluster['weeklyTrend']) {
  if (trend === 'up') {
    return text(locale, 'Rising', '上升');
  }
  if (trend === 'down') {
    return text(locale, 'Falling', '下降');
  }
  return text(locale, 'Flat', '持平');
}

function kbStatusLabel(locale: Locale, status: GapCluster['relatedKbStatus']) {
  return status === 'missing' ? text(locale, 'Missing', '缺漏') : text(locale, 'Weak', '薄弱');
}

function reviewFeedback(locale: Locale, decision: FaqReviewDecision) {
  if (decision === 'adopted') {
    return text(
      locale,
      'Candidate adopted into the knowledge base. Deflection tracking starts for this question type.',
      '候選已採納入庫，開始追蹤這類問題的 deflection 成效。'
    );
  }
  if (decision === 'returned') {
    return text(
      locale,
      'Candidate returned for rewrite with the review note attached.',
      '候選已退回重寫，並附上審核意見。'
    );
  }
  return text(
    locale,
    'Marked as not automatable. Contacts keep routing to human support.',
    '已標記為不適合自動化，這類問題維持人工處理。'
  );
}

function formatRate(value: number) {
  return `${Math.round(value * 100)}%`;
}
