"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Wand2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Zap,
  Target,
  Layers,
  AlertCircle,
} from "lucide-react";
import { useGenerate } from "@/lib/useGenerate";
import type { ComposerState } from "@/components/dashboard/Dashboard";

interface PromptEnhancerProps {
  composerState: ComposerState | null;
  onBack: () => void;
}

type EnhancementStyle = "balanced" | "detailed" | "concise" | "creative";

const ENHANCEMENT_STYLES: {
  id: EnhancementStyle;
  label: string;
  description: string;
  icon: typeof Wand2;
}[] = [
  { id: "balanced", label: "Balanced", description: "Clear and well-structured", icon: Target },
  { id: "detailed", label: "Detailed", description: "Maximum specificity and depth", icon: Layers },
  { id: "concise", label: "Concise", description: "Tight and focused", icon: Zap },
  { id: "creative", label: "Creative", description: "Encourages novel output", icon: Sparkles },
];

// ─── System Prompt ───────────────────────────────────────────────────────────

function buildSystemPrompt(style: EnhancementStyle): string {
  const styleRules: Record<EnhancementStyle, string> = {
    balanced: "Make it thorough but readable. Include context, format, acceptance criteria, and constraints. Keep proportional to the input complexity.",
    detailed: "Be maximally specific. Define role, audience, tone, format, acceptance criteria, evidence requirements, traceability, and explicit failure conditions. Leave zero room for misinterpretation.",
    concise: "Strip to essentials. Keep the task, key constraints, and expected output format. Remove fluff but never remove meaningful requirements. Under 100 words.",
    creative: "Frame it to encourage originality. Give permission to be unconventional. Discourage clichés. Add creative constraints while preserving all original requirements.",
  };

  return `You rewrite prompts to make them more effective for AI models.

RULES:
- Output ONLY the rewritten prompt. Nothing else. No explanations, no preamble, no "Here is", no quotes, no reasoning.
- NEVER drop or generalize specific requirements from the original. If the user said "test X, Y, Z" — all three must appear in the enhanced prompt. Broad categories must never replace detailed requirements.
- Remove redundancy, never meaningful detail. Compression must not lose operational specifics.
- Write naturally like a human — not like a template.
- Never use placeholder brackets like [topic] or [insert here].
- If the input is just a topic word, write a prompt that asks an AI to explain/teach that topic well.

QUALITY ENFORCEMENT:
- Every instruction in the enhanced prompt should specify: what to do, how to do it, what the expected result looks like, and what constitutes failure.
- Claims must require evidence. The enhanced prompt should ask for: reproduction steps, environment context, expected vs actual, and confidence level where applicable.
- Add traceability: the enhanced prompt should make it possible to verify every original requirement was addressed in the output.
- Include risk prioritization where relevant: not everything deserves equal depth — guide the AI on what matters most.
- Prevent unsupported conclusions: the enhanced prompt should require the AI to distinguish between verified findings and assumptions.

Style: ${styleRules[style]}

IMPORTANT: Your entire response must be the enhanced prompt and nothing else.`;
}

function buildUserMessage(inputPrompt: string): string {
  return `Rewrite this into a better prompt:\n\n${inputPrompt.trim()}`;
}

// ─── Output Cleaning (strips reasoning/meta that leaks through) ──────────────

