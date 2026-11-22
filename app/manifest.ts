import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Treino: corrida, força e postura',
    short_name: 'Treino',
    description: 'Rotina diária de corrida, calistenia e postura com vídeos de cada exercício.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f1b1a',
    theme_color: '#2E7D6B',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
