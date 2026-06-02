import { ReactNode, useState } from "react";
import { useAuth, useLogout } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWhitelabelContext } from "@/components/whitelabel-provider";
import {
  Bell, Search, Headphones, CheckCircle2, ChevronLeft, ChevronRight,
  LayoutDashboard, Ticket, User, MessageCircle, FileText, BarChart3, LogOut,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import type { TicketWithAgent } from "@shared/schema";

const MAIN_NAV = [
  { label: "Dashboard",   href: "/agents",             icon: LayoutDashboard, matchExact: true },
  { label: "All Tickets", href: "/agents/tickets",     icon: Ticket,          badge: "totalTickets" },
  { label: "My Tickets",  href: "/agents/my-tickets",  icon: User,            badge: "myTickets" },
  { label: "Live Chat",   href: "/agents/chat",        icon: MessageCircle },
];
const TOOL_NAV = [
  { label: "Templates", href: "/agents/templates", icon: FileText },
  { label: "Reports",   href: "/agents/reports",   icon: BarChart3 },
];

interface AgentLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AgentLayout({ children, title, subtitle }: AgentLayoutProps) {
  const [location] = useLocation();
  const { agent } = useAuth();
  const { config: wl } = useWhitelabelContext();
  const logoutMutation = useLogout();
  const [collapsed, setCollapsed] = useState(false);
  const brand = wl?.primaryColor || "hsl(220 80% 54%)";

  const { data: tickets } = useQuery<TicketWithAgent[]>({ queryKey: ["/api/agent/tickets"] });
  const { data: notificationCount = 0 } = useQuery<number>({
    queryKey: ["/api/notifications/count"],
    refetchInterval: 30000,
  });

  const badges = {
    totalTickets: tickets?.length || 0,
    myTickets: tickets?.filter(t => t.assignedAgentId).length || 0,
  };

  const isActive = (href: string, matchExact?: boolean) => {
    if (matchExact) return location === href || location === "/agents/dashboard";
    return location === href || location.startsWith(href + "/");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "sidebar-root flex flex-col h-screen flex-shrink-0 transition-all duration-300 z-30",
        collapsed ? "w-[60px]" : "w-[216px]"
      )}>
        {/* Logo */}
        <div className={cn(
          "flex items-center h-14 px-3 border-b border-sidebar-border flex-shrink-0",
          collapsed ? "justify-center" : "gap-2.5"
        )}>
          {wl?.logoUrl ? (
            <img src={wl.logoUrl} alt={wl.companyName || "Logo"} className={cn("object-contain", collapsed ? "h-7 w-7" : "h-7 w-auto")} />
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: brand, boxShadow: `0 4px 10px ${brand}44` }}
            >
              <Headphones className="w-4 h-4 text-white" />
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-white leading-tight truncate">{wl?.companyName || "SupportHub"}</p>
              <p className="text-[10px] text-sidebar-text leading-tight">Agent Portal</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {!collapsed && <p className="sidebar-section-label">Navigation</p>}
          {MAIN_NAV.map(item => {
            const active = isActive(item.href, item.matchExact);
            const badgeCount = item.badge ? badges[item.badge as keyof typeof badges] : 0;
            return (
              <Link key={item.href} href={item.href}>
                <a className={cn("sidebar-link", active && "active")} title={collapsed ? item.label : undefined}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {badgeCount > 0 && (
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center tabular-nums",
                          active ? "bg-white/20 text-white" : "bg-white/10 text-sidebar-text"
                        )}>
                          {badgeCount > 99 ? "99+" : badgeCount}
                        </span>
                      )}
                    </>
                  )}
                </a>
              </Link>
            );
          })}

          <div className={cn(!collapsed && "mt-1")}>
            {!collapsed && <p className="sidebar-section-label">Tools</p>}
            {collapsed && <div className="h-2" />}
            {TOOL_NAV.map(item => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <a className={cn("sidebar-link", active && "active")} title={collapsed ? item.label : undefined}>
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </a>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-2 space-y-0.5 flex-shrink-0">
          {!collapsed && (
            <Link href="/agents/profile">
              <a className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-sidebar-bg-hover transition-colors cursor-pointer">
                {agent?.avatar ? (
                  <img src={agent.avatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10" />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ring-1 ring-white/10"
                    style={{ background: `linear-gradient(135deg, ${brand}, hsl(262 80% 58%))` }}
                  >
                    <span className="text-[11px] font-bold text-white">{agent?.name?.charAt(0)?.toUpperCase() || "A"}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-white truncate leading-tight">{agent?.name}</p>
                  <p className="text-[10px] text-sidebar-text truncate leading-tight">{agent?.email}</p>
                </div>
              </a>
            </Link>
          )}
          <button
            onClick={() => logoutMutation.mutate()}
            className={cn("sidebar-link w-full !text-red-400 hover:!text-red-300 hover:!bg-red-500/10", collapsed && "justify-center")}
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn("sidebar-link w-full", collapsed && "justify-center")}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed
              ? <ChevronRight className="w-4 h-4" />
              : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>
            }
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="app-header h-14 flex items-center px-5 flex-shrink-0 gap-3">
          <div className="hidden md:flex flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tickets…"
                className="pl-8 h-8 text-sm bg-background-secondary border-border focus:bg-card"
              />
            </div>
          </div>

          {title && (
            <div className="flex-1 md:flex-none">
              <h1 className="text-base font-semibold text-foreground leading-tight">{title}</h1>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Online</span>
            </div>

            <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 border-2 border-card text-[9px] font-bold text-white flex items-center justify-center leading-none">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Button>

            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
              style={{ background: `linear-gradient(135deg, ${brand}, hsl(262 80% 58%))` }}
            >
              <span className="text-[11px] font-bold text-white">{agent?.name?.charAt(0)?.toUpperCase() || "A"}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AgentLayout;
