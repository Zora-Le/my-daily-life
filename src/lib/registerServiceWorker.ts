const isAllowedEnvironment = () =>
  process.env.NODE_ENV === 'production' ||
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '[::1]';

export async function registerServiceWorker(): Promise<void> {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !isAllowedEnvironment()
  ) {
    return;
  }

  try {
    await navigator.serviceWorker.register('./sw.js', { scope: './' });
  } catch (error) {
    console.warn('Service Worker 注册失败，应用将继续在线运行。', error);
  }
}
