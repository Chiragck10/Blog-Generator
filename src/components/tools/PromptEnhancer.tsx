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
    balanced: `STYLE: Clean up structure, tighten language, fill only genuine gaps. Don't add sections the user didn't ask for.`,
    detailed: `STYLE: Add missing dimensions only where genuinely absent — role, audience, format, acceptance criteria, failure conditions. If these already exist in the input, leave them as-is or just sharpen them.`,
    concise: `STYLE: Make it shorter and tighter without losing any requirements. Remove redundancy, tighten sentences, cut filler. Never remove meaningful content.`,
    creative: `STYLE: Reframe to encourage more original AI output. Add one creative constraint or permission. Don't change the core ask.`,
  };

  return `You are a prompt enhancer. You take a user's prompt and make it clearer and more effective — nothing more.

ABSOLUTE RULES:

1. Output ONLY the enhanced prompt. No commentary, no preamble, no explanations.

2. DO NOT ADD YOUR OWN IDEAS, SUGGESTIONS, OR REQUIREMENTS.
   You are not a consultant. You do not invent new requirements. You do not add sections the user didn't ask for. You do not suggest approaches, methodologies, or frameworks unless the user's intent clearly calls for them.

3. RESPECT WHAT'S ALREADY THERE.
   If the prompt already has acceptance criteria — don't add more.
   If the prompt already has anti-patterns — don't add more.
   If the prompt already has structure — preserve it.
   If the prompt is already good — make only minor improvements (tighten language, fix ambiguity, improve flow).

4. YOUR JOB IS:
   - Fix vague/weak language → make it precise
   - Fix ambiguity → make intent unmistakable
   - Fix structure → improve readability and flow
   - Fill GENUINE gaps only → if there's truly no format specified and it matters, add it. If there's truly no audience defined and it matters, add it. But don't add things for the sake of adding them.
   - Strengthen enforcement → "try to" → "must", "should consider" → "include"

5. YOUR JOB IS NOT:
   - Adding unrelated requirements
   - Inventing new sections or categories
   - Making the prompt longer for the sake of it
   - Suggesting tools, methods, or approaches the user didn't ask about
   - Adding examples the user didn't request
   - Padding with generic "best practices"

6. PROPORTIONAL ENHANCEMENT:
   - If the input is 5 words → expand significantly (the user needs help)
   - If the input is 50 words → moderate improvement (add missing clarity)
   - If the input is 200+ words → minimal, surgical improvement (the user knows what they want — just tighten it)

7. A WELL-WRITTEN INPUT NEEDS MINIMAL CHANGES.
   Not every prompt needs heavy enhancement. If the user wrote a clear, detailed, well-structured prompt — your output should be very close to their input with only language tightening and minor gap-filling. Don't force changes.

${styleRules[style]}`;
}

function buildUserMessage(inputPrompt: string): string {
  const wordCount = inputPrompt.trim().split(/\s+/).length;

  if (wordCount > 150) {
    return `This prompt is already detailed. Only tighten language, fix ambiguity, and improve structure. Do NOT add new requirements or suggestions. Keep the same length:\n\n${inputPrompt.trim()}`;
  }

  if (wordCount > 50) {
    return `Enhance this prompt — fix ambiguity, tighten language, add only what's genuinely missing:\n\n${inputPrompt.trim()}`;
  }

  return `Turn this into a clear, effective prompt:\n\n${inputPrompt.trim()}`;
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
