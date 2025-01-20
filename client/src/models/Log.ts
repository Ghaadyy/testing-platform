export type Assertion = {
  TestName: string;
  Message: string;
  Passed: boolean;
};

export enum LogStatus {
  LOADING = 0,
  FINISHED = 1,
}

export type LogGroup = {
  TestName: string;
  Status: LogStatus;
  Assertions: Assertion[];
};
