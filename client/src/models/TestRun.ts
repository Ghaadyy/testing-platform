export type TestRun = {
  id: number;
  ranAt: string;
  compiledCode: string;
  rawCode: string;
  duration: bigint;
  passed: boolean;
};
