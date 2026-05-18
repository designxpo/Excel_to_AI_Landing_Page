export {};

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set' | 'consent' | 'js',
      targetIdOrEventName: string | Date,
      params?: Record<string, unknown>
    ) => void;
  }
}
