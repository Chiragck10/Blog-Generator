"use client";

import { useState } from "react";

interface GenerateOptions {
  prompt: string;
  systemPrompt: string;
  model?: string;
}

interface GenerateResult {
  content: string;
  model?: string;
}

export function useGenerate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (options: GenerateOptions): Promise<GenerateResult | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Generation failed. Please try again.");
        setIsGenerating(false);
        return null;
      }

      setIsGenerating(false);
      return { content: data.content, model: data.model };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error. Please check your connection.";
      setError(message);
      setIsGenerating(false);
      return null;
    }
  };

  return { generate, isGenerating, error, clearError: () => setError(null) };
}
