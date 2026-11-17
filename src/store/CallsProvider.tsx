import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import type { ReactNode } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { readCalls, writeCalls } from '@/lib/storage';
import { readDeviceCallLog, requestCallLogPermissions } from '@/lib/nativeCallLog';
import type { CallRecord } from '@/types/call';

const AUTO_LOAD_KEY = 'callanalyzer.autoLoaded.v1';

/** The only fields a user can edit by hand; everything else comes from import. */
export type CallPatch = Partial<Pick<CallRecord, 'note' | 'tag'>>;

type CallsState = {
  /** False until storage has been read — screens must not render "empty" yet. */
  hydrated: boolean;
  calls: CallRecord[];
};

type CallsAction =
  | { type: 'hydrate'; calls: CallRecord[] }
  | { type: 'add'; calls: CallRecord[] }
  | { type: 'patch'; id: string; patch: CallPatch }
  | { type: 'remove'; id: string }
  | { type: 'clear' }
  | { type: 'syncNames'; names: Map<string, string> };

export type ImportCounts = {
  added: number;
  duplicates: number;
};

type CallsContextValue = {
  hydrated: boolean;
  calls: CallRecord[];
  /** Merge imported records, ignoring ids already present. */
  importCalls: (records: CallRecord[]) => ImportCounts;
  patchCall: (id: string, patch: CallPatch) => void;
  removeCall: (id: string) => void;
  clearCalls: () => void;
  /** Bulk-update names from a `{ number → name }` map (contact sync). */
  syncNames: (names: Map<string, string>) => void;
};

function reducer(state: CallsState, action: CallsAction): CallsState {
  switch (action.type) {
    case 'hydrate':
      return { hydrated: true, calls: action.calls };

    case 'add': {
      const existing = new Set(state.calls.map((call) => call.id));
      const fresh = action.calls.filter((call) => !existing.has(call.id));
      if (fresh.length === 0) return state;
      return { ...state, calls: [...state.calls, ...fresh] };
    }

    case 'patch':
      return {
        ...state,
        calls: state.calls.map((call) =>
          call.id === action.id ? { ...call, ...action.patch } : call,
        ),
      };

    case 'remove':
      return { ...state, calls: state.calls.filter((call) => call.id !== action.id) };

    case 'clear':
      return { ...state, calls: [] };

    case 'syncNames':
      return {
        ...state,
        calls: state.calls.map((call) => {
          const name = action.names.get(call.number);
          if (!name || (call.name ?? '') === name) return call;
          return { ...call, name };
        }),
      };
  }
}

const CallsContext = createContext<CallsContextValue | null>(null);

export function CallsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { hydrated: false, calls: [] });

  const { hydrated, calls } = state;

  // Hydrate once on mount. Nothing renders as "empty" before this resolves,
  // which is what keeps a returning user from seeing their history vanish.
  useEffect(() => {
    let alive = true;
    readCalls().then((stored) => {
      if (alive) dispatch({ type: 'hydrate', calls: stored });
    });
    return () => {
      alive = false;
    };
  }, []);

  // Auto-load the device call log on first launch (native only): request the
  // call-log permission, read the phone's history, and merge it in. Runs once,
  // only when the store is empty, and is never retried (flag persisted).
  useEffect(() => {
    let alive = true;
    if (!hydrated || calls.length > 0) return;

    AsyncStorage.getItem(AUTO_LOAD_KEY)
      .then(async (raw) => {
        if (!alive || raw) return; // already attempted before
        await AsyncStorage.setItem(AUTO_LOAD_KEY, '1').catch(() => {});
        const permission = await requestCallLogPermissions();
        if (!alive || permission === 'denied') return;
        const records = await readDeviceCallLog();
        if (!alive || !records || records.length === 0) return;
        dispatch({ type: 'add', calls: records });
      })
      .catch(() => {
        // Best-effort; never block first render.
      });

    return () => {
      alive = false;
    };
  }, [hydrated, calls.length]);

  // Persist after hydration only — writing first would clobber stored data.
  useEffect(() => {
    if (!hydrated) return;
    void writeCalls(calls);
  }, [hydrated, calls]);

  const importCalls = useCallback(
    (records: CallRecord[]): ImportCounts => {
      const existing = new Set(calls.map((call) => call.id));
      const added = records.filter((record) => !existing.has(record.id));
      dispatch({ type: 'add', calls: records });
      return { added: added.length, duplicates: records.length - added.length };
    },
    [calls],
  );

  const patchCall = useCallback((id: string, patch: CallPatch) => {
    dispatch({ type: 'patch', id, patch });
  }, []);

  const removeCall = useCallback((id: string) => {
    dispatch({ type: 'remove', id });
  }, []);

  const clearCalls = useCallback(() => {
    dispatch({ type: 'clear' });
  }, []);

  const syncNames = useCallback((names: Map<string, string>) => {
    if (names.size === 0) return;
    dispatch({ type: 'syncNames', names });
  }, []);

  const value = useMemo<CallsContextValue>(
    () => ({ hydrated, calls, importCalls, patchCall, removeCall, clearCalls, syncNames }),
    [hydrated, calls, importCalls, patchCall, removeCall, clearCalls, syncNames],
  );

  return <CallsContext.Provider value={value}>{children}</CallsContext.Provider>;
}

export function useCalls(): CallsContextValue {
  const value = useContext(CallsContext);
  if (!value) {
    throw new Error('useCalls must be used within <CallsProvider>.');
  }
  return value;
}
