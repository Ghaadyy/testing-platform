export type TestRun = {
  id: string;
  ranAt: string;
  compiledCode: string;
  rawCode: string;
  duration: bigint;
  passed: boolean;
};
