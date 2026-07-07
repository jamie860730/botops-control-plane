import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OpsLog } from './OpsLog';
import type { AuditEvent } from '../types';

const bilingualEvent: AuditEvent = {
  id: 'audit_new_format',
  eventType: 'live_trace_review',
  actor: 'PM',
  title: 'Reviewed live bot trace for TW KYC rejection',
  detail: 'Opened the already-answered customer interaction with source LINE, risk Identity Verification, region TW.',
  titleZh: '已審查「台灣身分驗證被拒」的 bot 處理紀錄',
  detailZh: '已開啟這筆已回覆的客戶互動：來源 LINE、風險 身分驗證、地區 TW。',
  entityRef: 'scn_kyc_rejected_tw',
  createdAt: '2026-07-01T09:00:00.000Z'
};

// Simulates an event persisted in localStorage before titleZh/detailZh existed.
const legacyEvent: AuditEvent = {
  id: 'audit_legacy_format',
  eventType: 'csv_exported',
  actor: 'PM',
  title: 'Some legacy dynamic title without a translation',
  detail: 'Legacy detail text stored before the bilingual audit format.',
  entityRef: 'legacy_entity',
  createdAt: '2026-07-01T10:30:00.000Z'
};

describe('OpsLog bilingual audit events', () => {
  it('renders the stored zh-TW copy when the event carries it', () => {
    render(<OpsLog events={[bilingualEvent]} locale="zh-TW" />);

    expect(screen.getByText('已審查「台灣身分驗證被拒」的 bot 處理紀錄')).toBeInTheDocument();
    expect(
      screen.getByText('已開啟這筆已回覆的客戶互動：來源 LINE、風險 身分驗證、地區 TW。')
    ).toBeInTheDocument();
  });

  it('falls back to the original English copy for legacy events without crashing', () => {
    render(<OpsLog events={[legacyEvent]} locale="zh-TW" />);

    expect(screen.getByText('Some legacy dynamic title without a translation')).toBeInTheDocument();
    expect(screen.getByText('Legacy detail text stored before the bilingual audit format.')).toBeInTheDocument();
  });

  it('keeps English rendering intact and formats list times without 12-hour AM/PM in zh-TW', () => {
    const { unmount } = render(<OpsLog events={[bilingualEvent]} locale="en" />);
    expect(screen.getByText('Reviewed live bot trace for TW KYC rejection')).toBeInTheDocument();
    unmount();

    render(<OpsLog events={[bilingualEvent]} locale="zh-TW" />);
    const time = document.querySelector('.audit-list time');
    expect(time?.textContent ?? '').not.toMatch(/AM|PM/);
  });
});
