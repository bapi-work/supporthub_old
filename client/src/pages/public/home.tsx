import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Search,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  BookOpen,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Zap,
  Shield,
  Headphones,
  TicketIcon,
  ChevronRight,
  Loader2,
  Star,
} from "lucide-react";
import { Link } from "wouter";
import {
  insertTicketSchema,
  type InsertTicket,
  type Ticket,
  type KnowledgeBase,
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useWhitelabelContext } from "@/components/whitelabel-provider";
import LiveChatWidget from "@/components/live-chat-widget";

export default function PublicHome() {
  const { toast } = useToast();
  const { config: wl } = useWhitelabelContext();
  const brand = wl?.primaryColor || "#3b82f6";

  const { data: chatSettings } = useQuery({ queryKey: ["/api/public/settings/chat"] });
  const isChatEnabled = (chatSettings as any)?.enabled === true;

  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"id" | "email">("id");
  const [searchResults, setSearchResults] = useState<Ticket[]>([]);
  const [kbSearchQuery, setKbSearchQuery] = useState("");
  const [selectedKbCategory, setSelectedKbCategory] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBase | null>(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } =
    useForm<InsertTicket>({
      resolver: zodResolver(insertTicketSchema),
      defaultValues: { priority: "medium", channel: "email" },
    });

  const createTicketMutation = useMutation({
    mutationFn: async (data: InsertTicket) => apiRequest("POST", "/api/tickets", data),
    onSuccess: async (response) => {
      const ticket = await response.json();
      toast({ title: "Ticket submitted!", description: `Reference #${ticket.id || "—"} has been created. We'll be in touch shortly.` });
      reset();
    },
    onError: (error: Error) => toast({ title: "Submission failed", description: error.message, variant: "destructive" }),
  });

  const searchTicketsMutation = useMutation({
    mutationFn: async ({ query, type }: { query: string; type: "id" | "email" }) => {
      const endpoint = type === "id"
        ? `/api/public/tickets/${query}`
        : `/api/public/tickets/search?email=${encodeURIComponent(query)}`;
      const response = await apiRequest("GET", endpoint);
      return response.json();
    },
    onSuccess: (data) => {
      const tickets = Array.isArray(data) ? data : [data];
      setSearchResults(tickets.filter(Boolean));
      if (!tickets.length) toast({ title: "No results", description: "No tickets match your search." });
    },
    onError: (error: Error) => {
      toast({ title: "Search failed", description: error.message, variant: "destructive" });
      setSearchResults([]);
    },
  });

  const { data: kbCategories = [] } = useQuery<string[]>({ queryKey: ["/api/public/kb/categories"] });

  const { data: kbArticles = [], isLoading: kbLoading } = useQuery<KnowledgeBase[]>({
    queryKey: ["/api/public/kb", { category: selectedKbCategory !== "all" ? selectedKbCategory : undefined, search: kbSearchQuery || undefined }],
    queryFn: async () => {
      let url = "/api/public/kb";
      const p = new URLSearchParams();
      if (selectedKbCategory !== "all") p.set("category", selectedKbCategory);
      if (kbSearchQuery) p.set("search", kbSearchQuery);
      if (p.toString()) url += `?${p.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const rateArticleMutation = useMutation({
    mutationFn: ({ id, helpful }: { id: string; helpful: boolean }) =>
      apiRequest("POST", `/api/public/kb/${id}/rate`, { helpful }),
    onSuccess: () => toast({ title: "Thanks for your feedback!" }),
  });

  const watchedPriority = watch("priority");
  const watchedChannel = watch("channel");

  return (
    <div className="min-h-screen bg-background">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {wl?.logoUrl ? (
              <img src={wl.logoUrl} alt={wl.companyName || "Logo"} className="h-8 w-auto" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: brand }}>
                <Headphones className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="text-[15px] font-bold text-foreground tracking-tight">
              {wl?.companyName || "SupportHub"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/customer/login">
              <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hidden sm:flex">
                Sign in
              </Button>
            </Link>
            <Link href="/customer/register">
              <Button size="sm" className="text-sm gap-1.5" style={{ background: brand }}>
                Get started <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-hero-pattern">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 .5h32M.5 0v32' stroke='white' stroke-opacity='1'/%3E%3C/svg%3E\")", backgroundSize: "32px 32px" }}
        />

        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-20 pb-28 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[13px] font-medium text-white/70 mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Integrated self-service support portal
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05] mb-6 animate-slide-up">
            {wl?.heroTitle || "Help Center"}
          </h1>
          <p className="text-lg sm:text-xl text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up [animation-delay:80ms]">
            {wl?.heroSubtitle || "Find answers, submit requests, and track your support tickets — all in one place."}
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto animate-slide-up [animation-delay:160ms]">
            <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/20">
              <Search className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
              <input
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-gray-900 px-3 py-4 text-base placeholder:text-gray-400"
                placeholder="Search the knowledge base…"
                value={kbSearchQuery}
                onChange={(e) => setKbSearchQuery(e.target.value)}
              />
              <Button
                className="m-1.5 rounded-xl px-5 h-10 text-sm font-semibold flex-shrink-0"
                style={{ background: brand }}
              >
                Search
              </Button>
            </div>
          </div>

          {/* Trust stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 animate-fade-in [animation-delay:300ms]">
            {[
              { label: "Avg. response time", value: "< 2h" },
              { label: "Customer satisfaction", value: "98%" },
              { label: "Issues resolved", value: "50k+" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-extrabold text-white">{value}</p>
                <p className="text-[12px] text-white/45 font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE STRIP ── */}
      <section className="border-b border-border bg-background-secondary">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: BookOpen, color: "surface-blue",   title: "Knowledge Base",    desc: "Browse hundreds of articles and guides" },
            { icon: TicketIcon, color: "surface-purple", title: "Submit a Ticket",   desc: "Reach our support team directly" },
            { icon: Search,    color: "surface-amber",  title: "Track your Request", desc: "Real-time status on all your tickets" },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border hover:border-border-strong hover:shadow-sm transition-all group">
              <div className={`icon-container-md rounded-xl flex-shrink-0 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        <Tabs defaultValue="kb">
          {/* Tab bar */}
          <div className="flex justify-center mb-10">
            <TabsList className="inline-flex bg-muted rounded-xl p-1 gap-1 h-auto">
              {[
                { value: "kb",     label: "Knowledge Base",  icon: BookOpen },
                { value: "create", label: "Create Ticket",   icon: Send },
                { value: "status", label: "Check Status",    icon: Search },
              ].map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── KB TAB ── */}
          <TabsContent value="kb" className="animate-fade-in focus-visible:outline-none">
            {selectedArticle ? (
              <div className="max-w-4xl mx-auto animate-slide-up">
                <Card className="card-elevated rounded-2xl overflow-hidden border border-border">
                  <CardHeader className="bg-background-secondary border-b px-8 pt-8 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedArticle(null)}
                        className="w-fit gap-1.5 text-xs"
                      >
                        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                        Back to Articles
                      </Button>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5 bg-card px-3 py-1 rounded-full border">
                          <Eye className="w-3.5 h-3.5 text-blue-500" />{selectedArticle.views} views
                        </span>
                        <span className="flex items-center gap-1.5 bg-card px-3 py-1 rounded-full border">
                          <Clock className="w-3.5 h-3.5 text-purple-500" />
                          {selectedArticle.updatedAt ? new Date(selectedArticle.updatedAt).toLocaleDateString() : "Recent"}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-4">
                      {selectedArticle.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-lg" style={{ background: `${brand}18`, color: brand, border: `1px solid ${brand}30` }}>
                        {selectedArticle.category}
                      </Badge>
                      {selectedArticle.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="px-3 py-1 text-[11px] text-muted-foreground rounded-lg">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 lg:p-10">
                    <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {selectedArticle.content}
                    </div>

                    <div className="mt-12 p-7 rounded-2xl bg-background-secondary border border-border text-center">
                      <p className="text-sm font-semibold text-foreground mb-1">Was this article helpful?</p>
                      <p className="text-xs text-muted-foreground mb-5">Your feedback helps us improve our documentation.</p>
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => rateArticleMutation.mutate({ id: selectedArticle.id, helpful: true })}
                          disabled={rateArticleMutation.isPending}
                          className="gap-2 rounded-xl border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                        >
                          <ThumbsUp className="w-4 h-4 text-emerald-500" />
                          Yes, helpful ({selectedArticle.helpful || 0})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => rateArticleMutation.mutate({ id: selectedArticle.id, helpful: false })}
                          disabled={rateArticleMutation.isPending}
                          className="gap-2 rounded-xl border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        >
                          <ThumbsDown className="w-4 h-4 text-red-400" />
                          Not helpful ({selectedArticle.notHelpful || 0})
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Category chips */}
                <div className="flex flex-wrap justify-center gap-2">
                  {["all", ...kbCategories].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedKbCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                        selectedKbCategory === cat
                          ? "text-white border-transparent shadow-sm"
                          : "text-muted-foreground border-border bg-card hover:border-border-strong"
                      }`}
                      style={selectedKbCategory === cat ? { background: brand, borderColor: brand } : {}}
                    >
                      {cat === "all" ? "All Topics" : cat}
                    </button>
                  ))}
                </div>

                {kbLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-2xl skeleton" />)}
                  </div>
                ) : kbArticles.length === 0 ? (
                  <div className="text-center py-20 rounded-2xl border border-dashed border-border bg-background-secondary">
                    <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="font-semibold text-foreground mb-1">No articles found</p>
                    <p className="text-sm text-muted-foreground">Try a different search or category.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
                    {kbArticles.map((article) => (
                      <article
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="group card-interactive flex flex-col p-6 rounded-2xl cursor-pointer animate-fade-in"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <span
                            className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg"
                            style={{ background: `${brand}14`, color: brand }}
                          >
                            {article.category}
                          </span>
                          <span className="text-[12px] text-muted-foreground flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />{article.views}
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        {article.summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed flex-1">
                            {article.summary}
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                          <span className="text-xs font-semibold flex items-center gap-1 transition-all group-hover:gap-2" style={{ color: brand }}>
                            Read article <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-emerald-500" />{article.helpful}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ── CREATE TICKET TAB ── */}
          <TabsContent value="create" className="animate-fade-in focus-visible:outline-none">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${brand}15` }}>
                  <Send className="w-6 h-6" style={{ color: brand }} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Submit a Support Request</h2>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
                  Describe your issue in detail and our team will respond promptly.
                </p>
              </div>

              <Card className="card-elevated rounded-2xl border border-border overflow-hidden">
                <CardContent className="p-7 sm:p-9">
                  <form onSubmit={handleSubmit((d) => createTicketMutation.mutate(d))} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="Full Name" error={errors.customerName?.message}>
                        <Input id="customerName" placeholder="Jane Smith" {...register("customerName")}
                          className={`h-11 rounded-xl ${errors.customerName ? "border-red-400" : ""}`} />
                      </Field>
                      <Field label="Email Address" error={errors.customerContact?.message}>
                        <Input id="customerContact" type="email" placeholder="jane@company.com" {...register("customerContact")}
                          className={`h-11 rounded-xl ${errors.customerContact ? "border-red-400" : ""}`} />
                      </Field>
                    </div>

                    <Field label="Subject" error={errors.subject?.message}>
                      <Input id="subject" placeholder="Brief summary of your issue" {...register("subject")}
                        className={`h-11 rounded-xl ${errors.subject ? "border-red-400" : ""}`} />
                    </Field>

                    <Field label="Description" error={errors.description?.message}>
                      <Textarea
                        id="description"
                        placeholder="Please describe your issue in detail — include steps to reproduce, expected behaviour, and any relevant context…"
                        rows={5}
                        {...register("description")}
                        className={`rounded-xl resize-none ${errors.description ? "border-red-400" : ""}`}
                      />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="Priority">
                        <Select value={watchedPriority} onValueChange={(v) => setValue("priority", v as any)}>
                          <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low — General inquiry</SelectItem>
                            <SelectItem value="medium">Medium — Affecting work</SelectItem>
                            <SelectItem value="high">High — Critical blocker</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Contact Preference">
                        <Select value={watchedChannel} onValueChange={(v) => setValue("channel", v as any)}>
                          <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="twitter">Twitter / X</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>

                    <Button
                      type="submit"
                      disabled={createTicketMutation.isPending}
                      className="w-full h-11 rounded-xl font-semibold text-sm gap-2 text-white"
                      style={{ background: brand }}
                    >
                      {createTicketMutation.isPending
                        ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</>
                        : <><Send className="w-4 h-4" />Submit Request</>
                      }
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      By submitting you agree to our{" "}
                      <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">Privacy Policy</a>.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── CHECK STATUS TAB ── */}
          <TabsContent value="status" className="animate-fade-in focus-visible:outline-none">
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${brand}15` }}>
                  <Search className="w-6 h-6" style={{ color: brand }} />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Track Your Request</h2>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Enter your ticket ID or email address to see real-time updates.
                </p>
              </div>

              <Card className="card-elevated rounded-2xl border border-border">
                <CardContent className="p-7">
                  {/* Toggle */}
                  <div className="flex bg-background-secondary rounded-xl p-1 mb-5">
                    {(["id", "email"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSearchType(type)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          searchType === type
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {type === "id" ? "Ticket ID" : "Email Address"}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        className="h-11 pl-10 rounded-xl"
                        placeholder={searchType === "id" ? "e.g. TICKET-1234" : "e.g. jane@company.com"}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !searchTicketsMutation.isPending && searchTicketsMutation.mutate({ query: searchQuery.trim(), type: searchType })}
                      />
                    </div>
                    <Button
                      onClick={() => searchTicketsMutation.mutate({ query: searchQuery.trim(), type: searchType })}
                      disabled={searchTicketsMutation.isPending || !searchQuery.trim()}
                      className="w-full h-11 rounded-xl font-semibold text-sm gap-2 text-white"
                      style={{ background: brand }}
                    >
                      {searchTicketsMutation.isPending
                        ? <><Loader2 className="w-4 h-4 animate-spin" />Searching…</>
                        : <><Search className="w-4 h-4" />Find My Ticket</>
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              {searchResults.length > 0 && (
                <div className="space-y-4 animate-slide-up">
                  <p className="text-sm font-medium text-muted-foreground px-1">
                    Found {searchResults.length} ticket{searchResults.length > 1 ? "s" : ""}
                  </p>
                  {searchResults.map((ticket) => {
                    const statusStyle = {
                      open: "bg-blue-50 text-blue-700 border-blue-200",
                      "in-progress": "bg-amber-50 text-amber-700 border-amber-200",
                      resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      closed: "bg-gray-100 text-gray-600 border-gray-200",
                    }[ticket.status] || "bg-gray-100 text-gray-600 border-gray-200";
                    const priorityStyle = {
                      high: "bg-red-50 text-red-700 border-red-200",
                      medium: "bg-amber-50 text-amber-700 border-amber-200",
                      low: "bg-green-50 text-green-700 border-green-200",
                    }[ticket.priority] || "";

                    return (
                      <Card key={ticket.id} className="card-elevated rounded-2xl border border-border overflow-hidden">
                        <div className="flex">
                          <div className="w-1 flex-shrink-0" style={{ background: brand }} />
                          <CardContent className="p-6 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                              <div>
                                <h4 className="font-semibold text-foreground leading-tight">{ticket.subject}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5 font-mono">#{ticket.id}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusStyle}`}>
                                  {ticket.status.replace("-", " ")}
                                </span>
                                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${priorityStyle}`}>
                                  {ticket.priority}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{ticket.description}</p>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground pt-4 border-t border-border">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—"}
                              </span>
                              <span className="capitalize">{ticket.channel}</span>
                              <span>{ticket.customerName || "Anonymous"}</span>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* ── CONTACT SECTION ── */}
        <section className="mt-24 rounded-3xl border border-border bg-card overflow-hidden">
          <div className="p-10 sm:p-14 text-center max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5 surface-blue">
              <Headphones className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 tracking-tight">
              {wl?.contactSectionTitle || "Still need help?"}
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Our support team is available to assist you with anything not covered in the knowledge base.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={`mailto:${wl?.supportEmail || "support@supporthub.com"}`}
                className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-border bg-background hover:border-border-strong hover:shadow-sm transition-all group"
              >
                <div className="w-9 h-9 rounded-lg surface-blue flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">Email Support</p>
                  <p className="text-xs text-muted-foreground">{wl?.supportEmail || "support@supporthub.com"}</p>
                </div>
              </a>

              {wl?.isPhoneNumberEnabled && (
                <a
                  href={`tel:${wl.supportPhone}`}
                  className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-border bg-background hover:border-border-strong hover:shadow-sm transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg surface-green flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">Phone Support</p>
                    <p className="text-xs text-muted-foreground">{wl.supportPhone}</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border bg-background-secondary mt-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {wl?.logoUrl ? (
              <img src={wl.logoUrl} alt={wl.companyName || "Logo"} className="h-6 w-auto opacity-60 grayscale" />
            ) : (
              <div className="w-6 h-6 rounded-md flex items-center justify-center opacity-50" style={{ background: brand }}>
                <Headphones className="w-3 h-3 text-white" />
              </div>
            )}
            <span className="text-sm font-semibold text-muted-foreground">{wl?.companyName || "SupportHub"}</span>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {wl?.footerText || `© ${new Date().getFullYear()} ${wl?.companyName || "SupportHub"}. All rights reserved.`}
          </p>

          <div className="flex items-center gap-5">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </footer>

      {isChatEnabled && <LiveChatWidget />}
    </div>
  );
}

function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
