'use client';
import { useState } from 'react';
import type { Video } from '@/lib/data';

export default function VideoPlayer({ videos, query }: { videos: Video[]; query: string }) {
  const [playing, setPlaying] = useState<string | null>(null);
  const search = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  return (
    <div className="videos">
      {videos.map((vd) => (
        <div key={vd.id} className="video">
          {playing === vd.id ? (
            <div className="frame">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${vd.id}?autoplay=1&rel=0`}
                title={vd.title}
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <button className="thumb" onClick={() => setPlaying(vd.id)} aria-label={`Assistir: ${vd.title}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://i.ytimg.com/vi/${vd.id}/hqdefault.jpg`} alt="" loading="lazy" />
              <span className="play" aria-hidden="true">▶</span>
            </button>
          )}
          <div className="vtitle">
            <span>{vd.title}</span>
            <a href={`https://www.youtube.com/watch?v=${vd.id}`} target="_blank" rel="noopener noreferrer">Abrir no YouTube</a>
          </div>
        </div>
      ))}
      {videos.length === 0 && <p className="muted small">Ainda sem vídeo direto para este exercício.</p>}
      <a className="searchlink" href={search} target="_blank" rel="noopener noreferrer">
        Buscar mais vídeos no YouTube
      </a>
    </div>
  );
}
