/**
 * Thin wrapper over the Telegram WebApp SDK loaded from telegram-web-app.js.
 * In dev (outside Telegram), we synthesise a fake initData so the UI
 * still renders — backend rejects unsigned data so cash actions fail safely.
 */

interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: {
    user?: { id: number; first_name: string; username?: string; photo_url?: string };
    start_param?: string;
  };
  themeParams?: Record<string, string>;
  colorScheme?: 'light' | 'dark';
  expand: () => void;
  ready: () => void;
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    selectionChanged: () => void;
    notificationOccurred: (type: 'success' | 'warning' | 'error') => void;
  };
  openInvoice?: (url: string, callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void) => void;
  openTelegramLink?: (url: string) => void;
  openLink?: (url: string) => void;
  showAlert?: (msg: string) => void;
  showPopup?: (params: { title?: string; message: string; buttons: Array<{ id?: string; type?: string; text: string }> }) => void;
}

export function getTg(): TelegramWebApp | null {
  return (window as any).Telegram?.WebApp ?? null;
}

export function getInitData(): string {
  const tg = getTg();
  if (tg?.initData) return tg.initData;
  // Dev fallback: dummy data so backend in dev mode can return 401 cleanly.
  return new URLSearchParams({
    auth_date: String(Math.floor(Date.now() / 1000)),
    user: JSON.stringify({ id: 0, first_name: 'Dev User', username: 'dev' }),
    hash: '0'.repeat(64),
  }).toString();
}

export function getStartParam(): string | undefined {
  return getTg()?.initDataUnsafe?.start_param;
}

export function haptic(style: 'light' | 'medium' | 'heavy' = 'light'): void {
  getTg()?.HapticFeedback?.impactOccurred(style);
}

export function selectionChanged(): void {
  getTg()?.HapticFeedback?.selectionChanged();
}

export function notify(type: 'success' | 'warning' | 'error'): void {
  getTg()?.HapticFeedback?.notificationOccurred(type);
}

/**
 * Open a payment URL through the Telegram WebApp SDK with the right method:
 *
 * - `t.me/$<slug>` (Stars XTR invoices) → `WebApp.openInvoice` (in-app payment sheet)
 * - any other `t.me/...` link (e.g. CryptoBot deep link) → `WebApp.openTelegramLink`
 * - everything else → external browser
 */
export function openInvoice(
  url: string,
  cb?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void,
): void {
  const tg = getTg();
  const isStarsInvoice = /^https:\/\/t\.me\/\$/.test(url);
  const isTgLink = /^https:\/\/t\.me\//.test(url);
  if (isStarsInvoice && tg?.openInvoice) {
    tg.openInvoice(url, cb);
    return;
  }
  if (isTgLink && tg?.openTelegramLink) {
    tg.openTelegramLink(url);
    return;
  }
  if (tg?.openLink) {
    tg.openLink(url);
    return;
  }
  window.open(url, '_blank');
}

export function showAlert(msg: string): void {
  const tg = getTg();
  if (tg?.showAlert) tg.showAlert(msg);
  else alert(msg);
}
