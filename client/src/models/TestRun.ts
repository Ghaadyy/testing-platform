export type TestRun = {
  id: string;
  ranAt: string;
  compiledCode: string;
  rawCode: string;
  duration: bigint;
  status: RunStatus;
};

export enum RunStatus {
  PASSED = 0,
  PENDING = 1,
  FAILED = 2,
}
