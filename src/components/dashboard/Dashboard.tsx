"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import HomeComposer from "@/components/home/HomeComposer";
import BlogGenerator from "@/components/tools/BlogGenerator";
import LinkedinGenerator from "@/components/tools/LinkedinGenerator";
import InfoExtractor from "@/components/tools/InfoExtractor";
import PromptEnhancer from "@/components/tools/PromptEnhancer";
import TeamManagement from "@/components/team/TeamManagement";
import ToolsGrid from "@/components/tools/ToolsGrid";

export type PageView =
  | "home"
  | "tools"
  | "blog-generator"
  | "linkedin-generator"
  | "info-extractor"
  | "prompt-enhancer"
  | "team";

export interface ComposerState {
  prompt: string;
  tone: string;
  audience: string;
}

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState<PageView>("home");
  const [composerState, setComposerState] = useState<ComposerState | null>(null);

  const handleNavigateToTool = (tool: PageView, state?: ComposerState) => {
    if (state) {
      setComposerState(state);
    } else {
      setComposerState(null);
    }
    setCurrentPage(tool);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomeComposer onNavigate={handleNavigateToTool} />;
      case "tools":
        return <ToolsGrid onNavigate={handleNavigateToTool} />;
      case "blog-generator":
        return <BlogGenerator composerState={composerState} onBack={() => setCurrentPage("tools")} />;
      case "linkedin-generator":
        return <LinkedinGenerator composerState={composerState} onBack={() => setCurrentPage("tools")} />;
      case "info-extractor":
        return <InfoExtractor composerState={composerState} onBack={() => setCurrentPage("tools")} />;
      case "prompt-enhancer":
        return <PromptEnhancer composerState={composerState} onBack={() => setCurrentPage("tools")} />;
      case "team":
        return <TeamManagement />;
      default:
        return <HomeComposer onNavigate={handleNavigateToTool} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigateToTool} />
      <main className="flex-1 overflow-y-auto">
        <div className="animate-fade-in">{renderPage()}</div>
      </main>
    </div>
  );
}
