// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { api } from "./Api";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    // other reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
