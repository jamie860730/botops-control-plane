import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Drawer } from './Drawer';

function renderDrawer(overrides: Partial<Parameters<typeof Drawer>[0]> = {}) {
  const onClose = vi.fn();
  const view = render(
    <Drawer
      eyebrow="Detail"
      locale="en"
      onClose={onClose}
      open
      title="Scenario detail"
      {...overrides}
    >
      <p>Drawer body content</p>
    </Drawer>
  );
  return { onClose, view };
}

describe('Drawer', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('renders nothing when closed', () => {
    renderDrawer({ open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders eyebrow, title, children, and footer inside a labelled dialog', () => {
    renderDrawer({ footer: <button type="button">Confirm</button> });
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Scenario detail');
    expect(screen.getByText('Detail')).toBeInTheDocument();
    expect(screen.getByText('Drawer body content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('moves focus into the panel and locks body scroll while open', () => {
    const { view } = renderDrawer();
    expect(screen.getByRole('dialog')).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    view.unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('closes via the close button', () => {
    const { onClose } = renderDrawer();
    fireEvent.click(screen.getByRole('button', { name: 'Close panel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses the zh-TW close label', () => {
    renderDrawer({ locale: 'zh-TW' });
    expect(screen.getByRole('button', { name: '關閉面板' })).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    const { onClose } = renderDrawer();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on backdrop click but not on clicks inside the panel', () => {
    const { onClose } = renderDrawer();
    fireEvent.click(screen.getByText('Drawer body content'));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('drawer-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
