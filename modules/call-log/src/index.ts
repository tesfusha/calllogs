export type NativeCallLogEntry = {
  phoneNumber: string;
  name: string | null;
  type: 'INCOMING' | 'OUTGOING' | 'MISSED';
  timestamp: number;
  duration: number;
  sim: string | null;
};

export declare class CallLogModule {
  static hasPermissions(): Promise<boolean>;
  static load(limit: number): Promise<NativeCallLogEntry[]>;
  static lookupName(phoneNumber: string): Promise<string | null>;
}
