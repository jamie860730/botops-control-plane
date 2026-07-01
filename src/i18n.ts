export type Locale = 'en' | 'zh-TW';

export function text(locale: Locale, en: string, zh: string): string {
  return locale === 'zh-TW' ? zh : en;
}
