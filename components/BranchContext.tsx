"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createClient } from "@/utils/supabase/client";
import { Branch, Prefix } from "@/types";

interface BranchContextType {
  branches: Branch[];
  prefixes: Prefix[];
  loading: boolean;
  error: string | null;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function useBranches() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error("useBranches must be used within a BranchProvider");
  }
  return context;
}

interface BranchProviderProps {
  children: ReactNode;
}

export function BranchProvider({ children }: BranchProviderProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [prefixes, setPrefixes] = useState<Prefix[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Only fetch on client side
    if (typeof window === "undefined") return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both branches and prefixes in parallel
        const [branchesResponse, prefixesResponse] = await Promise.all([
          supabase.from("branches").select("id, name").order("id"),
          supabase.from("prefix").select("id, name").order("id"),
        ]);

        if (branchesResponse.error) {
          setError(branchesResponse.error.message);
        } else {
          setBranches(branchesResponse.data || []);
        }

        if (prefixesResponse.error) {
          setError(prefixesResponse.error.message);
        } else {
          setPrefixes(prefixesResponse.data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  const value: BranchContextType = {
    branches,
    prefixes,
    loading,
    error,
  };

  return (
    <BranchContext.Provider value={value}>{children}</BranchContext.Provider>
  );
}
