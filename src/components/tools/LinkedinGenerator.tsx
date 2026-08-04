"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Linkedin, Copy, Check, RotateCcw } from "lucide-react";
import { useGenerate } from "@/lib/useGenerate";
import type { ComposerState } from "@/components/dashboard/Dashboard";

interface LinkedinGeneratorProps {
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

export default function LinkedinGenerator({ composerState, onBack }: LinkedinGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [audience, setAudience] = useState("Business Professionals");
  const [generatedContent, setGeneratedContent] = useState("");
  const [copied, setCopied] = useState(false);
  const { generate, isGenerating, error } = useGenerate();

  useEffect(() => {
    if (composerState) {
      setTopic(composerState.prompt);
      setTone(composerState.tone);
      setAudience(composerState.audience);
    }
  }, [composerState]);

  const generateContent = async () => {
    if (!topic.trim()) return;

    setGeneratedContent("");

    const systemPrompt = `You are a LinkedIn content strategist and ghostwriter. Create engaging LinkedIn posts that:
- Hook the reader in the first line
- Use short paragraphs and line breaks for readability
- Include a personal angle or storytelling element
- End with a call-to-action or question to drive engagement
- Add relevant hashtags at the end (3-5 hashtags)
- Keep it between 150-300 words (LinkedIn sweet spot)
- Write in a ${tone.toLowerCase()} tone
- Target ${audience.toLowerCase()}

Do NOT use markdown formatting. Write in plain text with line breaks. Use emojis sparingly if appropriate.`;

    const prompt = `Write an engaging LinkedIn post about: "${topic}"

Requirements:
- Tone: ${tone}
- Target Audience: ${audience}
- Make it thought-provoking and shareable
- Include a strong hook and call-to-action`;

    const result = await generate({ prompt, systemPrompt });
    if (result) {
      setGeneratedContent(result.content);
    }
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
    setAudience("Business Professionals");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-400/10 flex items-center justify-center">
            <Linkedin className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">LinkedIn Generator</h1>
            <p className="text-sm text-dark-400">Create engaging professional posts with AI</p>
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
              placeholder="What should your LinkedIn post be about?"
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
            {isGenerating ? "Generating with AI..." : "Generate LinkedIn Post"}
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
            <h3 className="text-sm font-medium text-dark-300">Generated Post</h3>
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

          <div className="flex-1 min-h-[300px] max-h-[600px] overflow-y-auto">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-sky-400 rounded-full loading-dot"></span>
                  <span className="w-2 h-2 bg-sky-400 rounded-full loading-dot"></span>
                  <span className="w-2 h-2 bg-sky-400 rounded-full loading-dot"></span>
                </div>
                <p className="text-sm text-dark-400">AI is crafting your LinkedIn post...</p>
              </div>
            ) : generatedContent ? (
              <pre className="whitespace-pre-wrap text-sm text-dark-200 font-sans leading-relaxed">
                {generatedContent}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-dark-500">
                  Your AI-generated LinkedIn post will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
