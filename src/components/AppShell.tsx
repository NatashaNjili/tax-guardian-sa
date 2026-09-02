import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Receipt,
  BookOpen,
  BellRing,
  PiggyBank,
  FileText,
  Calculator,
  MessagesSquare,
  Settings,
  Wallet,
  Camera,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/salary", label: "Salary & PAYE", icon: Wallet },
  { to: "/receipts", label: "Snap receipt", icon: Receipt },
  { to: "/ledger", label: "Business ledger", icon: BookOpen },
  { to: "/alerts", label: "Tax alerts", icon: BellRing },
  { to: "/provision", label: "Money set aside", icon: PiggyBank },
  { to: "/summary", label: "Annual summary", icon: FileText },
  { to: "/assistant", label: "Ask the assistant", icon: MessagesSquare },
  { to: "/calculator", label: "Tax calculator", icon: Calculator },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const MOBILE_NAV = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/salary", label: "Salary", icon: Wallet },
  { to: "/receipts", label: "Snap", icon: Camera },
  { to: "/ledger", label: "Ledger", icon: BookOpen },
  { to: "/alerts", label: "Alerts", icon: BellRing },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-sidebar px-4 py-6 text-sidebar-foreground lg:flex">
        <Link to="/dashboard" className="mb-8 flex items-center gap-2 px-2">
          <ShieldCheck className="size-6 text-sidebar-primary" aria-hidden />
          <span className="font-display text-lg font-semibold">TaxGuard SA</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1" aria-label="Main">
          {NAV.map((item) => {
            const active = path === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
                )}
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Button variant="ghost" onClick={signOut} className="justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground">
          <LogOut className="size-4" aria-hidden /> Sign out
        </Button>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" aria-hidden />
          <span className="font-display font-semibold">TaxGuard SA</span>
        </Link>
        <Button variant="ghost" size="sm" onClick={signOut} aria-label="Sign out">
          <LogOut className="size-4" aria-hidden />
        </Button>
      </header>

      <main className="px-4 pb-28 pt-4 lg:ml-64 lg:px-10 lg:pb-16 lg:pt-8">{children}</main>

      <Link
        to="/receipts"
        aria-label="Snap a receipt"
        className="fixed bottom-24 right-4 z-30 flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-lift)] transition-transform active:scale-95 lg:bottom-8 lg:right-8"
      >
        <Camera className="size-6" aria-hidden />
      </Link>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-border bg-card lg:hidden"
        aria-label="Mobile"
      >
        {MOBILE_NAV.map((item) => {
          const active = path === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px]",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="size-5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight lg:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
