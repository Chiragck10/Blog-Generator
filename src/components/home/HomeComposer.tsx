"use client";

import React, { useState } from "react";
import {
  Sparkles,
  FileText,
  Linkedin,
  Search,
  Wand2,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import type { PageView, ComposerState } from "@/components/dashboard/Dashboard";

interface HomeComposerProps {
  onNavigate: (tool: PageView, state?: ComposerState) => void;
}

const TOOLS = [
  {
    id: "blog-generator" as PageView,
    name: "Blog Post",
    description: "Generate full blog articles",
    icon: FileText,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20",
  },
  {
    id: "linkedin-generator" as PageView,
    name: "LinkedIn Post",
    description: "Craft professional posts",
    icon: Linkedin,
    color: "text-sky-400",
    bgColor: "bg-sky-400/10",
    borderColor: "border-sky-400/20",
  },
  {
    id: "info-extractor" as PageView,
    name: "Info Extractor",
    description: "Extract key information",
    icon: Search,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20",
  },
  {
    id: "prompt-enhancer" as PageView,
    name: "Prompt Enhancer",
    description: "Improve your AI prompts",
    icon: Wand2,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/20",
  },
];

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

export default function HomeComposer({ onNavigate }: HomeComposerProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedTool, setSelectedTool] = useState<PageView>("blog-generator");
  const [tone, setTone] = useState("Professional");
  const [audience, setAudience] = useState("General");
  const [showOptions, setShowOptions] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    const state: ComposerState = {
      prompt: prompt.trim(),
      tone,
      audience,
    };

    onNavigate(selectedTool, state);
  };

  const selectedToolData = TOOLS.find((t) => t.id === selectedTool);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600/10 border border-brand-500/20 mb-4">
            <Sparkles className="w-6 h-6 text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            What would you like to create?
          </h1>
          <p className="text-dark-400 text-lg">
            Describe your content and we&apos;ll help you bring it to life
          </p>
        </div>

        {/* Composer Card */}
        <div className="card space-y-5">
          {/* Main Prompt Input */}
          <div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Write a blog post about the future of AI in healthcare, focusing on practical applications..."
              className="textarea-field min-h-[120px]"
              rows={4}
            />
          </div>

          {/* Tool Selector */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-3">
              Content Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                const isSelected = selectedTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? `${tool.bgColor} ${tool.borderColor} ${tool.color}`
                        : "border-dark-700 hover:border-dark-600 text-dark-400 hover:text-dark-200"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium text-center">{tool.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options Toggle */}
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-2 text-sm text-dark-400 hover:text-dark-200 transition-colors"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showOptions ? "rotate-180" : ""}`}
            />
            <span>Advanced Options</span>
          </button>

          {/* Advanced Options */}
          {showOptions && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="select-field"
                >
                  {TONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Target Audience
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="select-field"
                >
                  {AUDIENCES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-sm text-dark-500">
              {selectedToolData && (
                <>
                  <selectedToolData.icon className={`w-4 h-4 ${selectedToolData.color}`} />
                  <span>Using {selectedToolData.name}</span>
                </>
              )}
            </div>
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className="btn-primary flex items-center gap-2"
            >
              <span>Generate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="mt-8">
          <p className="text-sm text-dark-500 mb-4 text-center">Or jump directly into a tool</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => onNavigate(tool.id)}
                  className="card-hover flex flex-col items-center gap-3 p-5 text-center group"
                >
                  <div className={`w-10 h-10 rounded-lg ${tool.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${tool.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark-200">{tool.name}</p>
                    <p className="text-xs text-dark-500 mt-0.5">{tool.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
