import { useQuery } from "@tanstack/react-query";
import type { WhitelabelConfig } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminAuth } from "@/lib/admin-auth";
import { useWhitelabelContext } from "@/components/whitelabel-provider";
import {
  Users,
  Tickets,
  Settings,
  LogOut,
  UserPlus,
  Palette,
  Shield,
  BarChart3,
  MessageSquare,
  Monitor,
  Wifi,
  FileText,
  Upload,
  Edit3,
  Headphones,
} from "lucide-react";
import { Link } from "wouter";

interface AdminDashboardStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  totalAgents: number;
  activeAgents: number;
  totalAdmins: number;
  activeChatSessions: number;
  recentTickets: any[];
}

interface AdminAgent {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: string;
}

function StatCard({
  title, value, icon: Icon, surface,
}: { title: string; value: number; icon: any; surface: string }) {
  return (
    <Card className="card-elevated animate-fade-in">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold text-foreground tabular-nums">{value}</p>
          </div>
          <div className={`icon-container-md rounded-xl ${surface}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { adminUser, logout } = useAdminAuth();
  const { config: whitelabelConfig } = useWhitelabelContext();
  const brand = whitelabelConfig?.primaryColor || "hsl(220 80% 54%)";

  const { data: stats } = useQuery<AdminDashboardStats>({
    queryKey: ["/api/admin/dashboard/stats"],
  });

  const { data: agents } = useQuery<AdminAgent[]>({
    queryKey: ["/api/admin/agents"],
  });

  const { data: adminWhitelabelConfig } = useQuery<WhitelabelConfig | null>({
    queryKey: ["/api/admin/whitelabel"],
  });

  if (!adminUser) return null;

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="app-header sticky top-0 z-40">
        <div className="px-6 py-0 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {whitelabelConfig?.logoUrl ? (
              <img
                src={whitelabelConfig.logoUrl}
                alt={whitelabelConfig.companyName || "Logo"}
                className="h-7 w-auto object-contain"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: brand, boxShadow: `0 4px 12px ${brand}44` }}
              >
                <Headphones className="w-4 h-4 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-[15px] font-bold text-foreground leading-tight">
                {whitelabelConfig?.companyName ? `${whitelabelConfig.companyName} Admin` : "Admin Portal"}
              </h1>
              <p className="text-[11px] text-muted-foreground leading-tight">Control Panel</p>
            </div>
            <Badge variant="secondary" className="ml-1 text-[11px]">
              {adminUser.role === "super_admin" ? "Super Admin" : "Admin"}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-muted-foreground">
              Welcome, <span className="font-medium text-foreground">{adminUser.name}</span>
            </span>
            <Button variant="outline" size="sm" onClick={() => logout()} className="gap-1.5 h-8 text-xs">
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-screen-2xl mx-auto">
        {/* Stats */}
        <div className="section-grid-4 stagger">
          <StatCard title="Total Tickets"  value={stats?.totalTickets      || 0} icon={Tickets}      surface="surface-red"    />
          <StatCard title="Active Agents"  value={stats?.activeAgents      || 0} icon={Users}         surface="surface-green"  />
          <StatCard title="Open Tickets"   value={stats?.openTickets       || 0} icon={MessageSquare} surface="surface-amber"  />
          <StatCard title="Live Chats"     value={stats?.activeChatSessions || 0} icon={Monitor}      surface="surface-purple" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="agents" className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-1 overflow-x-auto">
            <TabsList className="bg-transparent flex w-max gap-0.5">
              {[
                { value: "agents",      icon: Users,         label: "Agents" },
                { value: "admin-users", icon: Shield,        label: "Admins" },
                { value: "channels",    icon: MessageSquare, label: "Channels" },
                { value: "widget",      icon: Monitor,       label: "Widget" },
                { value: "whitelabel",  icon: Palette,       label: "Branding" },
                { value: "settings",    icon: Settings,      label: "Settings" },
                { value: "analytics",   icon: BarChart3,     label: "Analytics" },
                { value: "logs",        icon: FileText,      label: "Logs" },
                { value: "import",      icon: Upload,        label: "Import" },
              ].map(({ value, icon: Icon, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Agents */}
          <TabsContent value="agents">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Agent Management</CardTitle>
                  <div className="flex gap-2">
                    <Link href="/admin/agents/new">
                      <Button size="sm" className="gap-1.5 h-8 text-xs">
                        <UserPlus className="w-3.5 h-3.5" />Add Agent
                      </Button>
                    </Link>
                    <Link href="/admin/agents">
                      <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                        <Edit3 className="w-3.5 h-3.5" />Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {agents?.map(agent => (
                    <div key={agent.id} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background-secondary hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3">
                        {agent.avatar ? (
                          <img src={agent.avatar} alt={agent.name} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, ${brand}, hsl(262 80% 58%))` }}
                          >
                            <span className="text-sm font-bold text-white">{agent.name.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-foreground">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{agent.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={agent.role === "senior_agent" ? "default" : "secondary"} className="text-[11px]">
                          {agent.role.replace("_", " ")}
                        </Badge>
                        <Link href={`/admin/agents/${agent.id}/edit`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs">Edit</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {(!agents || agents.length === 0) && (
                    <div className="text-center py-10 text-muted-foreground">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No agents yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Users */}
          <TabsContent value="admin-users">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Admin User Management</CardTitle>
                  <Link href="/admin/admin-users">
                    <Button size="sm" className="gap-1.5 h-8 text-xs">
                      <UserPlus className="w-3.5 h-3.5" />Manage Admins
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <EmptyState icon={Users} title="Admin User Management" description="Create, edit, and manage admin users who can access the admin panel" note="Control access levels and permissions for administrative functions" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Channels */}
          <TabsContent value="channels">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Wifi className="w-4 h-4" />Channel Configuration
                  </CardTitle>
                  <div className="flex gap-2">
                    <Link href="/admin/channels">
                      <Button size="sm" className="h-8 text-xs">Configure Channels</Button>
                    </Link>
                    <Link href="/admin/logs">
                      <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                        <FileText className="w-3.5 h-3.5" />Logs
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <EmptyState icon={Wifi} description="Configure communication channels like Email, WhatsApp, Twitter, and Facebook" note="Set up integrations to receive and respond to customer inquiries" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Widget */}
          <TabsContent value="widget">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Monitor className="w-4 h-4" />Widget Integration
                  </CardTitle>
                  <Link href="/admin/widget-integration">
                    <Button size="sm" className="h-8 text-xs">Configure Widget</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <EmptyState icon={Monitor} description="Embed a live chat widget on your website to connect with customers in real time" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding */}
          <TabsContent value="whitelabel">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Palette className="w-4 h-4" />Whitelabel Configuration
                  </CardTitle>
                  <Link href="/admin/whitelabel/edit">
                    <Button size="sm" className="h-8 text-xs">Edit Branding</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground mb-3">Company Information</p>
                    <InfoRow label="Company" value={whitelabelConfig?.companyName || "Not configured"} />
                    <InfoRow label="Support Email" value={whitelabelConfig?.supportEmail || "Not configured"} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground mb-3">Visual Branding</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-24">Primary Color</span>
                      <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: whitelabelConfig?.primaryColor || "#3b82f6" }} />
                      <code className="text-xs font-mono text-muted-foreground">{whitelabelConfig?.primaryColor || "#3b82f6"}</code>
                    </div>
                    <InfoRow label="Status" value={whitelabelConfig?.isActive ? "Active" : "Inactive"} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Settings className="w-4 h-4" />Application Settings
                  </CardTitle>
                  <Link href="/admin/settings">
                    <Button size="sm" className="h-8 text-xs">Manage Settings</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <EmptyState icon={Settings} description="Configure application-wide settings and preferences" note="Manage security, notifications, integrations, and more" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="w-4 h-4" />System Analytics
                  </CardTitle>
                  <Link href="/admin/analytics">
                    <Button size="sm" className="gap-1.5 h-8 text-xs">
                      <BarChart3 className="w-3.5 h-3.5" />Full Analytics
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 rounded-xl border border-border bg-background-secondary">
                    <p className="text-2xl font-bold text-blue-600 tabular-nums">{stats?.totalTickets || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total Tickets</p>
                  </div>
                  <div className="text-center p-4 rounded-xl border border-border bg-background-secondary">
                    <p className="text-2xl font-bold text-emerald-600 tabular-nums">{stats?.resolvedTickets || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Resolved Tickets</p>
                  </div>
                  <div className="text-center p-4 rounded-xl border border-border bg-background-secondary">
                    <p className="text-2xl font-bold text-purple-600 tabular-nums">{stats?.totalAdmins || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Admin Users</p>
                  </div>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Get detailed insights into ticket trends, agent performance, and channel analytics
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs */}
          <TabsContent value="logs">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="w-4 h-4" />System Logs
                  </CardTitle>
                  <Link href="/admin/logs">
                    <Button size="sm" className="gap-1.5 h-8 text-xs">
                      <FileText className="w-3.5 h-3.5" />View All Logs
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <EmptyState icon={FileText} title="System Activity Logs" description="Monitor system activities, email polling, ticket creation, and error tracking" note="Track all system events and troubleshoot issues with detailed logging" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import */}
          <TabsContent value="import">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Data Import</CardTitle>
                  <Badge variant="secondary" className="text-[11px]">Migration Tools</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-12 h-12 surface-indigo rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">Freshdesk Import</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                    Import tickets, customers, and attachments from Freshdesk CSV export
                  </p>
                  <Link href="/admin/freshdesk-import">
                    <Button className="gap-1.5 hover-lift">
                      <Upload className="w-4 h-4" />Start Import
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-4">
                    Supports CSV files with attachments and preserves ticket history
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon, title, description, note,
}: { icon: any; title?: string; description: string; note?: string }) {
  return (
    <div className="text-center py-10">
      <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      {title && <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>}
      <p className="text-sm text-muted-foreground mb-2 max-w-sm mx-auto">{description}</p>
      {note && <p className="text-xs text-muted-foreground max-w-sm mx-auto">{note}</p>}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-24 flex-shrink-0">{label}</span>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  );
}
