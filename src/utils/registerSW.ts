/**
 * Registers the MyMed Archive Service Worker with full GitHub Pages BASE_URL support.
 * Works seamlessly on both root ("/") and subpath ("/MyMed-Archive/") deployments.
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    try {
      const rawBase = import.meta.env.BASE_URL || './';
      const normalizedBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
      const swUrl = `${normalizedBase}sw.js`;

      navigator.serviceWorker
        .register(swUrl, { scope: normalizedBase })
        .catch(() => {
          // Silently ignore registration errors in unsupported/sandboxed iframe contexts
        });
    } catch {
      // Ignore unexpected environment restrictions
    }
  });
}
