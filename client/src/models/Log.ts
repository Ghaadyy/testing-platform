export type Log = {
  Test: string;
  Message: string | null;
  Passed: boolean | null;
  Type: LogType;
};

export enum LogType {
  BEFORE_EACH_MESSAGE = 0,
  AFTER_EACH_ASSERT_MESSAGE = 1,
  AFTER_EACH_MESSAGE = 2,
}
