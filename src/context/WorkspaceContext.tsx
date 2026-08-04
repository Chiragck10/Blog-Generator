"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
  avatar?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  members: WorkspaceMember[];
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  switchWorkspace: (id: string) => void;
  createWorkspace: (name: string) => Workspace;
  deleteWorkspace: (id: string) => void;
  inviteMember: (email: string) => void;
  removeMember: (memberId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// Bump this version whenever you change DEFAULT_WORKSPACES to auto-reset localStorage
const DATA_VERSION = "2";

const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: "ws_1",
    name: "My Workspace",
    slug: "my-workspace",
    createdAt: "2024-01-15T10:00:00Z",
    members: [
      {
        id: "user_1",
        name: "Chirag Gupta",
        email: "admin@contentforge.io",
        role: "owner",
        joinedAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "user_2",
        name: "Mayank",
        email: "mayank@example.com",
        role: "admin",
        joinedAt: "2024-02-01T14:30:00Z",
      },
      {
        id: "user_3",
        name: "Kashish",
        email: "kashish@example.com",
        role: "member",
        joinedAt: "2024-03-10T09:15:00Z",
      },
    ],
  },
];

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(DEFAULT_WORKSPACES);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    const storedVersion = localStorage.getItem("workspaces_version");

    // If version doesn't match, reset to defaults
    if (storedVersion !== DATA_VERSION) {
      localStorage.setItem("workspaces", JSON.stringify(DEFAULT_WORKSPACES));
      localStorage.setItem("current_workspace_id", DEFAULT_WORKSPACES[0].id);
      localStorage.setItem("workspaces_version", DATA_VERSION);
      setWorkspaces(DEFAULT_WORKSPACES);
      setCurrentWorkspace(DEFAULT_WORKSPACES[0]);
      return;
    }

    const stored = localStorage.getItem("workspaces");
    const currentWsId = localStorage.getItem("current_workspace_id");

    if (stored) {
      const parsed = JSON.parse(stored);
      setWorkspaces(parsed);
      setCurrentWorkspace(
        parsed.find((ws: Workspace) => ws.id === currentWsId) || parsed[0]
      );
    } else {
      setCurrentWorkspace(DEFAULT_WORKSPACES[0]);
      localStorage.setItem("workspaces", JSON.stringify(DEFAULT_WORKSPACES));
      localStorage.setItem("current_workspace_id", DEFAULT_WORKSPACES[0].id);
    }
  }, []);

  const persist = (updated: Workspace[], currentId: string) => {
    setWorkspaces(updated);
    localStorage.setItem("workspaces", JSON.stringify(updated));
    localStorage.setItem("current_workspace_id", currentId);
  };

  const switchWorkspace = (id: string) => {
    const ws = workspaces.find((w) => w.id === id);
    if (ws) {
      setCurrentWorkspace(ws);
      localStorage.setItem("current_workspace_id", id);
    }
  };

  const createWorkspace = (name: string): Workspace => {
    const newWs: Workspace = {
      id: `ws_${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      createdAt: new Date().toISOString(),
      members: [
        {
          id: "user_1",
          name: "Chirag Gupta",
          email: "admin@contentforge.io",
          role: "owner",
          joinedAt: new Date().toISOString(),
        },
      ],
    };

    const updated = [...workspaces, newWs];
    setCurrentWorkspace(newWs);
    persist(updated, newWs.id);
    return newWs;
  };

  const deleteWorkspace = (id: string) => {
    // Cannot delete the last workspace
    if (workspaces.length <= 1) return;

    const updated = workspaces.filter((ws) => ws.id !== id);
    const newCurrent = currentWorkspace?.id === id ? updated[0] : currentWorkspace || updated[0];
    setCurrentWorkspace(newCurrent);
    persist(updated, newCurrent.id);
  };

  const inviteMember = (email: string) => {
    if (!currentWorkspace) return;

    const newMember: WorkspaceMember = {
      id: `user_${Date.now()}`,
      name: email.split("@")[0],
      email,
      role: "member",
      joinedAt: new Date().toISOString(),
    };

    const updatedWorkspace = {
      ...currentWorkspace,
      members: [...currentWorkspace.members, newMember],
    };

    const updatedWorkspaces = workspaces.map((ws) =>
      ws.id === currentWorkspace.id ? updatedWorkspace : ws
    );

    setCurrentWorkspace(updatedWorkspace);
    persist(updatedWorkspaces, currentWorkspace.id);
  };

  const removeMember = (memberId: string) => {
    if (!currentWorkspace) return;

    // Cannot remove the owner
    const member = currentWorkspace.members.find((m) => m.id === memberId);
    if (!member || member.role === "owner") return;

    const updatedWorkspace = {
      ...currentWorkspace,
      members: currentWorkspace.members.filter((m) => m.id !== memberId),
    };

    const updatedWorkspaces = workspaces.map((ws) =>
      ws.id === currentWorkspace.id ? updatedWorkspace : ws
    );

    setCurrentWorkspace(updatedWorkspace);
    persist(updatedWorkspaces, currentWorkspace.id);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        switchWorkspace,
        createWorkspace,
        deleteWorkspace,
        inviteMember,
        removeMember,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
