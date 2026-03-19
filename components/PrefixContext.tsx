"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Prefix } from "@/types";

interface PrefixContextType {
  prefixes: Prefix[];
  getPrefixName: (prefixId: number | null | undefined) => string | null;
  loading: boolean;
}

const PrefixContext = createContext<PrefixContextType | undefined>(undefined);

// Cache for prefix data
let prefixCache: Prefix[] | null = null;
let prefixCachePromise: Promise<Prefix[]> | null = null;

async function fetchPrefixes(): Promise<Prefix[]> {
  // Return cached data if available
  if (prefixCache) {
    console.log("PrefixCache hit:", prefixCache);
    return prefixCache;
  }

  // Return existing promise if fetch is in progress
  if (prefixCachePromise) {
    console.log("PrefixCache promise hit");
    return prefixCachePromise;
  }

  // Create new fetch promise
  prefixCachePromise = (async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("prefix").select("*");

      console.log(
        "Prefix fetch result - data length:",
        data?.length,
        "error:",
        error,
      );
      console.log("Prefix fetch result - data:", data);

      if (error) {
        console.error("Error fetching prefixes:", error);
        // Return empty array on error (no fallback)
        return [];
      }

      const prefixes = data || [];
      prefixCache = prefixes; // Cache the result
      console.log("PrefixCache set:", prefixes);
      return prefixes;
    } catch (err) {
      console.error("Error fetching prefixes:", err);
      return []; // Return empty array on error
    }
  })();

  return prefixCachePromise;
}

export function PrefixProvider({ children }: { children: React.ReactNode }) {
  const [prefixes, setPrefixes] = useState<Prefix[]>([]);
  const [loading, setLoading] = useState(true);

  useMemo(() => {
    let isMounted = true;

    fetchPrefixes().then((fetchedPrefixes) => {
      if (isMounted) {
        setPrefixes(fetchedPrefixes);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const getPrefixName = (
    prefixId: number | null | undefined,
  ): string | null => {
    if (!prefixId) return null;
    const prefix = prefixes.find((p) => p.id === prefixId);
    return prefix?.name ?? null; // Use name field
  };

  const value = useMemo(
    () => ({
      prefixes,
      getPrefixName,
      loading,
    }),
    [prefixes, loading],
  );

  return (
    <PrefixContext.Provider value={value}>{children}</PrefixContext.Provider>
  );
}

export function usePrefixes() {
  const context = useContext(PrefixContext);
  if (context === undefined) {
    throw new Error("usePrefixes must be used within a PrefixProvider");
  }
  return context;
}
