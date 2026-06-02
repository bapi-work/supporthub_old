import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useWhitelabelContext } from "@/components/whitelabel-provider";
import {
  Headphones,
  Search,
  Bell,
  CheckCircle2,
} from "lucide-react";
import { Link } from "wouter";

export function Header() {
  const { agent } = useAuth();
  const { config: whitelabelConfig } = useWhitelabelContext();
  const brand = whitelabelConfig?.primaryColor || "hsl(220 80% 54%)";

  const { data: notificationCount = 0 } = useQuery<number>({
    queryKey: ["/api/notifications/count"],
    refetchInterval: 30000,
  });

  return (
    <header className="app-header fixed top-0 left-0 right-0 z-50 h-14">
      <div className="flex items-center justify-between px-5 h-full gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
          {whitelabelConfig?.logoUrl ? (
            <img
              src={whitelabelConfig.logoUrl}
              alt={whitelabelConfig.companyName || "Logo"}
              className="h-7 w-auto object-contain"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: brand, boxShadow: `0 4px 12px ${brand}44` }}
            >
              <Headphones className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="hidden sm:block min-w-0">
            <p className="text-[13px] font-bold text-foreground leading-tight truncate">
              {whitelabelConfig?.companyName || "SupportHub"}
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">Agent Portal</p>
          </div>
        </div>

        {/* Search */}
        <div className="hidden lg:flex flex-1 max-w-sm">
          <div className="w-full flex items-center bg-background-secondary border border-border hover:border-border-strong rounded-lg px-3 py-1.5 gap-2 transition-all duration-150 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/15">
            <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <Input
              type="text"
              placeholder="Search tickets, customers…"
              className="bg-transparent border-0 p-0 text-sm focus:ring-0 shadow-none placeholder:text-muted-foreground h-auto w-full"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Online pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 rounded-full border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Online</span>
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 border-2 border-card text-[9px] font-bold text-white flex items-center justify-center leading-none">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Button>

          {/* Agent avatar */}
          <Link href="/agents/profile">
            <a className="flex items-center gap-2 h-8 px-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors cursor-pointer">
              {agent?.avatar ? (
                <img src={agent.avatar} alt="Avatar" className="w-6 h-6 rounded-md object-cover" />
              ) : (
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${brand}, hsl(262 80% 58%))` }}
                >
                  <span className="text-[10px] font-bold text-white">
                    {agent?.name?.charAt(0)?.toUpperCase() || "A"}
                  </span>
                </div>
              )}
              <span className="hidden sm:inline text-[13px] font-medium text-foreground pr-0.5">
                {agent?.name?.split(" ")[0] || "Agent"}
              </span>
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