function cleanOutput(output: string): string {
  let cleaned = output.trim();

  // Remove common AI preambles and meta-commentary
  const preamblePatterns = [
    /^here['']?s?\s*(your|the|my|an?)?\s*(enhanced|improved|refined|rewritten|better)\s*(prompt|version)\s*:?\s*/i,
    /^(enhanced|improved|rewritten|better)\s*(prompt|version)\s*:?\s*/i,
    /^(sure|certainly|absolutely|of course)[!,.]?\s*(here['']?s?\s*(your|the|an?)?\s*(enhanced|improved)?\s*(prompt|version)?:?\s*)?/i,
    /^(okay|ok)[!,.]?\s*/i,
  ];

  for (const pattern of preamblePatterns) {
    cleaned = cleaned.replace(pattern, "");
  }

  // Remove wrapping quotes
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // Remove markdown code blocks
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\w*\n?/, "").replace(/\n?```$/, "").trim();
  }

  // Remove trailing meta-commentary / reasoning
  const trailingPatterns = [
    /\n---\n[\s\S]*$/,
    /\n\*{1,3}(Note|Explanation|Reasoning|Why|Changes|What I did|Analysis):?[\s\S]*$/i,
    /\n(This enhanced|I['']ve (enhanced|improved|added)|The above|This prompt|This rewrite)[\s\S]*$/i,
    /\n(We need|They likely|The original|Since they|Must follow|Probably they)[\s\S]*$/i,
    /\n(INTENT|DOMAIN|GAPS|RISK|FIX):[\s\S]*$/i,
  ];

  for (const pattern of trailingPatterns) {
    cleaned = cleaned.replace(pattern, "");
  }

  // Remove leading reasoning that got prepended
  const leadingReasoningPatterns = [
    /^(The user|They want|We need|Since|Likely|Probably|The original|Must|Let me|I'll|I will|Looking at|Analyzing)[\s\S]*?\n\n/i,
    /^(INTENT|DOMAIN|GAPS|RISK|FIX):[\s\S]*?\n\n/i,
  ];

  for (const pattern of leadingReasoningPatterns) {
    cleaned = cleaned.replace(pattern, "");
  }

  return cleaned.trim();
}

// ─── Input Validation ────────────────────────────────────────────────────────

function validateInput(input: string): { valid: boolean; warning?: string } {
  const trimmed = input.trim();
  if (!trimmed) return { valid: false };
  if (trimmed.length < 3) return { valid: false, warning: "Please enter at least a few words." };

  const words = trimmed.split(/\s+/).length;
  if (words === 1 && trimmed.length < 20) {
    return { valid: true, warning: "Single-word prompts work best with the 'Detailed' style for more context." };
  }

  return { valid: true };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PromptEnhancer({ composerState, onBack }: PromptEnhancerProps) {
  const [inputPrompt, setInputPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [style, setStyle] = useState<EnhancementStyle>("balanced");
  const [copied, setCopied] = useState(false);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [inputWarning, setInputWarning] = useState<string | null>(null);
  const { generate, isGenerating, error } = useGenerate();

  useEffect(() => {
    if (composerState) {
      setInputPrompt(composerState.prompt);
    }
  }, [composerState]);

  useEffect(() => {
    if (inputPrompt.trim()) {
      const { warning } = validateInput(inputPrompt);
      setInputWarning(warning || null);
    } else {
      setInputWarning(null);
    }
  }, [inputPrompt]);

  const analyzeImprovements = (original: string, enhanced: string) => {
    const checks: string[] = [];
    const ol = original.toLowerCase();
    const el = enhanced.toLowerCase();

    if (!ol.includes("tone") && el.includes("tone")) checks.push("Added tone guidance");
    if (!ol.includes("audience") && (el.includes("audience") || el.includes("reader"))) checks.push("Defined audience");
    if (!ol.includes("format") && (el.includes("format") || el.includes("structure"))) checks.push("Specified format");
    if (!ol.includes("avoid") && (el.includes("avoid") || el.includes("do not") || el.includes("don't"))) checks.push("Added guardrails");
    if (el.includes("example") || el.includes("such as") || el.includes("e.g.")) checks.push("Included examples");
    if (enhanced.split(/\s+/).length > original.split(/\s+/).length * 1.5) checks.push("Expanded specificity");
    if (el.includes("step") || el.includes("first") || el.includes("then")) checks.push("Added structure");
    if (el.includes("concise") || el.includes("brief") || el.includes("words")) checks.push("Set length constraints");

    if (checks.length === 0) checks.push("Clarified intent and precision");
    return checks.slice(0, 5);
  };

  const enhancePrompt = async () => {
    const { valid } = validateInput(inputPrompt);
    if (!valid || isGenerating) return;

    setEnhancedPrompt("");
    setImprovements([]);

    const systemPrompt = buildSystemPrompt(style);
    const prompt = buildUserMessage(inputPrompt);

    const result = await generate({
      prompt,
      systemPrompt,
      temperature: style === "creative" ? 0.8 : style === "concise" ? 0.5 : 0.6,
      maxTokens: style === "detailed" ? 1500 : style === "concise" ? 400 : 1000,
    });

    if (result) {
      const cleaned = cleanOutput(result.content);
      setEnhancedPrompt(cleaned);
      setImprovements(analyzeImprovements(inputPrompt, cleaned));
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
    setImprovements([]);
    setInputWarning(null);
  };

  const isInputValid = validateInput(inputPrompt).valid;

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
        <div className="space-y-4">
          <div className="card space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">
                Your Prompt
              </label>
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder={`Enter your rough prompt here. For example:\n\n"write me a marketing plan for a new app"\n\nAI will enhance it into a detailed, structured prompt that gets much better results.`}
                className="textarea-field min-h-[200px]"
                rows={8}
              />
              {inputWarning && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{inputWarning}</span>
                </div>
              )}
            </div>

            {/* Enhancement Style */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2.5">
                Enhancement Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ENHANCEMENT_STYLES.map((s) => {
                  const Icon = s.icon;
                  const isSelected = style === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all duration-200 ${
                        isSelected
                          ? "bg-purple-400/10 border-purple-400/30 text-purple-300"
                          : "border-dark-700 text-dark-400 hover:border-dark-600 hover:text-dark-200"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium">{s.label}</p>
                        <p className="text-[10px] opacity-70">{s.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={enhancePrompt}
              disabled={!isInputValid || isGenerating}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full loading-dot"></span>
                    <span className="w-1.5 h-1.5 bg-white rounded-full loading-dot"></span>
                    <span className="w-1.5 h-1.5 bg-white rounded-full loading-dot"></span>
                  </div>
                  <span>Enhancing with AI...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Enhance Prompt</span>
                </>
              )}
            </button>

            {error && (
              <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
          </div>

          {/* Improvements breakdown */}
          {improvements.length > 0 && (
            <div className="card animate-fade-in">
              <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">
                What was improved
              </h4>
              <div className="flex flex-wrap gap-2">
                {improvements.map((item, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-full bg-purple-400/10 text-purple-300 border border-purple-400/20"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-dark-300">Enhanced Prompt</h3>
            {enhancedPrompt && (
              <div className="flex items-center gap-2">
                <button onClick={handleCopy} className="btn-ghost p-2" title="Copy to clipboard">
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button onClick={handleReset} className="btn-ghost p-2" title="Start over">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-[400px] max-h-[650px] overflow-y-auto">
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
              <div className="space-y-4">
                <pre className="whitespace-pre-wrap text-sm text-dark-200 font-sans leading-relaxed">
                  {enhancedPrompt}
                </pre>

                {/* Word count comparison */}
                <div className="pt-4 border-t border-dark-700">
                  <div className="flex items-center gap-4 text-xs text-dark-500">
                    <span>Original: {inputPrompt.trim().split(/\s+/).length} words</span>
                    <span>→</span>
                    <span>Enhanced: {enhancedPrompt.trim().split(/\s+/).length} words</span>
                  </div>
                </div>
              </div>
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
