import type { Metadata, Viewport } from 'next';
import Nav from '@/components/Nav';
import OfflineCache from '@/components/OfflineCache';
import './globals.css';

export const metadata: Metadata = {
  title: 'Treino: corrida, força e postura',
  description: 'Rotina diária de corrida, calistenia e postura com vídeos de cada exercício.',
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#2E7D6B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <OfflineCache />
        <main className="wrap">{children}</main>
        <Nav />
      </body>
    </html>
  );
}
