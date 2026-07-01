import type { KnowledgeDocument } from '../types';

interface KnowledgeBaseProps {
  documents: KnowledgeDocument[];
  highlightedChunkId: string;
}

export function KnowledgeBase({ documents, highlightedChunkId }: KnowledgeBaseProps) {
  const indexedCount = documents.filter((doc) => doc.indexStatus === 'Indexed').length;
  const reindexCount = documents.filter((doc) => doc.indexStatus === 'Needs re-index').length;
  const chunkCount = documents.flatMap((doc) => doc.chunks).length;

  return (
    <section className="screen-grid">
      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">RAG Knowledge Management</p>
            <h3>Govern documents, chunks, snapshots, and retrieval config</h3>
          </div>
          <span className="count-pill">kb_2026_07_seed</span>
        </div>
        <div className="metric-grid rag-metric-grid">
          <div className="metric-tile">
            <span>Indexed Docs</span>
            <strong>{indexedCount}</strong>
          </div>
          <div className="metric-tile">
            <span>Needs Re-index</span>
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
        <p className="eyebrow">Retrieval controls</p>
        <h3>What this page manages</h3>
        <dl className="detail-list">
          <div>
            <dt>Snapshot</dt>
            <dd>Versioned KB state used by eval and release gates.</dd>
          </div>
          <div>
            <dt>Indexing</dt>
            <dd>Tracks whether published docs are embedded and searchable.</dd>
          </div>
          <div>
            <dt>Citation policy</dt>
            <dd>Only citation-allowed chunks can support bot answers.</dd>
          </div>
        </dl>
      </div>

      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Document lifecycle</p>
            <h3>Published content must stay indexed before release</h3>
          </div>
        </div>
        <div className="data-table">
          <div className="table-row table-head knowledge-row">
            <span>Title</span>
            <span>Region</span>
            <span>Product</span>
            <span>Status</span>
            <span>Index</span>
            <span>Retriever</span>
          </div>
          {documents.map((doc) => (
            <div className="table-row knowledge-row" key={doc.id}>
              <span>{doc.title}</span>
              <span>{doc.regionScope}</span>
              <span>{doc.productScope}</span>
              <span>{doc.status}</span>
              <span>{doc.indexStatus}</span>
              <span>{doc.retrievalConfig.replace('retriever_', '')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Citation chunks</p>
            <h3>Evidence available to the bot</h3>
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
