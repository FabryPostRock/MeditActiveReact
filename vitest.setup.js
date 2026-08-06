// NOTA : vitest.setup.js viene eseguito prima di ogni file di test, non prima di ogni singolo test.
import { vi, beforeEach } from 'vitest';

// vi.unstubAllGlobals() non ti serve per IntersectionObserver perché quel mock vive solo dentro
// l’ambiente di test di Vitest, non dentro la tua applicazione reale.
const IntersectionObserverMock = vi.fn(
  class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
  },
);

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
