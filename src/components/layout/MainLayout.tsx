import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  Plus,
  TrendingUp,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "Manage",
    url: "/manage",
    icon: LayoutDashboard,
  },
  {
    title: "Create",
    url: "/create",
    icon: Plus,
  },
];

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-bold text-foreground leading-tight">
                  CS2 Index
                </span>
                <span className="text-[10px] text-primary font-medium uppercase tracking-wider leading-tight">
                  Market Tracker
                </span>
              </div>
            </div>

            {/* Center Navigation */}
            <nav className="flex items-center">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border/50">
                {navItems.map((item) => {
                  const isActive =
                    item.url === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(item.url);

                  return (
                    <NavLink
                      key={item.url}
                      to={item.url}
                      className={cn(
                        "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-background text-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.title}</span>
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Live Status */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-medium text-success">Live</span>
              </div>

              {/* Version Badge */}
              <div className="hidden md:flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Zap className="h-3 w-3 text-primary" />
                <span className="font-mono">v1.0</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
