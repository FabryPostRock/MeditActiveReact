// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  /* ATTENZIONE ALL'ORDINE DEGLI IMPORT*/
  test: {
    // questa riga evita ad esempio che Vite faccia confusione con ad esempio questo :
    // "import { test, expect } from '@playwright/test';" di Playwright che viene interpretato come
    // suffisso '.test' da Vite
    include: ['src/**/*.test.js'],
    environment: 'jsdom',
    // questo file mocka la clsse IntersectionObserver che è un'API del browser e in jsdom non esiste.
    setupFiles: ['./vitest.setup.js'],
    // serve a ripristinare i global stub tra i test.
    //unstubGlobals: true,
    // clearMocks: true equivale a chiamare vi.clearAllMocks() prima di ogni test
    clearMocks: true,
    // mockReset: true equivale a chiamare vi.resetAllMocks() prima di ogni test
    mockReset: true,
  },
});
