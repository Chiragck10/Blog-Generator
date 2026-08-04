"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, Copy, Check, RotateCcw } from "lucide-react";
import { useGenerate } from "@/lib/useGenerate";
import type { ComposerState } from "@/components/dashboard/Dashboard";

interface InfoExtractorProps {
  composerState: ComposerState | null;
  onBack: () => void;
}

export default function InfoExtractor({ composerState, onBack }: InfoExtractorProps) {
  const [inputText, setInputText] = useState("");
  const [extractedContent, setExtractedContent] = useState("");
  const [copied, setCopied] = useState(false);
  const { generate, isGenerating, error } = useGenerate();

  useEffect(() => {
    if (composerState) {
      setInputText(composerState.prompt);
    }
  }, [composerState]);

  const extractInfo = async () => {
    if (!inputText.trim()) return;

    setExtractedContent("");

    const systemPrompt = `You are an expert information extraction assistant. Your job is to analyze text and extract structured information.

Always respond in the following structured format (use these exact headings):

## Summary
A brief 2-3 sentence overview of what the text is about.

## Key Points
- List the most important points from the text (bullet points)

## People Mentioned
- List any people/names mentioned (or "None identified" if none)

## Organizations
- List any companies, institutions, or organizations (or "None identified" if none)

## Dates & Timeframes
- List any dates, deadlines, or time references (or "None identified" if none)

## Action Items
- List any tasks, to-dos, or action items implied or stated (or "None identified" if none)

## Additional Details
- Any other important details like locations, monetary values, or technical terms

Be thorough and precise. Extract ONLY information that is actually present in the text — do not infer or make up information.`;

    const prompt = `Please extract and organize all important information from the following text:\n\n---\n${inputText}\n---`;

    const result = await generate({ prompt, systemPrompt });
    if (result) {
      setExtractedContent(result.content);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setExtractedContent("");
    setInputText("");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Info Extractor</h1>
            <p className="text-sm text-dark-400">Extract structured information from any text</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="card space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Input Text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste any text here — meeting notes, articles, emails, documents — and AI will extract key information into a structured format."
              className="textarea-field min-h-[280px]"
              rows={10}
            />
          </div>

          <button
            onClick={extractInfo}
            disabled={!inputText.trim() || isGenerating}
            className="btn-primary w-full"
          >
            {isGenerating ? "Extracting with AI..." : "Extract Information"}
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
            <h3 className="text-sm font-medium text-dark-300">Extracted Information</h3>
            {extractedContent && (
              <div className="flex items-center gap-2">
                <button onClick={handleCopy} className="btn-ghost p-2" title="Copy all">
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
                  <span className="w-2 h-2 bg-emerald-400 rounded-full loading-dot"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full loading-dot"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full loading-dot"></span>
                </div>
                <p className="text-sm text-dark-400">AI is analyzing and extracting information...</p>
              </div>
            ) : extractedContent ? (
              <pre className="whitespace-pre-wrap text-sm text-dark-200 font-sans leading-relaxed">
                {extractedContent}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Search className="w-8 h-8 text-dark-600" />
                <p className="text-sm text-dark-500 text-center">
                  Extracted information will appear here.
                  <br />
                  <span className="text-dark-600">
                    Paste text on the left and click Extract.
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
