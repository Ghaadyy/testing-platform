import { User } from "./User";

export type TokenResponse = {
  token: string;
  user: User;
};
