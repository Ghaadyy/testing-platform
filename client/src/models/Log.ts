export type Assertion = {
  id: string;
  testName: string;
  message: string;
  passed: boolean;
};

export enum LogStatus {
  LOADING = 0,
  PASSED = 1,
  FAILED = 2,
}

export type LogGroup = {
  id: string;
  testName: string;
  status: LogStatus;
  assertions: Assertion[];
};
