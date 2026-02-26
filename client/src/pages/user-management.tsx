import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
    Shield, UserPlus, MoreHorizontal, Trash2, Check, X,
    Users, Crown, User as UserIcon, Ban
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UserRow {
    id: string;
    email: string;
    name: string;
    role: string;
    planId: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

function RoleBadge({ role }: { role: string }) {
    const config: Record<string, { bg: string; text: string; icon: any }> = {
        admin: { bg: "bg-violet-500/10 border-violet-500/20", text: "text-violet-600 dark:text-violet-400", icon: Crown },
        manager: { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-600 dark:text-blue-400", icon: Shield },
        user: { bg: "bg-gray-100 dark:bg-white/[0.06] border-gray-200 dark:border-white/[0.08]", text: "text-gray-600 dark:text-gray-400", icon: UserIcon },
    };
    const c = config[role] || config.user;
    const Icon = c.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md border ${c.bg} ${c.text} capitalize`}>
            <Icon className="w-3 h-3" />
            {role}
        </span>
    );
}

function StatusDot({ active }: { active: boolean }) {
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${active ? "text-emerald-600" : "text-gray-400"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`} />
            {active ? "Active" : "Disabled"}
        </span>
    );
}

export default function UserManagement() {
    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "user" });

    const { data, isLoading } = useQuery<{ users: UserRow[] }>({
        queryKey: ["/api/users"],
    });

    const users = data?.users ?? [];

    const createMutation = useMutation({
        mutationFn: async (userData: typeof newUser) => {
            return apiRequest("/api/users", { method: "POST", body: JSON.stringify(userData) });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/users"] });
            setShowAddForm(false);
            setNewUser({ name: "", email: "", password: "", role: "user" });
            toast({ title: "User created", description: "New user has been added successfully" });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message || "Failed to create user", variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...data }: { id: string; role?: string; isActive?: boolean }) => {
            return apiRequest(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(data) });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/users"] });
            toast({ title: "User updated" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return apiRequest(`/api/users/${id}`, { method: "DELETE" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/users"] });
            toast({ title: "User deleted" });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message || "Failed to delete user", variant: "destructive" });
        },
    });

    const isSelf = (id: string) => (currentUser as any)?.id === id;

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-violet-500" />
                        User Management
                    </h1>
                    <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">{users.length} team member{users.length !== 1 ? "s" : ""}</p>
                </div>
                <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    size="sm"
                    className="gap-1.5 bg-white dark:bg-white/[0.06] text-gray-900 dark:text-white border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.1] rounded-lg shadow-none"
                >
                    <UserPlus className="w-4 h-4" />
                    Add User
                </Button>
            </div>

            {/* Add User Form */}
            {showAddForm && (
                <div className="bg-white dark:bg-[#111118] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-5">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">New Team Member</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <Input
                            placeholder="Full name"
                            value={newUser.name}
                            onChange={(e) => setNewUser(u => ({ ...u, name: e.target.value }))}
                            className="h-10 bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.08] rounded-lg text-sm"
                        />
                        <Input
                            placeholder="Email address"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser(u => ({ ...u, email: e.target.value }))}
                            className="h-10 bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.08] rounded-lg text-sm"
                        />
                        <Input
                            placeholder="Password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser(u => ({ ...u, password: e.target.value }))}
                            className="h-10 bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.08] rounded-lg text-sm"
                        />
                        <div className="flex gap-2">
                            <select
                                value={newUser.role}
                                onChange={(e) => setNewUser(u => ({ ...u, role: e.target.value }))}
                                className="flex-1 h-10 rounded-lg border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] px-3 text-sm text-gray-900 dark:text-white"
                            >
                                <option value="user">User</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                            <Button
                                size="sm"
                                onClick={() => createMutation.mutate(newUser)}
                                disabled={!newUser.name || !newUser.email || !newUser.password || createMutation.isPending}
                                className="h-10 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-lg"
                            >
                                {createMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowAddForm(false)}
                                className="h-10 px-3"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white dark:bg-[#111118] rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-white/[0.04]">
                            <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wider">User</th>
                            <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wider">Role</th>
                            <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wider">Status</th>
                            <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wider">Joined</th>
                            <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-400 dark:text-white/30 uppercase tracking-wider w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i}>
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 dark:bg-white/[0.04] rounded animate-pulse w-20" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-5 py-12 text-center">
                                    <Users className="w-8 h-8 text-gray-300 dark:text-white/10 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400 dark:text-white/30">No users yet</p>
                                </td>
                            </tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${u.role === "admin" ? "bg-gradient-to-br from-violet-500 to-violet-600" :
                                                    u.role === "manager" ? "bg-gradient-to-br from-blue-500 to-blue-600" :
                                                        "bg-gradient-to-br from-gray-400 to-gray-500"
                                                }`}>
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {u.name}
                                                    {isSelf(u.id) && <span className="text-[10px] text-gray-400 dark:text-white/20 ml-1.5">(you)</span>}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-white/30">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                                    <td className="px-5 py-4"><StatusDot active={u.isActive} /></td>
                                    <td className="px-5 py-4 text-xs text-gray-400 dark:text-white/30">
                                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        {!isSelf(u.id) && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => updateMutation.mutate({ id: u.id, role: u.role === "admin" ? "user" : "admin" })}>
                                                        <Crown className="w-4 h-4 mr-2" />
                                                        {u.role === "admin" ? "Remove Admin" : "Make Admin"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateMutation.mutate({ id: u.id, role: "manager" })}>
                                                        <Shield className="w-4 h-4 mr-2" />
                                                        Set as Manager
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => updateMutation.mutate({ id: u.id, isActive: !u.isActive })}>
                                                        <Ban className="w-4 h-4 mr-2" />
                                                        {u.isActive ? "Disable Account" : "Enable Account"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => { if (confirm(`Delete ${u.name}?`)) deleteMutation.mutate(u.id); }}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
