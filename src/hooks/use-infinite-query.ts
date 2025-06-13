"use client";

import type { PostgrestQueryBuilder } from "@supabase/postgrest-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { useEffect, useMemo, useSyncExternalStore } from "react";

import { createClient } from "~/lib/supabase/client";

const supabase = createClient();

// Extracts the database type from the supabase client. If the supabase client doesn't have a type, it will fallback properly.
type Database = SupabaseClientType extends SupabaseClient<infer U>
  ? IfAny<
    U,
    {
      public: {
        Functions: Record<string, any>;
        Tables: Record<string, any>;
        Views: Record<string, any>;
      };
    },
    U
  >
  : never;

// Change this to the database schema you want to use
type DatabaseSchema = Database["public"];

// Utility type to check if the type is any
type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;

type Listener = () => void;

interface StoreState<TData> {
  count: number;
  data: TData[];
  error: Error | null;
  hasInitialFetch: boolean;
  isFetching: boolean;
  isLoading: boolean;
  isSuccess: boolean;
}

// The following types are used to make the hook type-safe. It extracts the database type from the supabase client.
type SupabaseClientType = typeof supabase;

// A function that modifies the query. Can be used to sort, filter, etc. If .range is used, it will be overwritten.
type SupabaseQueryHandler<T extends SupabaseTableName> = (
  query: SupabaseSelectBuilder<T>,
) => SupabaseSelectBuilder<T>;

type SupabaseSelectBuilder<T extends SupabaseTableName> = ReturnType<
  PostgrestQueryBuilder<
    DatabaseSchema,
    DatabaseSchema["Tables"][T],
    T
  >["select"]
>;

// Extracts the table definition from the database type
type SupabaseTableData<T extends SupabaseTableName> =
  DatabaseSchema["Tables"][T]["Row"];

// Extracts the table names from the database type
type SupabaseTableName = keyof DatabaseSchema["Tables"];

interface UseInfiniteQueryProps<
  T extends SupabaseTableName,
> {
  // The columns to select, defaults to `*`
  columns?: string;
  // The number of items to fetch per page, defaults to `20`
  pageSize?: number;
  // The table name to query
  tableName: T;
  // A function that modifies the query. Can be used to sort, filter, etc. If .range is used, it will be overwritten.
  trailingQuery?: SupabaseQueryHandler<T>;
}

function createStore<
  TData extends SupabaseTableData<T>,
  T extends SupabaseTableName,
>(props: UseInfiniteQueryProps<T>) {
  const { columns = "*", pageSize = 20, tableName, trailingQuery } = props;

  let state: StoreState<TData> = {
    count: 0,
    data: [],
    error: null,
    hasInitialFetch: false,
    isFetching: false,
    isLoading: false,
    isSuccess: false,
  };

  const listeners = new Set<Listener>();

  const notify = () => {
    for (const listener of listeners) listener();
  };

  const setState = (newState: Partial<StoreState<TData>>) => {
    state = { ...state, ...newState };
    notify();
  };

  const fetchPage = async (skip: number) => {
    if (
      state.hasInitialFetch &&
      (state.isFetching || state.count <= state.data.length)
    )
      return;

    setState({ isFetching: true });

    let query = supabase
      .from(tableName)
      .select(columns, {
        count: "exact",
      }) as unknown as SupabaseSelectBuilder<T>;

    if (trailingQuery) {
      query = trailingQuery(query);
    }
    const {
      count,
      data: newData,
      error,
    } = await query.range(skip, skip + pageSize - 1);

    if (error) {
      console.error("An unexpected error occurred:", error);
      setState({ error });
    } else {
      const deduplicatedData = ((newData || []) as TData[]).filter(
        (item) => !state.data.find((old) => (old as any).id === (item as any).id),
      );

      setState({
        count: count || 0,
        data: [...state.data, ...deduplicatedData],
        error: null,
        isSuccess: true,
      });
    }
    setState({ isFetching: false });
  };

  const fetchNextPage = async () => {
    if (state.isFetching) return;
    await fetchPage(state.data.length);
  };

  const initialize = async () => {
    setState({ data: [], isLoading: true, isSuccess: false });
    await fetchNextPage();
    setState({ hasInitialFetch: true, isLoading: false });
  };

  return {
    fetchNextPage,
    getState: () => state,
    initialize,
    subscribe: (listener: Listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

// Empty initial state to avoid hydration errors.
const initialState: StoreState<any> = {
  count: 0,
  data: [],
  error: null,
  hasInitialFetch: false,
  isFetching: false,
  isLoading: false,
  isSuccess: false,
};

function useInfiniteQuery<
  TData extends SupabaseTableData<T>,
  T extends SupabaseTableName = SupabaseTableName,
>(props: UseInfiniteQueryProps<T>) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const store = useMemo(() => {
    return createStore<TData, T>(props);
  }, [props.tableName, props.columns, props.pageSize]);

  const state = useSyncExternalStore(
    store.subscribe,
    () => store.getState(),
    () => initialState as StoreState<TData>,
  );

  useEffect(() => {
    store.initialize();
  }, [store]);

  return {
    count: state.count,
    data: state.data,
    error: state.error,
    fetchNextPage: store.fetchNextPage,
    hasMore: state.count > state.data.length,
    isFetching: state.isFetching,
    isLoading: state.isLoading,
    isSuccess: state.isSuccess,
  };
}

export {
  type SupabaseQueryHandler,
  type SupabaseTableData,
  type SupabaseTableName,
  useInfiniteQuery,
  type UseInfiniteQueryProps,
};
