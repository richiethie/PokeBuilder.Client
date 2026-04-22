import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { ALL_TYPES } from "@/lib/pokemon";
import type { FilterType } from "@/types";

export function SearchBar() {
  const { searchQuery, setSearchQuery, typeFilter, setTypeFilter } =
    useAppContext();

  const hasFilters = searchQuery !== "" || typeFilter !== "all";

  function clearFilters() {
    setSearchQuery("");
    setTypeFilter("all");
  }

  const selectedTypeLabel =
    typeFilter === "all"
      ? "All Types"
      : `${typeFilter.charAt(0).toUpperCase()}${typeFilter.slice(1)}`;

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Search Pokémon…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Select
        value={typeFilter}
        onValueChange={(val) => setTypeFilter(val as FilterType)}
      >
        <SelectTrigger className="w-32 shrink-0">
          <SelectValue>{selectedTypeLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {ALL_TYPES.map((t) => (
            <SelectItem key={t} value={t} className="capitalize">
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
