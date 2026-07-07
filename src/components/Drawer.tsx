import { X } from 'lucide-react';
import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react';
import type { Locale } from '../i18n';
import { text } from '../i18n';

interface DrawerProps {
  open: boolean;
  locale: Locale;
  title: ReactNode;
  /** Small uppercase label rendered above the title (same pattern as panel eyebrows). */
  eyebrow?: string;
  children: ReactNode;
  /** Optional action bar pinned below the scrollable body. */
  footer?: ReactNode;
  onClose: () => void;
}

/**
 * Shared progressive-disclosure surface: a right-side slide-over on desktop and a
 * full-screen sheet under 760px. Closes on Esc, backdrop click, or the X button;
 * locks body scroll and moves focus into the panel while open.
 */
export function Drawer({ open, locale, title, eyebrow, children, footer, onClose }: DrawerProps) {
  const panelRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      panelRef.current?.focus();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    // Only clicks on the backdrop itself close the drawer; clicks inside the panel bubble up here too.
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="drawer-backdrop" data-testid="drawer-backdrop" onClick={handleBackdropClick}>
      <aside
        aria-labelledby={titleId}
        aria-modal="true"
        className="drawer-panel"
        data-testid="drawer-panel"
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="drawer-header">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h3 id={titleId}>{title}</h3>
          </div>
          <button
            aria-label={text(locale, 'Close panel', '關閉面板')}
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            <X size={17} aria-hidden="true" />
          </button>
        </header>
        <div className="drawer-body">{children}</div>
        {footer && <footer className="drawer-footer">{footer}</footer>}
      </aside>
    </div>
  );
}
