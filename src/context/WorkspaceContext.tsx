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
  inviteMember: (email: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: "ws_1",
    name: "My Workspace",
    slug: "my-workspace",
    createdAt: "2024-01-15T10:00:00Z",
    members: [
      {
        id: "user_1",
        name: "Alex Johnson",
        email: "admin@contentforge.io",
        role: "owner",
        joinedAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "user_2",
        name: "Sarah Chen",
        email: "sarah@example.com",
        role: "admin",
        joinedAt: "2024-02-01T14:30:00Z",
      },
      {
        id: "user_3",
        name: "Mike Peters",
        email: "mike@example.com",
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
          name: "Alex Johnson",
          email: "admin@contentforge.io",
          role: "owner",
          joinedAt: new Date().toISOString(),
        },
      ],
    };

    const updated = [...workspaces, newWs];
    setWorkspaces(updated);
    setCurrentWorkspace(newWs);
    localStorage.setItem("workspaces", JSON.stringify(updated));
    localStorage.setItem("current_workspace_id", newWs.id);
    return newWs;
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

    setWorkspaces(updatedWorkspaces);
    setCurrentWorkspace(updatedWorkspace);
    localStorage.setItem("workspaces", JSON.stringify(updatedWorkspaces));
  };

  return (
    <WorkspaceContext.Provider
      value={{ workspaces, currentWorkspace, switchWorkspace, createWorkspace, inviteMember }}
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
