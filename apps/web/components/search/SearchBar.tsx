"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(value);
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center group">
      <Search className="absolute left-3 w-4 h-4 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search specific places or vibes..."
        disabled={isLoading}
        className="w-full h-9 pl-9 pr-4 rounded-md bg-neutral-100/70 border border-transparent focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none text-sm transition-all placeholder:text-neutral-500 disabled:opacity-50"
      />
    </form>
  );
}
