"use client";

import { Person, Relationship } from "@/types";
import { useDashboard } from "./DashboardContext";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronRight, Loader2, User, Users } from "lucide-react";
import Link from "next/link";

interface LineageNode {
  person: Person;
  level: number; // 0 = selected person, 1 = parents, 2 = grandparents, etc.
  relationship: "parent" | "grandparent" | "great_grandparent";
  path: string[]; // chain of relationship IDs
}

interface LineageTreeProps {
  selectedPersonId: string;
}

export default function LineageTree({ selectedPersonId }: LineageTreeProps) {
  const { setMemberModalId } = useDashboard();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [persons, setPersons] = useState<Map<string, Person>>(new Map());
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [personsResponse, relationshipsResponse] = await Promise.all([
          supabase.from("persons").select("*"),
          supabase.from("relationships").select("*"),
        ]);

        if (personsResponse.error) {
          setError(personsResponse.error.message);
          return;
        }

        if (relationshipsResponse.error) {
          setError(relationshipsResponse.error.message);
          return;
        }

        const personsMap = new Map<string, Person>();
        (personsResponse.data || []).forEach((person) => {
          personsMap.set(person.id, person);
        });

        setPersons(personsMap);
        setRelationships(relationshipsResponse.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  // Build lineage tree
  const lineageTree = useMemo(() => {
    if (!persons.size || !relationships.length) return [];

    const selectedPerson = persons.get(selectedPersonId);
    if (!selectedPerson) return [];

    const tree: LineageNode[] = [];
    const visited = new Set<string>();

    const findAncestors = (
      personId: string,
      level: number,
      path: string[] = [],
      relationship: "parent" | "grandparent" | "great_grandparent" = "parent",
    ) => {
      // Safety limit to prevent infinite loops (50 generations should be more than enough)
      if (level >= 50 || visited.has(personId)) return;
      visited.add(personId);

      // Find parents of this person
      const parentRelationships = relationships.filter(
        (rel) =>
          rel.person_b === personId &&
          (rel.type === "biological_child" || rel.type === "adopted_child"),
      );

      parentRelationships.forEach((rel) => {
        const parent = persons.get(rel.person_a);
        if (parent) {
          const newPath = [...path, rel.id];
          const node: LineageNode = {
            person: parent,
            level,
            relationship,
            path: newPath,
          };
          tree.push(node);

          // Find grandparents
          const grandparentRelationship =
            level === 0 ? "grandparent" : "great_grandparent";
          findAncestors(parent.id, level + 1, newPath, grandparentRelationship);
        }
      });
    };

    // Start with selected person's parents
    findAncestors(selectedPersonId, 0);

    // Sort by level and then by birth year
    return tree.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return (a.person.birth_year || 0) - (b.person.birth_year || 0);
    });
  }, [persons, relationships, selectedPersonId]);

  // Group by level
  const groupedByLevel = useMemo(() => {
    const groups: Record<number, LineageNode[]> = {};
    lineageTree.forEach((node) => {
      if (!groups[node.level]) groups[node.level] = [];
      groups[node.level].push(node);
    });
    return groups;
  }, [lineageTree]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getRelationshipLabel = (relationship: string) => {
    switch (relationship) {
      case "parent":
        return "Cha/Mẹ";
      case "grandparent":
        return "Ông/Bà";
      case "great_grandparent":
        return "Cụ/Kỵ";
      default:
        return "Tổ tiên";
    }
  };

  const getDetailedRelationshipLabel = (level: number) => {
    switch (level) {
      case 0:
        return "Cha/Mẹ";
      case 1:
        return "Ông/Bà";
      case 2:
        return "Cụ/Kỵ";
      case 3:
        return "Sơ kỵ";
      case 4:
        return "Cao kỵ";
      case 5:
        return "Tổ tiên thứ 6";
      case 6:
        return "Tổ tiên thứ 7";
      case 7:
        return "Tổ tiên thứ 8";
      case 8:
        return "Tổ tiên thứ 9";
      case 9:
        return "Tổ tiên thứ 10";
      default: {
        if (level < 50) {
          return `Tổ tiên đời thứ ${level + 1}`;
        }
        return `Tổ tiên xa xưa (đời thứ ${level + 1})`;
      }
    }
  };

  const getGenerationLabel = (level: number) => {
    switch (level) {
      case 0:
        return "Thế hệ cha mẹ";
      case 1:
        return "Thế hệ ông bà";
      case 2:
        return "Thế hệ cụ kỵ";
      case 3:
        return "Thế hệ sơ kỵ";
      case 4:
        return "Thế hệ cao kỵ";
      case 5:
        return "Thế hệ tổ tiên thứ 6";
      case 6:
        return "Thế hệ tổ tiên thứ 7";
      case 7:
        return "Thế hệ tổ tiên thứ 8";
      case 8:
        return "Thế hệ tổ tiên thứ 9";
      case 9:
        return "Thế hệ tổ tiên thứ 10";
      default: {
        if (level < 50) {
          return `Thế hệ tổ tiên thứ ${level + 1}`;
        }
        return `Thế hệ xa xưa (đời thứ ${level + 1})`;
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-amber-600" />
        <span className="ml-2 text-stone-600">Đang truy vết tổ tiên...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Lỗi: {error}</p>
      </div>
    );
  }

  if (lineageTree.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="size-12 text-stone-300 mx-auto mb-4" />
        <p className="text-stone-500">Không tìm thấy thông tin tổ tiên</p>
        <p className="text-sm text-stone-400 mt-2">
          Người này có thể là thế hệ đầu tiên trong gia phả
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">
          Cây Phả Hệ Ngược
        </h2>
        <p className="text-stone-600">
          Truy vết tổ tiên ngược về các thế hệ trước
        </p>
      </div>

      {Object.entries(groupedByLevel).map(([level, nodes]) => (
        <div key={level} className="space-y-4">
          <div className="flex items-center gap-2 text-stone-700 font-semibold">
            <ChevronDown className="size-4" />
            <span>{getGenerationLabel(Number(level))}</span>
            <span className="text-sm text-stone-500">
              ({nodes.length} người)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes.map((node) => (
              <div
                key={node.person.id}
                className="bg-white/80 p-4 rounded-xl border border-stone-200/60 hover:border-amber-300 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <button
                      onClick={() => setMemberModalId(node.person.id)}
                      className="text-left hover:text-amber-700 transition-colors"
                    >
                      <h3 className="font-bold text-stone-900 mb-1">
                        {node.person.full_name}
                      </h3>
                    </button>
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-medium">
                        {getDetailedRelationshipLabel(node.level)}
                      </span>
                      {node.person.birth_year && (
                        <span>Sinh {node.person.birth_year}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleNode(node.person.id)}
                    className="p-1 hover:bg-stone-100 rounded-md transition-colors"
                  >
                    {expandedNodes.has(node.person.id) ? (
                      <ChevronDown className="size-4 text-stone-500" />
                    ) : (
                      <ChevronRight className="size-4 text-stone-500" />
                    )}
                  </button>
                </div>

                {expandedNodes.has(node.person.id) && (
                  <div className="border-t border-stone-200 pt-3 mt-3 space-y-2">
                    <div className="text-sm text-stone-600">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="size-4" />
                        <span className="font-medium">Thông tin chi tiết:</span>
                      </div>
                      <div className="space-y-1 ml-6">
                        {node.person.gender && (
                          <div>
                            Giới tính:{" "}
                            {node.person.gender === "male" ? "Nam" : "Nữ"}
                          </div>
                        )}
                        {node.person.birth_year && (
                          <div>
                            Năm sinh: {node.person.birth_year}
                            {node.person.birth_month &&
                              `/ ${node.person.birth_month}`}
                            {node.person.birth_day &&
                              `/ ${node.person.birth_day}`}
                          </div>
                        )}
                        {node.person.death_year && (
                          <div>
                            Năm mất: {node.person.death_year}
                            {node.person.death_month &&
                              `/ ${node.person.death_month}`}
                            {node.person.death_day &&
                              `/ ${node.person.death_day}`}
                          </div>
                        )}
                        {node.person.is_deceased && (
                          <div className="text-rose-600 font-medium">
                            Đã mất
                          </div>
                        )}
                        {node.person.generation && (
                          <div>Thế hệ thứ: {node.person.generation}</div>
                        )}
                        {node.person.note && (
                          <div className="italic">
                            Ghi chú: {node.person.note}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setMemberModalId(node.person.id)}
                        className="px-3 py-1 bg-amber-500 text-white text-sm rounded-md hover:bg-amber-600 transition-colors"
                      >
                        Xem chi tiết
                      </button>
                      <Link
                        href={`/dashboard/members/${node.person.id}`}
                        className="px-3 py-1 bg-stone-200 text-stone-700 text-sm rounded-md hover:bg-stone-300 transition-colors"
                      >
                        Trang cá nhân
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
