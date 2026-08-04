"use client";

import React, { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Users, UserPlus, Mail, Shield, Crown, User, X, Trash2 } from "lucide-react";

export default function TeamManagement() {
  const { currentWorkspace, inviteMember, removeMember } = useWorkspace();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const exists = currentWorkspace?.members.some(
      (m) => m.email.toLowerCase() === inviteEmail.toLowerCase()
    );
    if (exists) return;

    inviteMember(inviteEmail.trim());
    setInviteEmail("");
    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setShowInviteModal(false);
    }, 1500);
  };

  const handleRemoveMember = (memberId: string) => {
    removeMember(memberId);
    setConfirmDelete(null);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-3.5 h-3.5 text-amber-400" />;
      case "admin":
        return <Shield className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <User className="w-3.5 h-3.5 text-dark-400" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-amber-400/10 text-amber-300 border-amber-400/20";
      case "admin":
        return "bg-blue-400/10 text-blue-300 border-blue-400/20";
      default:
        return "bg-dark-700 text-dark-300 border-dark-600";
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-600/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Team</h1>
            <p className="text-sm text-dark-400">
              Manage members in {currentWorkspace?.name || "your workspace"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Members List */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-medium text-dark-300">
            Members ({currentWorkspace?.members.length || 0})
          </h3>
        </div>

        <div className="space-y-1">
          {currentWorkspace?.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-dark-800/50 transition-colors group"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-brand-600/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-brand-300">
                  {member.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{member.name}</p>
                <p className="text-xs text-dark-400 truncate">{member.email}</p>
              </div>

              {/* Role Badge */}
              <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${getRoleBadge(member.role)}`}>
                {getRoleIcon(member.role)}
                <span className="capitalize">{member.role}</span>
              </div>

              {/* Joined Date */}
              <span className="text-xs text-dark-500 hidden sm:block">
                Joined {new Date(member.joinedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>

              {/* Delete Button (not for owner) */}
              {member.role !== "owner" && (
                <button
                  onClick={() => setConfirmDelete(member.id)}
                  className="p-1.5 rounded-md text-dark-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md mx-4 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-600/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-brand-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Invite Team Member</h2>
              </div>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail("");
                  setInviteSuccess(false);
                }}
                className="btn-ghost p-1.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {inviteSuccess ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-green-400/10 flex items-center justify-center mx-auto mb-3">
                  <UserPlus className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-sm text-green-400 font-medium">Invitation sent successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="input-field"
                    required
                    autoFocus
                  />
                  <p className="text-xs text-dark-500 mt-1.5">
                    They will receive an email invitation to join this workspace.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteEmail("");
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!inviteEmail.trim()}
                    className="btn-primary"
                  >
                    Send Invite
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Confirm Delete Member Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-sm mx-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-red-400/10 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Remove Member</h2>
            </div>
            <p className="text-sm text-dark-300 mb-5">
              Are you sure you want to remove this member from the workspace? They will lose access immediately.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveMember(confirmDelete)}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
