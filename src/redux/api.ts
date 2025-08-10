import { createApi } from "@reduxjs/toolkit/query/react";
import axios from "axios";

type Question = {
  _id?: string;
  id?: number;
  step: number;
  level: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
};

// Axios baseQuery for RTK Query
const axiosBaseQuery =
  ({ baseUrl }: { baseUrl: string } = { baseUrl: "" }) =>
  async ({
    url,
    method,
    data,
    params,
  }: {
    url: string;
    method: string;
    data?: any;
    params?: any;
  }) => {
    try {
      const result = await axios({ url: baseUrl + url, method, data, params });
      return { data: result.data };
    } catch (axiosError: any) {
      const err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const api = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({
    baseUrl: "https://mcq-back.onrender.com/AdminAddQuestion/",
  }),
  tagTypes: ["Questions", "Count"],
  endpoints: (build) => ({
    getQuestions: build.query<Question[], { step: number; level: string }>({
      query: ({ step, level }) => ({
        url: "",
        method: "GET",
        params: { step, level },
      }),
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Questions" as const,
                id: _id!,
              })),
              { type: "Questions", id: "LIST" },
            ]
          : [{ type: "Questions", id: "LIST" }],
    }),

    getCount: build.query<number, { step: number; level: string }>({
      query: ({ step, level }) => ({
        url: "count",
        method: "GET",
        params: { step, level },
      }),
      providesTags: (result, error, arg) => [
        { type: "Count", id: `${arg.step}-${arg.level}` },
      ],
      transformResponse: (response: { count: number }) => response.count,
    }),

    addQuestion: build.mutation<Question, Omit<Question, "_id">>({
      query: (body) => ({
        url: "",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "Questions", id: "LIST" }, { type: "Count" }],
    }),

    updateQuestion: build.mutation<
      Question,
      { id: string; data: Omit<Question, "_id"> }
    >({
      query: ({ id, data }) => ({
        url: id,
        method: "PUT",
        data,
      }),
      invalidatesTags: [{ type: "Questions", id: "LIST" }, { type: "Count" }],
    }),

    deleteQuestion: build.mutation<{ message: string }, string>({
      query: (id) => ({
        url: id,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Questions", id: "LIST" }, { type: "Count" }],
    }),
  }),
});

export const {
  useGetQuestionsQuery,
  useGetCountQuery,
  useAddQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} = api;

export type { Question };
