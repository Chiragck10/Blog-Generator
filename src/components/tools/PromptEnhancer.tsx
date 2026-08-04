"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Wand2, Copy, Check, RotateCcw } from "lucide-react";
import { useGenerate } from "@/lib/useGenerate";
import type { ComposerState } from "@/components/dashboard/Dashboard";

interface PromptEnhancerProps {
  composerState: ComposerState | null;
  onBack: () => void;
}

export default function PromptEnhancer({ composerState, onBack }: PromptEnhancerProps) {
  const [inputPrompt, setInputPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const { generate, isGenerating, error } = useGenerate();

  useEffect(() => {
    if (composerState) {
      setInputPrompt(composerState.prompt);
    }
  }, [composerState]);

  const enhancePrompt = async () => {
    if (!inputPrompt.trim()) return;

    setEnhancedPrompt("");

    const systemPrompt = `You are a prompt engineering expert. Your task is to take a rough, basic AI prompt and rewrite it into a clear, detailed, and highly effective prompt that will produce much better results from any AI model.

When enhancing a prompt:
1. Preserve the user's original intent completely
2. Add specificity — clarify what exactly is being asked
3. Add context — define the role, background, and constraints
4. Add structure — specify the desired output format
5. Add quality criteria — define what "good" looks like
6. Add guardrails — specify what to avoid

Return ONLY the enhanced prompt (ready to copy-paste into any AI tool). Do not add explanations or meta-commentary about the enhancement. Just output the improved prompt directly.`;

    const prompt = `Please enhance this AI prompt into a more effective version:\n\n"${inputPrompt}"`;

    const result = await generate({ prompt, systemPrompt });
    if (result) {
      setEnhancedPrompt(result.content);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(enhancedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setEnhancedPrompt("");
    setInputPrompt("");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-400/10 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Prompt Enhancer</h1>
            <p className="text-sm text-dark-400">Transform rough prompts into effective AI instructions</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="card space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Your Prompt
            </label>
            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={`Enter your rough prompt here. For example:\n\n"write me a marketing plan for a new app"\n\nAI will enhance it into a detailed, structured prompt that gets much better results.`}
              className="textarea-field min-h-[280px]"
              rows={10}
            />
          </div>

          <button
            onClick={enhancePrompt}
            disabled={!inputPrompt.trim() || isGenerating}
            className="btn-primary w-full"
          >
            {isGenerating ? "Enhancing with AI..." : "Enhance Prompt"}
          </button>

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-dark-300">Enhanced Prompt</h3>
            {enhancedPrompt && (
              <div className="flex items-center gap-2">
                <button onClick={handleCopy} className="btn-ghost p-2" title="Copy">
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={handleReset} className="btn-ghost p-2" title="Reset">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-[300px] max-h-[600px] overflow-y-auto">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-purple-400 rounded-full loading-dot"></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full loading-dot"></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full loading-dot"></span>
                </div>
                <p className="text-sm text-dark-400">AI is enhancing your prompt...</p>
              </div>
            ) : enhancedPrompt ? (
              <pre className="whitespace-pre-wrap text-sm text-dark-200 font-sans leading-relaxed">
                {enhancedPrompt}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Wand2 className="w-8 h-8 text-dark-600" />
                <p className="text-sm text-dark-500 text-center">
                  Your enhanced prompt will appear here.
                  <br />
                  <span className="text-dark-600">
                    AI adds structure, context, and specificity.
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
