// Onde os dados ficam guardados. Hoje: localStorage do navegador.
// Para sincronizar na nuvem (v2), crie outro StoreRepository e troque em `repository` abaixo.
import { hydrate, type Store } from '../domain/store';

export interface StoreRepository {
  load(): Store | null;
  save(s: Store): void;
  clear(): void;
}

const KEY = 'treino-app:v1';

export const localStorageRepository: StoreRepository = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? hydrate(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  },
  save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  },
  clear() {
    try { localStorage.removeItem(KEY); } catch {}
  },
};

export const repository: StoreRepository = localStorageRepository;
