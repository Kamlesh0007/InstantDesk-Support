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
import { Plus, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";

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
    const [openDiaog, setOpenDialog] = useState(false);
    const [errors, setErrors] = useState({
        name: "",
        email: "",
    });
    const [apiError, setApiError] = useState("");
const [deleteMember, setDeleteMember] = useState<TeamMember | null>(null);
const [isDeleting, setIsDeleting] = useState(false);
const [deleteError, setDeleteError] = useState("");
    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            const res = await fetch("/api/team/fetch");
            if (res.ok) {
                const data = await res.json();
                setTeam(data.team);
            }
        } catch (error) {
            console.log(error, "Team member fetching error");
        } finally {
            setIsLoading(false);
        }
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
                    email: newMemberEmail,
                    name: newMemberName,
                }),
            });
const data = await res.json();
            if (res.ok) {
                setNewMemberEmail("");
                setNewMemberName("");
                setErrors({ name: "", email: "" });
                setOpenDialog(false);
                fetchTeam();
                setApiError("");
            }else{
        
  setApiError(data.error || "Something went wrong.");
  return;


            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsAdding(false);
        }
    };

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
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(newMemberEmail)
        ) {
            newErrors.email = "Please enter a valid email address";
        }

        setErrors(newErrors);

        return !newErrors.name && !newErrors.email;
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
    fetchTeam();
  } catch (error) {
    setDeleteError("Something went wrong. Please try again.");
  } finally {
    setIsDeleting(false);
  }
};

    return (
        <Card className="border-white/5 bg-[#0a0a0e]">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-base font-medium text-white">
                        Team Members
                    </CardTitle>
                    <CardDescription>Manage your team and their access.</CardDescription>
                </div>
                <Dialog
  open={!!deleteMember}
  onOpenChange={(open) => {
    if (!open) {
      setDeleteMember(null);
      setDeleteError("");
    }
  }}
>
  <DialogContent className="bg-[#0E0E12] border-white/10 text-white">
    <DialogHeader>
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
      <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
        {deleteError}
      </div>
    )}

    <DialogFooter>
      <Button

        disabled={isDeleting}
        onClick={() => {
          setDeleteMember(null);
          setDeleteError("");
        }}
      >
        Cancel
      </Button>

      <Button
        variant="destructive"
        disabled={isDeleting}
        onClick={handleDeleteMember}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
                <Dialog open={openDiaog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-white text-black hover:bg-zinc-200">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0E0E12] border-white/10 text-white sm:max-w-106.25">
                        <DialogHeader>
                            <DialogTitle>Add Team Member</DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                Add a new member to your organization. They will be added
                                immediately.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-zinc-300">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={newMemberName}
                                    onChange={(e) => {
                                        setNewMemberName(e.target.value);

                                        if (errors.name) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                name: "",
                                            }));
                                        }
                                    }}
                                    className="bg-white/5 border-white/10 text-white"
                                />

                                {errors.name && (
                                    <p className="text-xs text-red-500">{errors.name}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-zinc-300">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    placeholder="john@example.com"
                                    value={newMemberEmail}
                                    onChange={(e) => {
                                        setNewMemberEmail(e.target.value);

                                        if (errors.email) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                email: "",
                                            }));
                                        }
                                    }}
                                    className="bg-white/5 border-white/10 text-white"
                                />

                                {errors.email && (
                                    <p className="text-xs text-red-500">{errors.email}</p>
                                )}
                            </div>
                            {apiError && (
  <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
    {apiError}
  </div>
)}
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setOpenDialog(false)}
                                    className="border-white/10 text-zinc-300 bg-white/5 hover:bg-white/10 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddMember}
                                    disabled={isAdding}
                                    className="bg-white text-black hover:bg-zinc-200"
                                >
                                    {isAdding ? "Adding..." : "Add Member"}
                                </Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-center py-4 text-zinc-500 text-sm">
                            Loading team...
                        </div>
                    ) : team.length === 0 ? (
                        <div className="text-center py-4 text-zinc-500 text-sm">
                            No team members found.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {team.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/1 hover:bg-white/2 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border border-white/10">
                                            <AvatarFallback className="bg-zinc-800 text-zinc-400">
                                                {member.name?.slice(0, 2).toUpperCase() || "UN"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-white">
                                                    {member.name || "Unknown"}
                                                </p>
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        "capitalize border mx-1 mb-1",
                                                        member.status === "active"
                                                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                                                            : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
                                                    )}
                                                >
                                                    {member.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-zinc-500">
                                                {member.user_email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={"secondary"}
                                            className="bg-white/5 capitalize text-zinc-400 hover:bg-white/10 border-white/5 mx-1"
                                        >
                                            {member.role}
                                        </Badge>
                                                                            <Button
  size="icon"
  variant="ghost"
  onClick={() => {
    setDeleteError("");
    setDeleteMember(member);
  }}
  className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
>
  <Trash2 className="h-4 w-4" />
</Button>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default TeamSection;