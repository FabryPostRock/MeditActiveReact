import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

/*
 * "import type" is TypeScript syntax.
 *
 * It indicates that AppDispatch and RootState are used exclusively during
 * type checking. These imports will be removed from the generated JavaScript
 * code and will not introduce runtime dependencies.
 */

/*
 * useDispatch is a hook provided by React Redux: it is not a built-in React hook.
 *
 * withTypes is a method provided by React Redux, not by TypeScript.
 * It creates a version of useDispatch that is already associated with AppDispatch.
 *
 * This allows components to dispatch actions and thunks while preserving
 * autocomplete and type checking, without repeating AppDispatch on every use.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/*
 * useSelector is also provided by React Redux and is not built into React.
 *
 * withTypes associates RootState with the state parameter received by selectors.
 * TypeScript can therefore automatically recognize the available slices and
 * report attempts to access properties that do not exist.
 *
 * Components should use useAppSelector instead of using useSelector directly,
 * so that typing remains centralized.
 */
export const useAppSelector = useSelector.withTypes<RootState>();
