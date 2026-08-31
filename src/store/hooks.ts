import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

/*
 * "import type" è una sintassi TypeScript.
 *
 * Segnala che AppDispatch e RootState vengono utilizzati esclusivamente
 * durante il controllo dei tipi. Questi import saranno eliminati dal codice
 * JavaScript generato e non produrranno dipendenze a runtime.
 */

/*
 * useDispatch è un hook fornito da React Redux: non è un hook built-in di React.
 *
 * withTypes è un metodo fornito da React Redux e non da TypeScript.
 * Crea una versione di useDispatch già associata ad AppDispatch.
 *
 * In questo modo i componenti possono inviare action e thunk mantenendo
 * l'autocompletamento e il controllo dei tipi, senza ripetere AppDispatch
 * a ogni utilizzo.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/*
 * Anche useSelector è fornito da React Redux e non è built-in di React.
 *
 * withTypes collega RootState al parametro state ricevuto dai selector.
 * TypeScript potrà quindi riconoscere automaticamente gli slice disponibili
 * e segnalare l'accesso a proprietà inesistenti.
 *
 * I componenti dovrebbero usare useAppSelector invece di useSelector
 * direttamente, così la tipizzazione rimane centralizzata.
 */
export const useAppSelector = useSelector.withTypes<RootState>();
