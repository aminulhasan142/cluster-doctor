import { useCallback, useEffect, useState } from "react";

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<unknown>(null);

  useEffect(() => {
    if (!url) {
      setIsConnected(false);
      return;
    }

    // Set connected mode automatically for client-side demo
    setIsConnected(true);

    return () => {
      setIsConnected(false);
    };
  }, [url]);

  const connect = useCallback(() => {
    setIsConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  const send = useCallback((_data: unknown) => {
    // client-side echo if needed
  }, []);

  const subscribe = useCallback(
    <T = unknown>(
      callback: (payload: T) => void
    ) => {
      const handler = (event: CustomEvent<T>) => {
        callback(event.detail);
      };

      if (typeof window !== "undefined") {
        window.addEventListener("cdoctor_realtime_event" as any, handler as any);
      }

      return () => {
        if (typeof window !== "undefined") {
          window.removeEventListener("cdoctor_realtime_event" as any, handler as any);
        }
      };
    },
    []
  );

  return {
    isConnected,
    lastMessage,

    connect,
    disconnect,
    send,
    subscribe,
  };
}

export function broadcastSimulatedEvent(payload: unknown) {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("cdoctor_realtime_event", { detail: payload });
    window.dispatchEvent(event);
  }
}