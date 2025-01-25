export type TestRun = {
  id: string;
  ranAt: string;
  compiledCode: string;
  rawCode: string;
  duration: bigint;
  status: LogStatus;
};


export enum LogStatus {
  PASSED = 0,
  PENDING = 1,
  FAILED = 2,
}
