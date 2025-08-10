import type { Dispatch, SetStateAction } from "react";
import { createContext } from "react";

export type UserContextType = [
  boolean,
  Dispatch<SetStateAction<boolean>>,
  boolean,
  Dispatch<SetStateAction<boolean>>
];

export const userContext = createContext<UserContextType | undefined>(
  undefined
);
