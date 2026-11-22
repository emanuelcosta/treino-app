'use client';
// Liga o Store ao React: carrega do repositório ao abrir e salva a cada mudança.
import { useCallback, useEffect, useState } from 'react';
import { emptyStore, type Store } from './domain/store';
import { repository } from './storage/repository';

export function useStore() {
  const [store, setStore] = useState<Store>(emptyStore);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = repository.load();
    if (saved) setStore(saved);
    setReady(true);
  }, []);

  /** Aplica uma regra pura (s => novo s) e salva. */
  const update = useCallback((fn: (s: Store) => Store) => {
    setStore((prev) => {
      const next = fn(prev);
      repository.save(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    repository.clear();
    setStore(emptyStore);
  }, []);

  return { store, ready, update, reset };
}
