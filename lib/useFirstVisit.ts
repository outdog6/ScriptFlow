// lib/useFirstVisit.ts
"use client";
import { useState, useEffect } from "react";

const KEY = "scriptflow-cinematic-visited";

export function useFirstVisit(): boolean {
  const [isFirst, setIsFirst] = useState(true);

  useEffect(() => {
    try {
      const visited = localStorage.getItem(KEY);
      if (visited) {
        setIsFirst(false);
      } else {
        localStorage.setItem(KEY, "1");
      }
    } catch {
      // localStorage unavailable, treat as first visit
    }
  }, []);

  return isFirst;
}
