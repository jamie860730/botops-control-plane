import { describe, expect, it } from 'vitest';
import {
  formatDisplayText,
  formatRiskTag,
  formatSourceChannel,
  formatTicketId
} from './display';

describe('Traditional Chinese display text', () => {
  it('uses Taiwan-facing labels for source channels and risk tags', () => {
    expect(formatSourceChannel('zh-TW', 'All')).toBe('全部');
    expect(formatSourceChannel('zh-TW', 'Web/App Chat')).toBe('Web/App 對話');
    expect(formatSourceChannel('zh-TW', 'Internal Report')).toBe('內部通報');
    expect(formatRiskTag('zh-TW', 'Missing KB')).toBe('知識缺口');
    expect(formatRiskTag('zh-TW', 'Policy / Compliance')).toBe('政策 / 法遵');
  });

  it('keeps formal ticket and operations terminology localized', () => {
    expect(formatDisplayText('zh-TW', 'Pending review')).toBe('待審查');
    expect(formatDisplayText('zh-TW', 'Security-L2')).toBe('安全二線');
    expect(formatDisplayText('zh-TW', 'Support Ops')).toBe('客服營運');
    expect(formatDisplayText('zh-TW', 'Knowledge Ops')).toBe('知識營運');
  });

  it('localizes gap mining cluster and review terminology', () => {
    expect(formatDisplayText('zh-TW', 'Observing')).toBe('觀察中');
    expect(formatDisplayText('zh-TW', 'Candidate drafted')).toBe('已產候選草稿');
    expect(formatDisplayText('zh-TW', 'Adopted')).toBe('已採納');
    expect(formatDisplayText('zh-TW', 'Not automatable')).toBe('不適合自動化');
    expect(formatDisplayText('zh-TW', 'Transfer delay surge follow-ups')).toBe('轉帳延遲爆量追問');
    expect(formatDisplayText('zh-TW', 'Adopted FAQ candidate into knowledge base')).toBe('已採納 FAQ 候選入庫');
  });

  it('preserves English labels and stable ticket ids when not localized', () => {
    expect(formatSourceChannel('en', 'Internal Report')).toBe('Internal Report');
    expect(formatDisplayText('en', 'Security-L2')).toBe('Security-L2');
    expect(formatTicketId('ticket_sec_20260701_001')).toBe('SEC-20260701-001');
  });
});
