import { BookmarkPlus, ExternalLink } from 'lucide-react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { KnowledgeDocument } from '../types';
import type { InteractionReview } from '../services/seedBackendAdapter';
import {
  formatLanguage,
  formatMessageRole,
  formatProduct,
  formatRiskTag,
  formatScenarioTitle,
  formatSourceChannel,
  formatTraceDetail,
  formatTraceNode,
  formatTraceStatus
} from '../utils/display';

interface ChatPlaygroundProps {
  documents: KnowledgeDocument[];
  highlightedChunkId: string;
  locale: Locale;
  review: InteractionReview;
  savedEvalCaseId: string | null;
  onHighlightChunk: (chunkId: string) => void;
  onSaveEvalCase: () => void;
}

export function ChatPlayground({
  documents,
  highlightedChunkId,
  locale,
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
            <p className="eyebrow">
              {text(
                locale,
                `${review.scenario.sourceChannel} interaction record`,
                `${formatSourceChannel(locale, review.scenario.sourceChannel)} 互動紀錄`
              )}
            </p>
            <h3>{formatScenarioTitle(locale, review.scenario.title)}</h3>
          </div>
          <button className="secondary-action" onClick={onSaveEvalCase} type="button">
            <BookmarkPlus size={15} aria-hidden="true" />
            {text(locale, 'Save trace as eval case', '轉存為評測案例')}
          </button>
        </div>
        <div className="profile-strip">
          <span>
            <small>{text(locale, 'Region', '地區')}</small>
            <strong>{review.scenario.region}</strong>
          </span>
          <span>
            <small>{text(locale, 'Language', '語言')}</small>
            <strong>{formatLanguage(locale, review.scenario.language)}</strong>
          </span>
          <span>
            <small>{text(locale, 'Product', '產品')}</small>
            <strong>{formatProduct(locale, review.scenario.product)}</strong>
          </span>
          <span>
            <small>{text(locale, 'Risk', '風險')}</small>
            <strong>{formatRiskTag(locale, review.scenario.riskTag)}</strong>
          </span>
        </div>
        <div className="conversation">
          {review.messages.map((message) => (
            <article className={`message ${message.role}`} key={message.id}>
              <div className="message-role">{formatMessageRole(locale, message.role)}</div>
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
                      {text(locale, `Open citation ${citationId}`, `檢視引用 ${citationId}`)}
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
        <div className="eval-save-status" data-testid="eval-save-status">
          {savedEvalCaseId
            ? text(locale, `Saved ${savedEvalCaseId}`, `已轉存 ${savedEvalCaseId}`)
            : text(
                locale,
                'This live interaction has not been saved as an eval case yet.',
                '此互動紀錄尚未轉存為評測案例。'
              )}
        </div>
      </div>

      <div className="panel" data-testid="trace-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Response processing log', '回覆處理紀錄')}</p>
            <h3>{text(locale, 'Bot steps used for the delivered answer', '機器人送出回覆時採用的處理步驟')}</h3>
          </div>
        </div>
        <div className="trace-list">
          {review.traceEvents.map((event) => (
            <article className={`trace-row ${event.status}`} key={event.id}>
              <div>
                <strong>{formatTraceNode(locale, event.nodeName)}</strong>
                <p>{formatTraceDetail(locale, event.detail)}</p>
              </div>
              <span>{formatTraceStatus(locale, event.status)}</span>
            </article>
          ))}
        </div>
        <div className="highlighted-citation" data-testid="highlighted-citation">
          <p className="eyebrow">{text(locale, 'Highlighted citation', '目前引用證據')}</p>
          {highlightedChunk && highlightedDoc ? (
            <>
              <strong>{highlightedDoc.title}</strong>
              <p>{highlightedChunk.chunkText}</p>
            </>
          ) : (
            <p>{text(locale, 'No citation selected.', '尚未選擇引用。')}</p>
          )}
        </div>
      </div>
    </section>
  );
}
