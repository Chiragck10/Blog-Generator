"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, Copy, Check, RotateCcw } from "lucide-react";
import type { ComposerState } from "@/components/dashboard/Dashboard";

interface InfoExtractorProps {
  composerState: ComposerState | null;
  onBack: () => void;
}

interface ExtractedInfo {
  keyPoints: string[];
  people: string[];
  organizations: string[];
  dates: string[];
  actionItems: string[];
  summary: string;
}

export default function InfoExtractor({ composerState, onBack }: InfoExtractorProps) {
  const [inputText, setInputText] = useState("");
  const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (composerState) {
      setInputText(composerState.prompt);
    }
  }, [composerState]);

  const extractInfo = () => {
    if (!inputText.trim()) return;

    setIsExtracting(true);
    setExtractedInfo(null);

    setTimeout(() => {
      // Simulate extraction by analyzing the input text
      const words = inputText.split(/\s+/);
      const sentences = inputText.split(/[.!?]+/).filter((s) => s.trim().length > 0);

      // Extract potential names (capitalized words not at start of sentences)
      const namePattern = /(?:Mr\.|Mrs\.|Dr\.|Prof\.)?\s*[A-Z][a-z]+(?:\s[A-Z][a-z]+)+/g;
      const people = [...new Set(inputText.match(namePattern) || [])].slice(0, 5);

      // Extract potential organizations
      const orgPatterns = /(?:[A-Z][a-z]*(?:\s[A-Z][a-z]*)*(?:\s(?:Inc|Corp|LLC|Ltd|Co|Group|Foundation|Institute|University|Association)))|(?:[A-Z]{2,})/g;
      const organizations = [...new Set(inputText.match(orgPatterns) || [])].slice(0, 5);

      // Extract dates
      const datePattern = /(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(?:(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,?\s+\d{4})?)|(?:\d{4})/g;
      const dates = [...new Set(inputText.match(datePattern) || [])].slice(0, 5);

      // Generate key points from sentences
      const keyPoints = sentences
        .filter((s) => s.trim().length > 20)
        .slice(0, 5)
        .map((s) => s.trim());

      // Generate action items (sentences with action verbs)
      const actionVerbs = ["need to", "should", "must", "will", "plan to", "want to", "going to", "required", "deadline", "complete", "deliver", "submit"];
      const actionItems = sentences
        .filter((s) => actionVerbs.some((v) => s.toLowerCase().includes(v)))
        .slice(0, 4)
        .map((s) => s.trim());

      // Generate summary
      const summary = sentences.length > 2
        ? `This text contains ${words.length} words across ${sentences.length} sentences. It discusses ${keyPoints.length > 0 ? keyPoints[0].substring(0, 50).toLowerCase() : "various topics"}${people.length > 0 ? `, mentioning ${people.length} individual(s)` : ""}${dates.length > 0 ? ` with ${dates.length} date reference(s)` : ""}.`
        : "The provided text is too short for comprehensive extraction. Please provide more content for better results.";

      setExtractedInfo({
        keyPoints: keyPoints.length > 0 ? keyPoints : ["No distinct key points identified. Try providing longer content."],
        people: people.length > 0 ? people : ["No names detected"],
        organizations: organizations.length > 0 ? organizations : ["No organizations detected"],
        dates: dates.length > 0 ? dates : ["No dates detected"],
        actionItems: actionItems.length > 0 ? actionItems : ["No action items identified"],
        summary,
      });
      setIsExtracting(false);
    }, 2000);
  };

  const handleCopy = () => {
    if (!extractedInfo) return;
    const text = `SUMMARY:\n${extractedInfo.summary}\n\nKEY POINTS:\n${extractedInfo.keyPoints.map((p) => `- ${p}`).join("\n")}\n\nPEOPLE:\n${extractedInfo.people.map((p) => `- ${p}`).join("\n")}\n\nORGANIZATIONS:\n${extractedInfo.organizations.map((o) => `- ${o}`).join("\n")}\n\nDATES:\n${extractedInfo.dates.map((d) => `- ${d}`).join("\n")}\n\nACTION ITEMS:\n${extractedInfo.actionItems.map((a) => `- ${a}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setExtractedInfo(null);
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
            <p className="text-sm text-dark-400">Extract structured information from text</p>
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
              placeholder="Paste any text here — meeting notes, articles, emails, documents — and we'll extract the key information into a structured format."
              className="textarea-field min-h-[280px]"
              rows={10}
            />
          </div>

          <button
            onClick={extractInfo}
            disabled={!inputText.trim() || isExtracting}
            className="btn-primary w-full"
          >
            {isExtracting ? "Extracting..." : "Extract Information"}
          </button>
        </div>

        {/* Output Panel */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-dark-300">Extracted Information</h3>
            {extractedInfo && (
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

          <div className="flex-1 min-h-[300px] overflow-y-auto">
            {isExtracting ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full loading-dot"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full loading-dot"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full loading-dot"></span>
                </div>
                <p className="text-sm text-dark-400">Analyzing and extracting information...</p>
              </div>
            ) : extractedInfo ? (
              <div className="space-y-5">
                {/* Summary */}
                <div>
                  <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Summary</h4>
                  <p className="text-sm text-dark-200">{extractedInfo.summary}</p>
                </div>

                {/* Key Points */}
                <div>
                  <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Key Points</h4>
                  <ul className="space-y-1.5">
                    {extractedInfo.keyPoints.map((point, i) => (
                      <li key={i} className="text-sm text-dark-200 flex gap-2">
                        <span className="text-emerald-400 mt-1 flex-shrink-0">&#8226;</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* People */}
                <div>
                  <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">People</h4>
                  <div className="flex flex-wrap gap-2">
                    {extractedInfo.people.map((person, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-blue-400/10 text-blue-300 border border-blue-400/20">
                        {person}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Organizations */}
                <div>
                  <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Organizations</h4>
                  <div className="flex flex-wrap gap-2">
                    {extractedInfo.organizations.map((org, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-purple-400/10 text-purple-300 border border-purple-400/20">
                        {org}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Dates</h4>
                  <div className="flex flex-wrap gap-2">
                    {extractedInfo.dates.map((date, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                        {date}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Items */}
                <div>
                  <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Action Items</h4>
                  <ul className="space-y-1.5">
                    {extractedInfo.actionItems.map((item, i) => (
                      <li key={i} className="text-sm text-dark-200 flex gap-2">
                        <span className="text-amber-400 mt-0.5 flex-shrink-0">&#9744;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-dark-500">
                  Extracted information will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
