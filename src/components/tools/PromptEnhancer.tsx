"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Wand2, Copy, Check, RotateCcw } from "lucide-react";
import type { ComposerState } from "@/components/dashboard/Dashboard";

interface PromptEnhancerProps {
  composerState: ComposerState | null;
  onBack: () => void;
}

export default function PromptEnhancer({ composerState, onBack }: PromptEnhancerProps) {
  const [inputPrompt, setInputPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (composerState) {
      setInputPrompt(composerState.prompt);
    }
  }, [composerState]);

  const enhancePrompt = () => {
    if (!inputPrompt.trim()) return;

    setIsEnhancing(true);
    setEnhancedPrompt("");

    setTimeout(() => {
      const original = inputPrompt.trim();

      // Build an enhanced version of the prompt
      const enhanced = `## Enhanced Prompt

### Role & Context
You are an expert assistant specializing in the topic described below. Your responses should be thorough, well-structured, and actionable.

### Task
${original}

### Detailed Instructions
Please follow these guidelines when responding:

1. **Scope & Focus**: Address the core request directly without unnecessary tangents. Stay focused on delivering exactly what is asked for.

2. **Structure**: Organize your response with clear headings, bullet points, or numbered lists where appropriate. Make the content easy to scan and reference.

3. **Depth**: Provide comprehensive coverage of the topic. Include relevant examples, data points, or analogies that strengthen understanding.

4. **Tone**: Maintain a professional yet approachable tone. Avoid jargon unless the audience is technical, and define terms when first introduced.

5. **Actionability**: Where applicable, include concrete next steps, recommendations, or implementation guidance that the reader can act on immediately.

### Output Format
- Start with a brief executive summary (2-3 sentences)
- Use markdown formatting for readability
- Include section headers for distinct topics
- End with key takeaways or next steps

### Constraints
- Keep the response focused and relevant
- Cite reasoning or examples to support claims
- If assumptions are needed, state them clearly
- Avoid generic filler content

---
*Original prompt: "${original.length > 100 ? original.substring(0, 100) + "..." : original}"*
*Enhanced with additional structure, context, and specificity to produce better AI outputs.*`;

      setEnhancedPrompt(enhanced);
      setIsEnhancing(false);
    }, 1800);
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
            <p className="text-sm text-dark-400">Transform rough prompts into effective instructions</p>
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
              placeholder="Enter your rough prompt here. For example: 'write me a marketing plan for a new app' — and we'll enhance it into a detailed, structured prompt that gets better AI results."
              className="textarea-field min-h-[280px]"
              rows={10}
            />
          </div>

          <button
            onClick={enhancePrompt}
            disabled={!inputPrompt.trim() || isEnhancing}
            className="btn-primary w-full"
          >
            {isEnhancing ? "Enhancing..." : "Enhance Prompt"}
          </button>
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

          <div className="flex-1 min-h-[300px] overflow-y-auto">
            {isEnhancing ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-purple-400 rounded-full loading-dot"></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full loading-dot"></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full loading-dot"></span>
                </div>
                <p className="text-sm text-dark-400">Enhancing your prompt...</p>
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
                    We add structure, context, and specificity.
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
