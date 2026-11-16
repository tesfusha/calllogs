/**
 * The Phase 2 call record model.
 *
 * Everything downstream (analytics, reports, backup/export) reads this shape,
 * so fields stay primitive and serialisable: no Dates, no class instances.
 * Timestamps are epoch milliseconds, durations are whole seconds.
 */
export type CallDirection = 'incoming' | 'outgoing' | 'missed';

/** Dual-SIM phones report which slot placed/received the call. */
export type SimSlot = 'SIM 1' | 'SIM 2' | null;

export type CallRecord = {
  /**
   * Content-derived (see `makeCallId`), so importing the same file twice
   * never duplicates rows — the store de-duplicates on id.
   */
  id: string;
  number: string;
  name: string | null;
  direction: CallDirection;
  sim: SimSlot;
  /** Epoch milliseconds. */
  timestamp: number;
  /** Whole seconds. Missed calls are 0. */
  duration: number;
  note: string | null;
  tag: string | null;
};
