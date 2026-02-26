import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Bell, LogOut, ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Header() {
  const { user, logout } = useAuth();

  const userName = (user as any)?.name || (user as any)?.email || "User";
  const userEmail = (user as any)?.email || "";
  const initials = userName.split(" ").map((s: string) => s.charAt(0)).join("").toUpperCase().slice(0, 2);
  const isAdmin = (user as any)?.role === "admin";

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-[#0a0a0f] border-b border-gray-100 dark:border-white/[0.04]">
      <div className="flex-1 px-6 flex justify-between items-center">
        {/* Search */}
        <div className="flex-1 flex max-w-lg">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30" />
            <Input
              className="pl-9 h-9 bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 rounded-lg focus:border-blue-500/50 dark:focus:border-white/10 focus:ring-0 transition-colors"
              placeholder="Search prospects or companies..."
              type="search"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="ml-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/80 hover:bg-gray-100 dark:hover:bg-white/[0.04] h-9 w-9 rounded-lg">
            <Bell className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2.5 h-10 pl-2 pr-3 hover:bg-gray-100 dark:hover:bg-white/[0.04] rounded-xl transition-colors" data-testid="button-profile-menu">
                <Avatar className="h-7 w-7 border-0">
                  <AvatarFallback className="bg-blue-600 text-white text-[11px] font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start hidden sm:flex">
                  <span className="text-[13px] font-medium text-gray-700 dark:text-white leading-none mb-0.5">{userName}</span>
                  <span className="text-[10px] text-gray-500 dark:text-white/30 leading-none capitalize">{isAdmin ? "Admin" : "User"}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-white/30 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#111118] border border-gray-200 dark:border-white/[0.08] shadow-xl rounded-xl">
              <div className="px-3 py-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">{userName}</p>
                <p className="text-[11px] text-gray-500 dark:text-white/40 mt-1.5">{userEmail}</p>
              </div>
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/[0.06]" />
              <DropdownMenuItem
                onClick={() => logout()}
                className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-500/10 cursor-pointer rounded-lg m-1"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
