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
    balanced: "Output a thorough but readable prompt. Include role, context, task, format, acceptance criteria, and anti-patterns.",
    detailed: "Output a maximally specific prompt. Include role, audience, tone, format, step-by-step process, acceptance criteria, evidence requirements, failure conditions, traceability, and anti-patterns. Leave zero room for misinterpretation.",
    concise: "Output a tight, focused prompt. Keep only the task, essential constraints, format, and one anti-pattern. Every word must earn its place. Remove fluff but never remove meaningful requirements from the original.",
    creative: "Output a prompt that encourages original, non-generic output. Add creative constraints, discourage clichés, give permission to be unconventional, while preserving the original intent and all requirements.",
  };

  return `You are an expert prompt engineer. You take a user's prompt and produce a significantly better version that will get higher-quality results from any AI model.

RULES:
1. Output ONLY the enhanced prompt. No preamble, no "Here's your enhanced prompt:", no commentary, no explanation, no quotes around it.
2. PRESERVE the user's original intent and ALL specific requirements. Never drop, summarize, or generalize specifics.
3. For SHORT inputs (under 50 words): expand thoughtfully — add role, context, constraints, format, acceptance criteria, anti-patterns.
4. For LONG inputs (over 200 words): the prompt is already detailed. Your job is to STRENGTHEN it, not shorten it. Improve vague instructions, add missing acceptance criteria, add failure conditions, strengthen enforcement language ("should" → "must"), add anti-patterns, and improve structure. Output must be SIMILAR LENGTH OR LONGER than the input.
5. NEVER just echo the input back. You must make meaningful improvements.
6. Write naturally — not like a rigid template or form.

WHAT MAKES A GREAT PROMPT:
- Clear role/persona (when it helps)
- Specific task definition
- Context that shapes quality
- Format/structure expectations
- Acceptance criteria (what "good" looks like)
- Failure conditions (what to avoid, what NOT to do)
- Evidence requirements (where applicable)
- Anti-patterns (specific things that would make the output bad)

STYLE: ${styleRules[style]}`;
}

function buildUserMessage(inputPrompt: string): string {
  const wordCount = inputPrompt.trim().split(/\s+/).length;

  if (wordCount > 200) {
    return `Enhance and strengthen this detailed prompt. It is already long — do NOT shorten or summarize it. Preserve every section and requirement. Add what's missing: acceptance criteria, failure conditions, anti-patterns, evidence requirements. Strengthen vague language. The output must be at least as long as the input.\n\nOriginal prompt:\n\n${inputPrompt.trim()}`;
  }

  return `Enhance this prompt:\n\n${inputPrompt.trim()}`;
}

// ─── Output Cleaning ─────────────────────────────────────────────────────────

function cleanOutput(output: string): string {
  let cleaned = output.trim();

  const preamblePatterns = [
    /^here['']?s?\s*(your|the|my|an?)?\s*(enhanced|improved|refined|rewritten|better)\s*(prompt|version)\s*:?\s*/i,
    /^(enhanced|improved|rewritten|better)\s*(prompt|version)\s*:?\s*/i,
    /^(sure|certainly|absolutely|of course|okay|ok)[!,.]?\s*(here['']?s?[^.]*)?/i,
  ];

  for (const pattern of preamblePatterns) {
    cleaned = cleaned.replace(pattern, "");
  }

  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\w*\n?/, "").replace(/\n?```$/, "").trim();
  }

  return cleaned.trim();
}

// ─── Validation ──────────────────────────────────────────────────────────────

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
    if (el.includes("acceptance") || el.includes("criteria")) checks.push("Acceptance criteria");
    if (el.includes("fail") || el.includes("failure")) checks.push("Failure conditions");
    if (el.includes("evidence") || el.includes("verif")) checks.push("Evidence requirements");
    if (enhanced.split(/\s+/).length > original.split(/\s+/).length * 1.3) checks.push("Expanded specificity");

    if (checks.length === 0) checks.push("Clarified intent and precision");
    return checks.slice(0, 5);
  };

  const enhancePrompt = async () => {
    const { valid } = validateInput(inputPrompt);
    if (!valid || isGenerating) return;

    setEnhancedPrompt("");
    setImprovements([]);

    const wordCount = inputPrompt.trim().split(/\s+/).length;
    const systemPrompt = buildSystemPrompt(style);
    const prompt = buildUserMessage(inputPrompt);

    // Scale tokens for long inputs
    const baseTokens = style === "detailed" ? 4000 : style === "concise" ? 1000 : 3000;
    const tokens = wordCount > 200 ? Math.max(baseTokens, 8000) : baseTokens;

    const result = await generate({
      prompt,
      systemPrompt,
      temperature: style === "creative" ? 0.9 : style === "concise" ? 0.4 : 0.7,
      maxTokens: tokens,
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
