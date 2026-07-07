import { X } from 'lucide-react';
import { useMemo, useRef, useState, type MouseEvent } from 'react';
import type { FaqCandidate, GapCluster, KnowledgeDocument, SopRecord } from '../types';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import { formatDisplayText, formatProduct } from '../utils/display';
import {
  applyKnowledgeState,
  persistCitationReviewFlags,
  persistIndexStatusOverrides,
  readCitationReviewFlags,
  readIndexStatusOverrides
} from '../utils/knowledgeState';
import { Drawer } from './Drawer';
import { GapMining, type FaqReviewDecision } from './GapMining';
import { SopManagement } from './SopManagement';

type KnowledgeTab = 'inventory' | 'gap' | 'sop';

interface KnowledgeBaseProps {
  documents: KnowledgeDocument[];
  gapClusters: GapCluster[];
  faqCandidates: FaqCandidate[];
  sopRecords: SopRecord[];
  highlightedChunkId: string;
  /** When provided, the inventory pre-selects this document and scrolls to its record detail. */
  initialSelectedDocId?: string | null;
  locale: Locale;
  onFaqCandidateReview: (candidate: FaqCandidate, cluster: GapCluster, decision: FaqReviewDecision) => void;
  onQueueReindex: (doc: KnowledgeDocument) => void;
}

