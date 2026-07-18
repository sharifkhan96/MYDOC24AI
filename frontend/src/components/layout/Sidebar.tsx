import {
  Activity,
  BrainCircuit,
  BookOpen,
  ClipboardPlus,
  Heart,
  LayoutDashboard,
  Link2,
  MessageCircle,
  Moon,
  Pill,
  ScanLine,
  Settings,
  Sparkles,
  Stethoscope,
  Video,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { clsx } from "clsx";

const NAV_GROUPS = [
  {
    label: "Care",
    items: [
      { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/app/appointment-prep", label: "Appointment prep", icon: ClipboardPlus },
      { to: "/app/symptom-check", label: "Symptom check", icon: Stethoscope },
      { to: "/app/uploads", label: "Photo & test review", icon: ScanLine },
      { to: "/app/medications", label: "Medications", icon: Pill },
      { to: "/app/live-doctor", label: "Live doctor", icon: Video },
      { to: "/app/meditation", label: "Meditation", icon: Moon },
      { to: "/app/chats", label: "Chats", icon: MessageCircle },
    ],
  },
  {
    label: "You",
    items: [
      { to: "/app/health-profile", label: "Health profile", icon: Heart },
      { to: "/app/memory", label: "Health memory", icon: BrainCircuit },
      { to: "/app/lifestyle", label: "Lifestyle", icon: Activity },
      { to: "/app/connections", label: "Connections", icon: Link2 },
    ],
  },
  {
    label: "Learn",
    items: [
      { to: "/app/public-health", label: "Trending health topics", icon: Sparkles },
      { to: "/app/encyclopedia", label: "Encyclopedia", icon: BookOpen },
      { to: "/app/wellbeing", label: "Wellbeing & beauty", icon: Sparkles },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-navy-100 bg-cream-100 px-4 py-6 md:flex md:flex-col">
      <div className="mb-8 px-2">
        <span className="font-serif text-xl font-semibold text-navy-700">MyDoc24</span>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-navy-400">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand text-onbrand"
                        : "text-navy-600 hover:bg-navy-50",
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="pt-4">
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium",
              isActive ? "bg-brand text-onbrand" : "text-navy-600 hover:bg-navy-50",
            )
          }
        >
          <Settings className="h-4 w-4" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
