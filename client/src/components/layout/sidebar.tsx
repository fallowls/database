import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Building2, Shield, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Prospects", href: "/prospects", icon: Users },
  { name: "Companies", href: "/companies", icon: Building2 },
];

const adminItems = [
  { name: "Users", href: "/users", icon: Shield },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const isAdmin = (user as any)?.role === "admin";

  const renderNavItem = (item: typeof navItems[0]) => {
    const isActive = location === item.href;
    return (
      <Link key={item.name} href={item.href}>
        <div
          className={cn(
            "group flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-lg cursor-pointer transition-all",
            isActive
              ? "bg-white/[0.08] text-white"
              : "text-white/35 hover:bg-white/[0.04] hover:text-white/60"
          )}
          data-testid={`nav-${item.name.toLowerCase()}`}
        >
          <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-white" : "text-white/25 group-hover:text-white/50")} />
          {item.name}
        </div>
      </Link>
    );
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-56">
        <div className="flex flex-col h-full bg-[#0e0e14] border-r border-white/[0.04]">
          {/* Logo */}
          <div className="flex items-center h-14 px-5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="ml-2.5 text-sm font-semibold text-white tracking-tight">Closo</span>
            <span className="ml-1 text-[10px] font-medium text-white/20 mt-0.5">CRM</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
            <div className="mb-4">
              <p className="px-3 mb-2 text-[10px] font-semibold text-white/15 uppercase tracking-widest">Main</p>
              {navItems.map(renderNavItem)}
            </div>

            {isAdmin && (
              <div>
                <p className="px-3 mb-2 mt-4 text-[10px] font-semibold text-white/15 uppercase tracking-widest">Admin</p>
                {adminItems.map(renderNavItem)}
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/[0.04]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-[10px] text-white/20">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
