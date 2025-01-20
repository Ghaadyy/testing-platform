export type Assertion = {
  testName: string;
  message: string;
  passed: boolean;
};

export enum LogStatus {
  LOADING = 0,
  FINISHED = 1,
}

export type LogGroup = {
  testName: string;
  status: LogStatus;
  assertions: Assertion[];
};
