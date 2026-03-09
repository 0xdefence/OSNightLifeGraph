"use client";

import { useState } from "react";

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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search venues or describe your night..."
        className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        Search
      </button>
    </form>
  );
}
