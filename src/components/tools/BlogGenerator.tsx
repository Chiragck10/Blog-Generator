"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, FileText, Copy, Check, RotateCcw } from "lucide-react";
import type { ComposerState } from "@/components/dashboard/Dashboard";

interface BlogGeneratorProps {
  composerState: ComposerState | null;
  onBack: () => void;
}

const TONES = [
  "Professional",
  "Casual",
  "Friendly",
  "Formal",
  "Persuasive",
  "Informative",
  "Inspirational",
];

const AUDIENCES = [
  "General",
  "Business Professionals",
  "Developers",
  "Marketing Teams",
  "Students",
  "Executives",
  "Creatives",
];

export default function BlogGenerator({ composerState, onBack }: BlogGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [audience, setAudience] = useState("General");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (composerState) {
      setTopic(composerState.prompt);
      setTone(composerState.tone);
      setAudience(composerState.audience);
    }
  }, [composerState]);

  const generateContent = () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setGeneratedContent("");

    // Simulate AI generation with a realistic blog post
    setTimeout(() => {
      const content = `# ${topic}

## Introduction

In today's rapidly evolving landscape, understanding ${topic.toLowerCase()} has become more critical than ever. This article explores the key aspects, current trends, and practical implications that professionals need to know.

## Key Insights

The landscape of ${topic.toLowerCase()} is shaped by several important factors:

1. **Innovation & Technology** — New advancements are continuously reshaping how we approach this subject. From AI-driven solutions to data-backed strategies, the tools available today are more powerful than ever.

2. **Market Dynamics** — Understanding the current market conditions is essential for making informed decisions. The interplay between supply, demand, and emerging opportunities creates a complex but navigable environment.

3. **Best Practices** — Industry leaders have identified several proven approaches that consistently deliver results. Adopting these practices can significantly improve outcomes.

## Practical Applications

When applying these concepts in real-world scenarios, consider the following approach:

- **Start with research** — Gather data and insights from reliable sources before making decisions.
- **Iterate quickly** — Don't wait for perfection. Test small changes and learn from the results.
- **Measure outcomes** — Track key metrics to understand what's working and what needs adjustment.
- **Stay adaptable** — The landscape changes rapidly, so flexibility is key to long-term success.

## Looking Ahead

As we look to the future, ${topic.toLowerCase()} will continue to evolve. Staying informed, adaptable, and proactive will be the hallmarks of those who thrive in this space.

The most successful professionals will be those who combine deep expertise with a willingness to embrace new approaches and technologies.

## Conclusion

Understanding and leveraging ${topic.toLowerCase()} is not just an advantage — it's becoming a necessity. By staying informed and applying best practices, you can position yourself and your organization for sustained success.

---
*Written with a ${tone.toLowerCase()} tone for ${audience.toLowerCase()}.*`;

      setGeneratedContent(content);
      setIsGenerating(false);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setGeneratedContent("");
    setTopic("");
    setTone("Professional");
    setAudience("General");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Blog Generator</h1>
            <p className="text-sm text-dark-400">Generate comprehensive blog posts</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="card space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Topic / Prompt
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What should the blog post be about?"
              className="textarea-field min-h-[120px]"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="select-field"
              >
                {TONES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="select-field"
              >
                {AUDIENCES.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={generateContent}
            disabled={!topic.trim() || isGenerating}
            className="btn-primary w-full"
          >
            {isGenerating ? "Generating..." : "Generate Blog Post"}
          </button>
        </div>

        {/* Output Panel */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-dark-300">Generated Content</h3>
            {generatedContent && (
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
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-brand-400 rounded-full loading-dot"></span>
                  <span className="w-2 h-2 bg-brand-400 rounded-full loading-dot"></span>
                  <span className="w-2 h-2 bg-brand-400 rounded-full loading-dot"></span>
                </div>
                <p className="text-sm text-dark-400">Generating your blog post...</p>
              </div>
            ) : generatedContent ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-dark-200 font-sans leading-relaxed bg-transparent border-0 p-0">
                  {generatedContent}
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-dark-500">
                  Your generated blog post will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
