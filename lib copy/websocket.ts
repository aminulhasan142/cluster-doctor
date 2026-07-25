type WebSocketEvent =
  | "open"
  | "close"
  | "error"
  | "message";

type EventHandler = (payload?: unknown) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;

  private url = "";

  private reconnectAttempts = 0;

  private readonly maxReconnectAttempts = 5;

  private listeners = new Map<WebSocketEvent, Set<EventHandler>>();

  constructor() {
    this.listeners.set("open", new Set());
    this.listeners.set("close", new Set());
    this.listeners.set("error", new Set());
    this.listeners.set("message", new Set());
  }

  connect(url: string) {
    this.url = url;

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.emit("open");
    };

    this.socket.onmessage = (event) => {
      let payload: unknown = event.data;

      try {
        payload = JSON.parse(event.data);
      } catch {
        // keep raw string
      }

      this.emit("message", payload);
    };

    this.socket.onerror = (event) => {
      this.emit("error", event);
    };

    this.socket.onclose = () => {
      this.emit("close");
      this.tryReconnect();
    };
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }

  send(data: unknown) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    this.socket.send(JSON.stringify(data));
  }

  on(event: WebSocketEvent, callback: EventHandler) {
    this.listeners.get(event)?.add(callback);
  }

  off(event: WebSocketEvent, callback: EventHandler) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: WebSocketEvent, payload?: unknown) {
    this.listeners.get(event)?.forEach((listener) => {
      listener(payload);
    });
  }

  private tryReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    if (!this.url) {
      return;
    }

    this.reconnectAttempts++;

    setTimeout(() => {
      this.connect(this.url);
    }, 2000);
  }

  get connected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const websocketClient = new WebSocketClient();

export default websocketClient;