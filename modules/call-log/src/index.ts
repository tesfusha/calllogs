export type NativeCallLogEntry = {
  phoneNumber: string;
  name: string | null;
  type: 'INCOMING' | 'OUTGOING' | 'MISSED';
  timestamp: number;
  duration: number;
};

export declare class CallLogModule {
  static load(limit: number): Promise<NativeCallLogEntry[]>;
}