"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  Home,
  Wrench,
  Users,
  LogOut,
  ChevronDown,
  Plus,
  Check,
  Sparkles,
} from "lucide-react";
import type { PageView } from "./Dashboard";

interface SidebarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const { workspaces, currentWorkspace, switchWorkspace, createWorkspace } = useWorkspace();
  const [showWorkspaceSwitcher, setShowWorkspaceSwitcher] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const navItems = [
    { id: "home" as PageView, label: "Home", icon: Home },
    { id: "tools" as PageView, label: "Tools", icon: Wrench },
    { id: "team" as PageView, label: "Team", icon: Users },
  ];

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorkspaceName.trim()) {
      createWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName("");
      setShowCreateWorkspace(false);
      setShowWorkspaceSwitcher(false);
    }
  };

  return (
    <aside className="w-64 h-screen bg-dark-900 border-r border-dark-700 flex flex-col">
      {/* Workspace Switcher */}
      <div className="p-4 border-b border-dark-700">
        <button
          onClick={() => setShowWorkspaceSwitcher(!showWorkspaceSwitcher)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-800 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
            {currentWorkspace?.name.charAt(0).toUpperCase() || "W"}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-white truncate">
              {currentWorkspace?.name || "Workspace"}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-dark-400" />
        </button>

        {/* Workspace Dropdown */}
        {showWorkspaceSwitcher && (
          <div className="mt-2 bg-dark-800 border border-dark-600 rounded-lg overflow-hidden shadow-xl">
            <div className="p-2">
              <p className="text-xs font-medium text-dark-400 px-2 py-1 uppercase tracking-wider">
                Workspaces
              </p>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    switchWorkspace(ws.id);
                    setShowWorkspaceSwitcher(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-dark-700 transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded bg-brand-600/20 flex items-center justify-center text-brand-400 text-xs font-bold">
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-dark-200 flex-1 truncate">{ws.name}</span>
                  {currentWorkspace?.id === ws.id && (
                    <Check className="w-4 h-4 text-brand-400" />
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-dark-600 p-2">
              {showCreateWorkspace ? (
                <form onSubmit={handleCreateWorkspace} className="px-2 py-1">
                  <input
                    type="text"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="Workspace name"
                    className="w-full bg-dark-900 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button type="submit" className="btn-primary text-xs px-3 py-1.5 flex-1">
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateWorkspace(false)}
                      className="btn-ghost text-xs px-3 py-1.5"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowCreateWorkspace(true)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-dark-700 transition-colors text-left"
                >
                  <Plus className="w-4 h-4 text-dark-400" />
                  <span className="text-sm text-dark-300">Create Workspace</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || 
            (item.id === "tools" && ["blog-generator", "linkedin-generator", "info-extractor", "prompt-enhancer"].includes(currentPage));
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                isActive
                  ? "bg-brand-600/10 text-brand-400 border border-brand-500/20"
                  : "text-dark-300 hover:bg-dark-800 hover:text-dark-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-dark-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-md hover:bg-dark-800 text-dark-400 hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
