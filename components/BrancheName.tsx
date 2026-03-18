"use client";

import { useBranches } from "./BranchContext";

interface Props {
  branchId: number | null;
}

export default function BranchName({ branchId }: Props) {
  const { branches, loading, error } = useBranches();

  if (loading) {
    return <span className="text-sm text-stone-400">Loading...</span>;
  }

  if (error) {
    return <span className="text-sm text-rose-600">Error</span>;
  }

  const branch = branches.find((b) => b.id === branchId);

  return (
    <span className="text-sm text-inherit">{branch?.name ?? "No Branch"}</span>
  );
}