export function KnowledgeBase({
  documents,
  gapClusters,
  faqCandidates,
  sopRecords,
  highlightedChunkId,
  initialSelectedDocId,
  locale,
  onFaqCandidateReview,
  onQueueReindex
}: KnowledgeBaseProps) {
  const [knowledgeTab, setKnowledgeTab] = useState<KnowledgeTab>('inventory');

  return (
    <section className="module-stack">
      <div className="quality-tabs" role="tablist" aria-label={text(locale, 'Knowledge sections', '知識模組')}>
        {knowledgeTabs(locale).map((tab) => (
          <button
            aria-selected={knowledgeTab === tab.key}
            className={knowledgeTab === tab.key ? 'chip selected' : 'chip'}
            key={tab.key}
            onClick={() => setKnowledgeTab(tab.key)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      {knowledgeTab === 'inventory' && (
        <KnowledgeInventory
          documents={documents}
          highlightedChunkId={highlightedChunkId}
          initialSelectedDocId={initialSelectedDocId}
          locale={locale}
          onQueueReindex={onQueueReindex}
        />
      )}
      {knowledgeTab === 'gap' && (
        <GapMining
          candidates={faqCandidates}
          clusters={gapClusters}
          locale={locale}
          onCandidateReview={onFaqCandidateReview}
        />
      )}
      {knowledgeTab === 'sop' && <SopManagement locale={locale} sopRecords={sopRecords} />}
    </section>
  );
}

function knowledgeTabs(locale: Locale): Array<{ key: KnowledgeTab; label: string }> {
  return [
    { key: 'inventory', label: text(locale, 'Knowledge inventory', '知識清冊') },
    { key: 'gap', label: text(locale, 'Gap mining', '缺口挖掘') },
    { key: 'sop', label: text(locale, 'SOP', 'SOP 管理') }
  ];
}

interface KnowledgeInventoryProps {
  documents: KnowledgeDocument[];
  highlightedChunkId: string;
  initialSelectedDocId?: string | null;
  locale: Locale;
  onQueueReindex: (doc: KnowledgeDocument) => void;
}

function KnowledgeInventory({
  documents,
  highlightedChunkId,
  initialSelectedDocId,
  locale,
  onQueueReindex
}: KnowledgeInventoryProps) {
  // Seed docs + adopted FAQ docs, with persisted index-status overrides applied at mount.
  const [indexStatusById, setIndexStatusById] = useState<Record<string, KnowledgeDocument['indexStatus']>>(() =>
    readIndexStatusOverrides()
  );
  const [citationReviewById, setCitationReviewById] = useState<Record<string, boolean>>(() =>
    readCitationReviewFlags()
  );
  const baseDocuments = useMemo(() => applyKnowledgeState(documents), [documents]);
  const allDocuments = baseDocuments.map((doc) => ({
    ...doc,
    indexStatus: indexStatusById[doc.id] ?? doc.indexStatus
  }));

  const initialDoc = allDocuments.find((doc) => doc.id === initialSelectedDocId);
  // Fall back to the document that owns the cross-view highlighted chunk so the
  // evidence panel keeps showing the citation the reviewer came from.
  const highlightedDoc = allDocuments.find((doc) => doc.chunks.some((chunk) => chunk.id === highlightedChunkId));
  const [selectedDocId, setSelectedDocId] = useState(
    initialDoc?.id ?? highlightedDoc?.id ?? allDocuments[0]?.id ?? ''
  );
  // Cross-view CTA targets (e.g. dashboard "Review KB record") land with the drawer already open.
  const [recordOpen, setRecordOpen] = useState(Boolean(initialDoc));
  const [policyOpen, setPolicyOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [chunkSpotlight, setChunkSpotlight] = useState(false);
  const chunkSectionRef = useRef<HTMLDivElement>(null);
  const indexedCount = allDocuments.filter((doc) => doc.indexStatus === 'Indexed').length;
  const reindexCount = allDocuments.filter((doc) => doc.indexStatus === 'Needs re-index').length;
  const queuedCount = allDocuments.filter((doc) => doc.indexStatus === 'Index queued').length;
  const chunkCount = allDocuments.flatMap((doc) => doc.chunks).length;
  const selectedDoc = allDocuments.find((doc) => doc.id === selectedDocId) ?? allDocuments[0];
  const isCitationReviewRequested = selectedDoc ? Boolean(citationReviewById[selectedDoc.id]) : false;

  function openRecord(docId: string) {
    if (docId !== selectedDocId) {
      // Drop the previous record's inline action message when switching documents.
      setActionMessage('');
      setChunkSpotlight(false);
    }
    setSelectedDocId(docId);
    setRecordOpen(true);
  }

  function closeRecord() {
    setRecordOpen(false);
    setActionMessage('');
    setChunkSpotlight(false);
  }

  function queueReindex(doc: KnowledgeDocument) {
    if (doc.indexStatus !== 'Needs re-index') {
      return;
    }
    setIndexStatusById((current) => {
      const next = { ...current, [doc.id]: 'Index queued' as const };
      persistIndexStatusOverrides(next);
      return next;
    });
    setActionMessage(text(locale, 'Index job queued for this record.', '此知識紀錄已排入重建索引。'));
    onQueueReindex(doc);
  }

  function toggleCitationReview(doc: KnowledgeDocument) {
    setCitationReviewById((current) => {
      const requested = !current[doc.id];
      const next = { ...current, [doc.id]: requested };
      persistCitationReviewFlags(next);
      setActionMessage(
        requested
          ? text(locale, 'Citation scope review requested for Knowledge Owner.', '已向 Knowledge Owner 送出引用範圍審查。')
          : text(locale, 'Citation scope review request cancelled.', '已取消引用範圍審查。')
      );
      return next;
    });
  }

  function openChunks() {
    // Spotlights the chunk-evidence block inside the drawer instead of jumping to another panel.
    setChunkSpotlight(true);
    setActionMessage(
      text(locale, 'Chunk evidence below is highlighted for this document.', '下方已高亮此文件的 chunk 證據。')
    );
    requestAnimationFrame(() => {
      chunkSectionRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    });
  }

  return (
    <section className="screen-grid">
      <div className="panel span-3">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Knowledge', '知識治理')}</p>
            <h3>
              {text(
                locale,
                'FAQ, SOP, and RAG source inventory',
                'FAQ、SOP 與 RAG 來源清冊'
              )}
            </h3>
          </div>
          <span className="count-pill">{text(locale, 'Active KB snapshot', '目前知識庫版本')}</span>
        </div>
        <div className="metric-grid rag-metric-grid">
          <div className="metric-tile">
            <span>{text(locale, 'Indexed Docs', '已索引文件')}</span>
            <strong>{indexedCount}</strong>
          </div>
          <div className="metric-tile" data-testid="reindex-count-tile">
            <span>{text(locale, 'Needs Re-index', '需重建索引')}</span>
            <strong>{reindexCount}</strong>
          </div>
          <div className="metric-tile" data-testid="index-queued-tile">
            <span>{text(locale, 'Index Queued', '已排入索引')}</span>
            <strong>{queuedCount}</strong>
          </div>
          <div className="metric-tile">
            <span>{text(locale, 'Chunks', 'Chunks 總數')}</span>
            <strong>{chunkCount}</strong>
          </div>
        </div>
      </div>

      <div className="panel span-3">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Knowledge table', '知識表格')}</p>
            <h3>{text(locale, 'Source status, query volume, and index action', '來源狀態、查詢量與索引操作')}</h3>
          </div>
          <button
            className="secondary-action compact-action"
            data-testid="retrieval-policy-button"
            onClick={() => setPolicyOpen(true)}
            type="button"
          >
            {text(locale, 'Retrieval policy', '檢索政策')}
          </button>
        </div>
        <div className="data-table">
          <div className="table-row table-head knowledge-row">
            <span>ID</span>
            <span>{text(locale, 'Title', '標題')}</span>
            <span>{text(locale, 'Category', '分類')}</span>
            <span>{text(locale, 'Tags', '標籤')}</span>
            <span>{text(locale, 'Queries', '查詢')}</span>
            <span>{text(locale, 'Status', '狀態')}</span>
            <span>{text(locale, 'Index', '索引')}</span>
            <span>{text(locale, 'Action', '操作')}</span>
          </div>
          {allDocuments.map((doc) => (
            <div
              className={
                recordOpen && doc.id === selectedDoc?.id
                  ? 'table-row knowledge-row row-clickable selected'
                  : 'table-row knowledge-row row-clickable'
              }
              data-testid={`knowledge-row-${doc.id}`}
              key={doc.id}
              onClick={() => openRecord(doc.id)}
            >
              <span data-label="ID">{shortDocId(doc.id)}</span>
              <span data-label={text(locale, 'Title', '標題')}>{formatDisplayText(locale, doc.title)}</span>
              <span data-label={text(locale, 'Category', '分類')}>{formatProduct(locale, doc.productScope)}</span>
              <span data-label={text(locale, 'Tags', '標籤')} className="tag-list">
                <small>{doc.regionScope}</small>
                <small>{formatDisplayText(locale, doc.riskClass)}</small>
              </span>
              <span data-label={text(locale, 'Queries', '查詢')}>{doc.citationUsage}</span>
              <span data-label={text(locale, 'Status', '狀態')}>{formatDisplayText(locale, doc.status)}</span>
              <span data-label={text(locale, 'Index', '索引')}>{formatDisplayText(locale, doc.indexStatus)}</span>
              <span data-label={text(locale, 'Action', '操作')} className="table-action-cell">
                {doc.indexStatus === 'Needs re-index' && (
                  <button
                    aria-label={text(locale, `Re-index ${doc.title}`, `重建 ${doc.title} 索引`)}
                    className="table-action"
                    onClick={(event: MouseEvent<HTMLButtonElement>) => {
                      // Queue from the row without opening the record drawer.
                      event.stopPropagation();
                      queueReindex(doc);
                    }}
                    type="button"
                  >
                    {text(locale, 'Re-index', '重建索引')}
                  </button>
                )}
                <button
                  aria-label={text(locale, `Open record ${doc.title}`, `開啟 ${doc.title} 紀錄`)}
                  className="table-action"
                  onClick={() => openRecord(doc.id)}
                  type="button"
                >
                  {text(locale, 'Open record', '開啟紀錄')}
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>

      <Drawer
        eyebrow={text(locale, 'Knowledge record', '知識紀錄')}
        footer={
          selectedDoc && (
            <>
              <button className="secondary-action compact-action" onClick={openChunks} type="button">
                {text(locale, 'Open chunks', '檢視 chunks')}
              </button>
              <button
                aria-pressed={isCitationReviewRequested}
                className="secondary-action compact-action"
                onClick={() => toggleCitationReview(selectedDoc)}
                type="button"
              >
                {isCitationReviewRequested
                  ? text(locale, 'Cancel citation review', '取消引用審查')
                  : text(locale, 'Review citation scope', '審查引用範圍')}
              </button>
              {selectedDoc.indexStatus === 'Needs re-index' && (
                <button
                  className="primary-action compact-action"
                  onClick={() => queueReindex(selectedDoc)}
                  type="button"
                >
                  {text(locale, 'Queue re-index', '排入重建索引')}
                </button>
              )}
            </>
          )
        }
        locale={locale}
        onClose={closeRecord}
        open={recordOpen && Boolean(selectedDoc)}
        title={selectedDoc ? formatDisplayText(locale, selectedDoc.title) : ''}
      >
        {selectedDoc && (
          <div data-testid="knowledge-record-panel">
            <div className="pill-stack drawer-pill-stack">
              <span className="count-pill" data-testid="record-index-status">
                {formatDisplayText(locale, selectedDoc.indexStatus)}
              </span>
              {isCitationReviewRequested && (
                <span className="risk-pill medium" data-testid="citation-review-pill">
                  {text(locale, 'Citation review requested', '引用審查中')}
                </span>
              )}
            </div>
            <dl className="compact-detail-list">
              <div>
                <dt>{text(locale, 'Owner', '負責單位')}</dt>
                <dd>{formatDisplayText(locale, selectedDoc.owner)}</dd>
              </div>
              <div>
                <dt>{text(locale, 'Language', '語言')}</dt>
                <dd>{selectedDoc.language}</dd>
              </div>
              <div>
                <dt>{text(locale, 'Effective from', '生效日')}</dt>
                <dd>{selectedDoc.effectiveFrom}</dd>
              </div>
              <div>
                <dt>{text(locale, 'Vector index', '向量索引')}</dt>
                <dd>{selectedDoc.vectorIndex}</dd>
              </div>
              <div>
                <dt>{text(locale, 'Retrieval config', '檢索設定')}</dt>
                <dd>{selectedDoc.retrievalConfig}</dd>
              </div>
              <div>
                <dt>{text(locale, 'Last indexed', '最後索引')}</dt>
                <dd>{new Date(selectedDoc.lastIndexedAt).toLocaleString(locale === 'zh-TW' ? 'zh-TW' : 'en-US')}</dd>
              </div>
            </dl>
            {actionMessage && (
              <div className="inline-status" role="status">
                {actionMessage}
              </div>
            )}
            <div className="record-detail-panel">
              <p className="eyebrow">{text(locale, 'Version history', '版本紀錄')}</p>
              <ol className="timeline-list">
                <li>
                  <strong>{formatDisplayText(locale, selectedDoc.status)}</strong>
                  <span>{selectedDoc.effectiveFrom}</span>
                </li>
                <li>
                  <strong>{formatDisplayText(locale, selectedDoc.indexStatus)}</strong>
                  <span>{new Date(selectedDoc.lastIndexedAt).toLocaleString(locale === 'zh-TW' ? 'zh-TW' : 'en-US')}</span>
                </li>
              </ol>
            </div>
            <div className="record-detail-panel" data-testid="chunk-evidence-panel" ref={chunkSectionRef}>
              <p className="eyebrow">{text(locale, 'Citation chunks', '引用 chunks')}</p>
              <h4>{text(locale, 'Chunk evidence', 'Chunk 證據')}</h4>
              <p>
                {text(
                  locale,
                  `Chunks of ${formatDisplayText(locale, selectedDoc.title)}`,
                  `${formatDisplayText(locale, selectedDoc.title)} 的 chunks`
                )}
              </p>
              <div className="chunk-preview-list">
                {selectedDoc.chunks.map((chunk) => (
                  <article
                    className={
                      chunkSpotlight || chunk.id === highlightedChunkId ? 'chunk-preview highlighted' : 'chunk-preview'
                    }
                    key={chunk.id}
                  >
                    <strong>{chunk.id}</strong>
                    <p>{chunk.chunkText}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {policyOpen && (
        <div
          aria-labelledby="retrieval-policy-title"
          aria-modal="true"
          className="modal-backdrop"
          data-testid="retrieval-policy-modal"
          role="dialog"
        >
          <div className="modal-panel retrieval-policy-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{text(locale, 'Retrieval policy', '檢索政策')}</p>
                <h3 id="retrieval-policy-title">{text(locale, 'Grounding controls', 'Grounding 控制項')}</h3>
              </div>
              <button
                aria-label={text(locale, 'Close retrieval policy', '關閉檢索政策')}
                className="icon-button"
                onClick={() => setPolicyOpen(false)}
                type="button"
              >
                <X size={17} aria-hidden="true" />
              </button>
            </div>
            <dl className="detail-list">
              <div>
                <dt>{text(locale, 'Snapshot', '知識庫快照')}</dt>
                <dd>{text(locale, 'Versioned KB state used by eval and release gates.', '評測與發布門檻使用的版本化知識庫狀態。')}</dd>
              </div>
              <div>
                <dt>{text(locale, 'Indexing', '索引')}</dt>
                <dd>{text(locale, 'Published docs must be embedded and searchable.', '已發布文件必須完成 embedding 並可被搜尋。')}</dd>
              </div>
              <div>
                <dt>{text(locale, 'Citation policy', '引用政策')}</dt>
                <dd>{text(locale, 'Only citation-allowed chunks support bot answers.', '只有允許引用的 chunks 可以支撐 Bot 回答。')}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </section>
  );
}

function shortDocId(value: string) {
  return value.replace(/^doc_/, '').replace(/_/g, '-');
}
