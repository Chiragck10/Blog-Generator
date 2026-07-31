"use client";

import React from "react";
import { FileText, Linkedin, Search, Wand2, MessageSquare, Mail } from "lucide-react";
import type { PageView } from "@/components/dashboard/Dashboard";

interface ToolsGridProps {
  onNavigate: (tool: PageView) => void;
}

const AVAILABLE_TOOLS = [
  {
    id: "blog-generator" as PageView,
    name: "Blog Generator",
    description: "Generate comprehensive blog posts on any topic with customizable tone and audience targeting.",
    icon: FileText,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    status: "available" as const,
  },
  {
    id: "linkedin-generator" as PageView,
    name: "LinkedIn Generator",
    description: "Create engaging LinkedIn posts that drive engagement and build your professional brand.",
    icon: Linkedin,
    color: "text-sky-400",
    bgColor: "bg-sky-400/10",
    status: "available" as const,
  },
  {
    id: "info-extractor" as PageView,
    name: "Info Extractor",
    description: "Extract key points, names, dates, organizations, and action items from any text block.",
    icon: Search,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    status: "available" as const,
  },
  {
    id: "prompt-enhancer" as PageView,
    name: "Prompt Enhancer",
    description: "Transform rough AI prompts into clear, detailed, and effective instructions.",
    icon: Wand2,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    status: "available" as const,
  },
  {
    id: "tools" as PageView,
    name: "Tweet Generator",
    description: "Craft viral tweets and Twitter threads that maximize engagement.",
    icon: MessageSquare,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    status: "coming-soon" as const,
  },
  {
    id: "tools" as PageView,
    name: "Email Writer",
    description: "Write professional emails for any occasion with the perfect tone.",
    icon: Mail,
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
    status: "coming-soon" as const,
  },
];

export default function ToolsGrid({ onNavigate }: ToolsGridProps) {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Content Tools</h1>
        <p className="text-dark-400 mt-1">
          Choose a tool to start generating content
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AVAILABLE_TOOLS.map((tool, index) => {
          const Icon = tool.icon;
          const isAvailable = tool.status === "available";

          return (
            <button
              key={`${tool.id}-${index}`}
              onClick={() => isAvailable && onNavigate(tool.id)}
              disabled={!isAvailable}
              className={`text-left p-6 rounded-xl border transition-all duration-200 ${
                isAvailable
                  ? "card-hover"
                  : "bg-dark-900/50 border-dark-700/50 cursor-not-allowed opacity-60"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${tool.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${tool.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{tool.name}</h3>
                    {!isAvailable && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-700 text-dark-400 uppercase tracking-wide font-medium">
                        Soon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-dark-400 mt-1 line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
