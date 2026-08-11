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
  {
    id: "balanced",
    label: "Balanced",
    description: "Clear and well-structured",
    icon: Target,
  },
  {
    id: "detailed",
    label: "Detailed",
    description: "Maximum specificity and depth",
    icon: Layers,
  },
  {
    id: "concise",
    label: "Concise",
    description: "Tight and focused",
    icon: Zap,
  },
  {
    id: "creative",
    label: "Creative",
    description: "Encourages novel output",
    icon: Sparkles,
  },
];

function buildSystemPrompt(style: EnhancementStyle): string {
  const baseInstructions = `You are a world-class prompt engineer who has studied how LLMs interpret instructions. Your job is to take a user's rough prompt and rewrite it so that ANY AI model will produce dramatically better output.

CRITICAL RULES:
- You must PRESERVE the user's original intent exactly. Do not change what they're asking for.
- Do NOT wrap your output in quotes or code blocks. Output the enhanced prompt directly as plain text.
- Do NOT add meta-commentary like "Here's your enhanced prompt:" — just output the prompt itself.
- The enhanced prompt should feel natural, like a skilled human wrote it — not robotic or over-templated.
- Never use placeholder brackets like [insert X here] — instead, weave the context in naturally.

YOUR ENHANCEMENT PROCESS:
1. INTENT ANALYSIS: What is the user actually trying to accomplish? What would "great output" look like for them?
2. IMPLICIT NEEDS: What did they forget to specify that an AI would need to know? (audience, format, length, tone, constraints)
3. AMBIGUITY REMOVAL: Where could an AI misinterpret them? Make those parts crystal clear.
4. QUALITY SIGNALS: Add criteria that steer the AI toward high-quality, specific, non-generic output.
5. ANTI-PATTERNS: Include what to avoid — this prevents common AI failure modes like being too verbose, too generic, or too listicle-heavy.

STRUCTURE GUIDELINES:
- Start with a clear role/persona IF it genuinely helps (don't force it for simple tasks)
- State the task in one direct sentence
- Add context that shapes the response quality
- Specify format/structure expectations
- Include quality criteria and things to avoid
- End with any output constraints (length, format, etc.)`;

  const styleModifiers: Record<EnhancementStyle, string> = {
    balanced: `
STYLE: BALANCED
- Aim for a prompt that's thorough but not overwhelming
- Include role, context, task, format, and constraints
- Keep it readable — someone should be able to skim it in 15 seconds and understand the ask
- Typical output length: 150-300 words`,

    detailed: `
STYLE: DETAILED & COMPREHENSIVE
- Maximize specificity — leave zero room for AI interpretation
- Include explicit examples of what good output looks like
- Define every dimension: tone, audience, structure, length, terminology, perspective
- Add step-by-step instructions if the task is complex
- Include a "Do NOT" section with specific anti-patterns
- Typical output length: 300-500 words`,

    concise: `
STYLE: CONCISE & FOCUSED
- Strip everything to essentials — no fluff, no redundancy
- Every sentence must add unique value to the instruction
- Use short, direct sentences
- Omit role-setting unless absolutely necessary
- Focus on: what to do, how to format it, one key constraint
- Typical output length: 50-120 words`,

    creative: `
STYLE: CREATIVE & EXPLORATORY
- Frame the prompt to encourage original thinking and unexpected angles
- Add permission to be unconventional ("Feel free to take a surprising angle...")
- Include creative constraints that paradoxically enable more creativity
- Ask for specific sensory details, metaphors, or narrative elements
- Discourage clichés and obvious approaches explicitly
- Typical output length: 150-250 words`,
  };

  return baseInstructions + styleModifiers[style];
}

function buildUserMessage(inputPrompt: string, style: EnhancementStyle): string {
  return `Here is the prompt to enhance:

"""
${inputPrompt.trim()}
"""

Rewrite this into a ${style === "detailed" ? "comprehensive and highly specific" : style === "concise" ? "tight and focused" : style === "creative" ? "creative and inspiring" : "clear and well-structured"} prompt that will produce excellent results from any AI model. Output ONLY the enhanced prompt — nothing else.`;
}

export default function PromptEnhancer({ composerState, onBack }: PromptEnhancerProps) {
  const [inputPrompt, setInputPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [style, setStyle] = useState<EnhancementStyle>("balanced");
  const [copied, setCopied] = useState(false);
  const [improvements, setImprovements] = useState<string[]>([]);
  const { generate, isGenerating, error } = useGenerate();

  useEffect(() => {
    if (composerState) {
      setInputPrompt(composerState.prompt);
    }
  }, [composerState]);

  const analyzeImprovements = (original: string, enhanced: string) => {
    const checks: string[] = [];
    const originalLower = original.toLowerCase();
    const enhancedLower = enhanced.toLowerCase();

    // Check what was added
    if (!originalLower.includes("tone") && enhancedLower.includes("tone"))
      checks.push("Added tone guidance");
    if (!originalLower.includes("audience") && (enhancedLower.includes("audience") || enhancedLower.includes("reader")))
      checks.push("Defined target audience");
    if (!originalLower.includes("format") && (enhancedLower.includes("format") || enhancedLower.includes("structure")))
      checks.push("Specified output format");
    if (!originalLower.includes("avoid") && (enhancedLower.includes("avoid") || enhancedLower.includes("do not") || enhancedLower.includes("don't")))
      checks.push("Added guardrails");
    if (enhancedLower.includes("example") || enhancedLower.includes("such as") || enhancedLower.includes("e.g."))
      checks.push("Included examples for clarity");
    if (enhanced.length > original.length * 1.5)
      checks.push("Expanded specificity");
    if (enhancedLower.includes("step") || enhancedLower.includes("first") || enhancedLower.includes("then"))
      checks.push("Added sequential structure");
    if (enhancedLower.includes("concise") || enhancedLower.includes("brief") || enhancedLower.includes("words"))
      checks.push("Set length constraints");

    // Always show at least something
    if (checks.length === 0) {
      checks.push("Clarified intent and added precision");
    }

    return checks.slice(0, 5);
  };

  const enhancePrompt = async () => {
    if (!inputPrompt.trim()) return;

    setEnhancedPrompt("");
    setImprovements([]);

    const systemPrompt = buildSystemPrompt(style);
    const prompt = buildUserMessage(inputPrompt, style);

    const result = await generate({ prompt, systemPrompt });
    if (result) {
      setEnhancedPrompt(result.content);
      setImprovements(analyzeImprovements(inputPrompt, result.content));
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
              disabled={!inputPrompt.trim() || isGenerating}
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
