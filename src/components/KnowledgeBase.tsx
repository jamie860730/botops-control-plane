import type { KnowledgeDocument } from '../types';

interface KnowledgeBaseProps {
  documents: KnowledgeDocument[];
  highlightedChunkId: string;
}

export function KnowledgeBase({ documents, highlightedChunkId }: KnowledgeBaseProps) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Knowledge Metadata</p>
          <h3>Policy retrieval starts with governed metadata</h3>
        </div>
      </div>
      <div className="data-table">
        <div className="table-row table-head">
          <span>Title</span>
          <span>Region</span>
          <span>Product</span>
          <span>Risk</span>
          <span>Status</span>
        </div>
        {documents.map((doc) => (
          <div className="table-row" key={doc.id}>
            <span>{doc.title}</span>
            <span>{doc.regionScope}</span>
            <span>{doc.productScope}</span>
            <span>{doc.riskClass}</span>
            <span>{doc.status}</span>
          </div>
        ))}
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
    </section>
  );
}
