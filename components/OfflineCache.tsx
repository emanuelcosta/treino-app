'use client';
import { useEffect, useState } from 'react';
import { exercises } from '@/lib/data';

// Registra o service worker (cache do navegador) e avisa quando está sem internet.
export default function OfflineCache() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);

    // Em desenvolvimento (npm run dev) o cache atrapalharia ver as mudanças: só liga no build de produção.
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(async () => {
        const reg = await navigator.serviceWorker.ready;
        const urls = Object.keys(exercises).map((id) => `/exercicios/${id}`);
        reg.active?.postMessage({ type: 'precache', urls });
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  if (!offline) return null;
  return (
    <p className="offline" role="status">
      Sem internet: usando a versão salva no aparelho. Suas marcações continuam sendo gravadas; os vídeos só abrem com internet.
    </p>
  );
}
