export type TestRun = {
  id: number;
  name: string;
  ranAt: string;
  compiledCode: string;
  duration: bigint;
  passed: boolean;
};
