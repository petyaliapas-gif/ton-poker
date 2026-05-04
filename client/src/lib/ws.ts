import { getInitData } from './tg';
import type { ServerMsg, ClientMsg } from '@ton-poker/shared';

export type WsEvent = ServerMsg;

const WS_BASE = (() => {
  const env = import.meta.env.VITE_WS_BASE as string | undefined;
  if (env) return env;
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}`;
})();

export class TableSocket {
  private ws: WebSocket | null = null;
  private listeners = new Set<(msg: WsEvent) => void>();
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private closed = false;

  constructor(public readonly tableId: string) {}

  on(fn: (msg: WsEvent) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  connect(): void {
    if (this.closed) return;
    const url = new URL(`${WS_BASE}/ws`);
    url.searchParams.set('tableId', this.tableId);
    url.searchParams.set('initData', getInitData());
    const ws = new WebSocket(url.toString());
    this.ws = ws;
    ws.addEventListener('message', (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as WsEvent;
        for (const l of this.listeners) l(msg);
      } catch {
        // ignore
      }
    });
    ws.addEventListener('close', () => {
      if (this.closed) return;
      this.retryTimer = setTimeout(() => this.connect(), 1500);
    });
  }

  send(msg: ClientMsg): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(msg));
  }

  close(): void {
    this.closed = true;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.ws?.close();
  }
}
