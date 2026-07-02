import type { KnowledgeDocument } from '../types';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import { formatDisplayText, formatProduct } from '../utils/display';

interface KnowledgeBaseProps {
  documents: KnowledgeDocument[];
  highlightedChunkId: string;
  locale: Locale;
}

export function KnowledgeBase({ documents, highlightedChunkId, locale }: KnowledgeBaseProps) {
  const indexedCount = documents.filter((doc) => doc.indexStatus === 'Indexed').length;
  const reindexCount = documents.filter((doc) => doc.indexStatus === 'Needs re-index').length;
  const chunkCount = documents.flatMap((doc) => doc.chunks).length;

  return (
    <section className="screen-grid">
      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'RAG Knowledge Management', 'RAG 知識庫管理')}</p>
            <h3>{text(locale, 'Govern documents, chunks, snapshots, and retrieval config', '管理文件、chunks、snapshot 與 retrieval config')}</h3>
          </div>
          <span className="count-pill">{text(locale, 'Active KB snapshot', '目前知識庫版本')}</span>
        </div>
        <div className="metric-grid rag-metric-grid">
          <div className="metric-tile">
            <span>{text(locale, 'Indexed Docs', '已索引文件')}</span>
            <strong>{indexedCount}</strong>
          </div>
          <div className="metric-tile">
            <span>{text(locale, 'Needs Re-index', '需重建索引')}</span>
            <strong>{reindexCount}</strong>
          </div>
          <div className="metric-tile">
            <span>Chunks</span>
            <strong>{chunkCount}</strong>
          </div>
          <div className="metric-tile">
            <span>Cfg</span>
            <strong>cfg_05</strong>
          </div>
        </div>
      </div>

      <div className="panel">
        <p className="eyebrow">{text(locale, 'Retrieval policy', '檢索政策')}</p>
        <h3>{text(locale, 'Active grounding rules', '目前 grounding 規則')}</h3>
        <dl className="detail-list">
          <div>
            <dt>Snapshot</dt>
            <dd>{text(locale, 'Versioned KB state for evaluation and release gates.', '評測與發布門檻使用的版本化知識庫狀態。')}</dd>
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

      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Document lifecycle', '文件生命週期')}</p>
            <h3>{text(locale, 'Published content must stay indexed before release', '已發布內容必須完成索引後才能支持發布')}</h3>
          </div>
        </div>
        <div className="data-table">
          <div className="table-row table-head knowledge-row">
            <span>{text(locale, 'Title', '標題')}</span>
            <span>{text(locale, 'Region', '區域')}</span>
            <span>{text(locale, 'Product', '產品')}</span>
            <span>{text(locale, 'Status', '狀態')}</span>
            <span>{text(locale, 'Index', '索引')}</span>
            <span>Cfg</span>
          </div>
          {documents.map((doc) => (
            <div className="table-row knowledge-row" key={doc.id}>
              <span>{formatDisplayText(locale, doc.title)}</span>
              <span>{doc.regionScope}</span>
              <span>{formatProduct(locale, doc.productScope)}</span>
              <span>{formatDisplayText(locale, doc.status)}</span>
              <span>{formatDisplayText(locale, doc.indexStatus)}</span>
              <span>{doc.retrievalConfig.replace('retriever_', '')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Citation chunks', '引用 chunks')}</p>
            <h3>{text(locale, 'Evidence available to the bot', 'Bot 可使用的回答證據')}</h3>
          </div>
        </div>
        <div className="chunk-preview-list">
          {documents.flatMap((doc) =>
            doc.chunks.map((chunk) => (
              <article
                className={chunk.id === highlightedChunkId ? 'chunk-preview highlighted' : 'chunk-preview'}
                key={chunk.id}
              >
                <strong>{chunk.id}</strong>
                <p>{chunk.chunkText}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
