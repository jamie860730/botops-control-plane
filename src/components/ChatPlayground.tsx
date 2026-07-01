import { BookmarkPlus, ExternalLink } from 'lucide-react';
import type { KnowledgeDocument } from '../types';
import type { InteractionReview } from '../services/seedBackendAdapter';

interface ChatPlaygroundProps {
  documents: KnowledgeDocument[];
  highlightedChunkId: string;
  review: InteractionReview;
  savedEvalCaseId: string | null;
  onHighlightChunk: (chunkId: string) => void;
  onSaveEvalCase: () => void;
}

export function ChatPlayground({
  documents,
  highlightedChunkId,
  review,
  savedEvalCaseId,
  onHighlightChunk,
  onSaveEvalCase
}: ChatPlaygroundProps) {
  const highlightedChunk = documents.flatMap((doc) => doc.chunks).find((chunk) => chunk.id === highlightedChunkId);
  const highlightedDoc = documents.find((doc) => doc.id === highlightedChunk?.documentId);

  return (
    <section className="screen-grid chat-grid">
      <div className="panel" data-testid="live-reply-review">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{review.scenario.sourceChannel} live interaction</p>
            <h3>{review.scenario.title}</h3>
          </div>
          <button className="secondary-action" onClick={onSaveEvalCase} type="button">
            <BookmarkPlus size={15} aria-hidden="true" />
            Save trace as eval case
          </button>
        </div>
        <div className="profile-strip">
          <span>{review.scenario.region}</span>
          <span>{review.scenario.language}</span>
          <span>{review.scenario.product}</span>
          <span>{review.scenario.riskTag}</span>
        </div>
        <div className="conversation">
          {review.messages.map((message) => (
            <article className={`message ${message.role}`} key={message.id}>
              <div className="message-role">{message.role}</div>
              <p>{message.content}</p>
              {message.citationIds.length > 0 && (
                <div className="citation-list">
                  {message.citationIds.map((citationId) => (
                    <button
                      className="citation-button"
                      key={citationId}
                      onClick={() => onHighlightChunk(citationId)}
                      type="button"
                    >
                      <ExternalLink size={13} aria-hidden="true" />
                      Open citation {citationId}
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
        <div className="eval-save-status" data-testid="eval-save-status">
          {savedEvalCaseId ? `Saved ${savedEvalCaseId}` : 'This live interaction has not been saved as an eval case yet.'}
        </div>
      </div>

      <div className="panel" data-testid="trace-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Trace Panel</p>
            <h3>Retained runtime decisions behind the live answer</h3>
          </div>
        </div>
        <div className="trace-list">
          {review.traceEvents.map((event) => (
            <article className={`trace-row ${event.status}`} key={event.id}>
              <div>
                <strong>{event.nodeName}</strong>
                <p>{event.detail}</p>
              </div>
              <span>{event.status}</span>
            </article>
          ))}
        </div>
        <div className="highlighted-citation" data-testid="highlighted-citation">
          <p className="eyebrow">Highlighted citation</p>
          {highlightedChunk && highlightedDoc ? (
            <>
              <strong>{highlightedDoc.title}</strong>
              <p>{highlightedChunk.chunkText}</p>
            </>
          ) : (
            <p>No citation selected.</p>
          )}
        </div>
      </div>
    </section>
  );
}
