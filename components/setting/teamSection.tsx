
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Users,
  UserPlus,
  Mail,
  ShieldCheck,
  Loader2,
  UserRound,
  AlertCircle,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  user_email: string;
  image?: string;
  role?: string;
  status?: string;
}

const TeamSection = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
  });

  const [apiError, setApiError] = useState("");
  const [deleteMember, setDeleteMember] =
    useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch("/api/team/fetch");

      if (!res.ok) {
        throw new Error("Failed to fetch team members.");
      }

      const data = await res.json();
      setTeam(data.team || []);
    } catch (error) {
      console.error("Team member fetching error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
    };

    if (!newMemberName.trim()) {
      newErrors.name = "Name is required";
    }

    if (!newMemberEmail.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
        newMemberEmail.trim()
      )
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);

    return !newErrors.name && !newErrors.email;
  };

  const handleAddMember = async () => {
    if (!validateForm()) return;

    setApiError("");
    setIsAdding(true);

    try {
      const res = await fetch("/api/team/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newMemberEmail.trim(),
          name: newMemberName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || "Something went wrong.");
        return;
      }

      setNewMemberEmail("");
      setNewMemberName("");
      setErrors({ name: "", email: "" });
      setOpenDialog(false);

      await fetchTeam();
    } catch (error) {
      console.error(error);
      setApiError("Unable to add member. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!deleteMember) return;

    setDeleteError("");
    setIsDeleting(true);

    try {
      const res = await fetch("/api/team/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: deleteMember.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || "Failed to delete member.");
        return;
      }

      setDeleteMember(null);
      await fetchTeam();
    } catch (error) {
      console.error(error);
      setDeleteError("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeAddDialog = (open: boolean) => {
    if (isAdding) return;

    setOpenDialog(open);

    if (!open) {
      setApiError("");
      setErrors({ name: "", email: "" });
    }
  };

  return (
    <Card className="w-full min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0e] shadow-xl">
      {/* Header */}
      <CardHeader className="flex flex-col gap-4 space-y-0 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
            <Users className="h-5 w-5 text-violet-400" />
          </div>

          <div className="min-w-0">
            <CardTitle className="text-base font-semibold text-white sm:text-lg">
              Team Members
            </CardTitle>
            <CardDescription className="mt-1 text-xs text-zinc-500 sm:text-sm">
              Manage your team and their access.
            </CardDescription>
          </div>
        </div>

        {/* Add Member Dialog */}
        <Dialog open={openDialog} onOpenChange={closeAddDialog}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2 bg-white text-black hover:bg-zinc-200 sm:w-auto">
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>

          <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl border-white/10 bg-[#0E0E12] text-white sm:max-w-md">
            <DialogHeader>
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
                <UserPlus className="h-5 w-5 text-violet-400" />
              </div>

              <DialogTitle className="text-lg">
                Add Team Member
              </DialogTitle>

              <DialogDescription className="text-zinc-400">
                Add a new member to your organization. They will be added
                immediately.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 py-3">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm text-zinc-300">
                  Full Name
                </Label>

                <Input
                  id="name"
                  placeholder="John Doe"
                  value={newMemberName}
                  disabled={isAdding}
                  onChange={(e) => {
                    setNewMemberName(e.target.value);
                    if (errors.name) {
                      setErrors((prev) => ({ ...prev, name: "" }));
                    }
                  }}
                  className="h-11 border-white/10 bg-white/[0.04] text-white placeholder:text-zinc-600 focus-visible:ring-violet-500"
                />

                {errors.name && (
                  <p className="text-xs text-red-400">{errors.name}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm text-zinc-300">
                  Email Address
                </Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={newMemberEmail}
                  disabled={isAdding}
                  onChange={(e) => {
                    setNewMemberEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: "" }));
                    }
                  }}
                  className="h-11 border-white/10 bg-white/[0.04] text-white placeholder:text-zinc-600 focus-visible:ring-violet-500"
                />

                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              {apiError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {apiError}
                </div>
              )}
            </div>

            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
              <Button
                variant="outline"
                disabled={isAdding}
                onClick={() => closeAddDialog(false)}
                className="w-full border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10 hover:text-white sm:w-auto"
              >
                Cancel
              </Button>

              <Button
                onClick={handleAddMember}
                disabled={isAdding}
                className="w-full bg-white text-black hover:bg-zinc-200 sm:w-auto"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Member
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      {/* Team Members */}
      <CardContent className="p-4 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">
              All Members
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {team.length} {team.length === 1 ? "member" : "members"} in your team
            </p>
          </div>

          <Badge
            variant="secondary"
            className="border border-white/[0.08] bg-white/[0.04] text-zinc-400"
          >
            {team.length} Total
          </Badge>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex animate-pulse items-center gap-3 rounded-xl border border-white/[0.06] p-4"
              >
                <div className="h-10 w-10 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 rounded bg-white/10" />
                  <div className="h-2.5 w-48 max-w-full rounded bg-white/[0.06]" />
                </div>
              </div>
            ))}
          </div>
        ) : team.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05]">
              <Users className="h-6 w-6 text-zinc-500" />
            </div>

            <h3 className="text-sm font-semibold text-white">
              No team members yet
            </h3>

            <p className="mt-1 max-w-xs text-xs text-zinc-500">
              Invite your teammates to collaborate and manage your workspace.
            </p>

            <Button
              size="sm"
              onClick={() => setOpenDialog(true)}
              className="mt-5 gap-2 bg-white text-black hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              Add your first member
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {team.map((member) => (
              <div
                key={member.id}
                className="group flex min-w-0 flex-col gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 transition-all hover:border-white/[0.14] hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between sm:p-4"
              >
                {/* Member Details */}
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-11 w-11 shrink-0 border border-white/10">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500/20 to-indigo-500/20 text-sm font-semibold text-violet-300">
                      {member.name?.slice(0, 2).toUpperCase() || "UN"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-white">
                        {member.name || "Unknown"}
                      </p>

                      <Badge
                        variant="secondary"
                        className={cn(
                          "border px-2 py-0.5 text-[10px] capitalize",
                          member.status?.toLowerCase() === "active"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                        )}
                      >
                        {member.status || "Pending"}
                      </Badge>
                    </div>

                    <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-zinc-500">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{member.user_email}</span>
                    </div>
                  </div>
                </div>

                {/* Role and Actions */}
                <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3 sm:justify-end sm:border-0 sm:pt-0">
                  <Badge
                    variant="secondary"
                    className="gap-1.5 border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs capitalize text-zinc-400"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {member.role || "Member"}
                  </Badge>

                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${member.name || "team member"}`}
                    onClick={() => {
                      setDeleteError("");
                      setDeleteMember(member);
                    }}
                    className="h-9 w-9 shrink-0 rounded-lg text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteMember}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeleteMember(null);
            setDeleteError("");
          }
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] rounded-2xl border-white/10 bg-[#0E0E12] text-white sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
              <Trash2 className="h-5 w-5 text-red-400" />
            </div>

            <DialogTitle>Delete Team Member</DialogTitle>

            <DialogDescription className="text-zinc-400">
              Are you sure you want to remove{" "}
              <span className="font-medium text-white">
                {deleteMember?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {deleteError}
            </div>
          )}

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => {
                setDeleteMember(null);
                setDeleteError("");
              }}
              className="w-full border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10 hover:text-white sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDeleteMember}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Member
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TeamSection;
