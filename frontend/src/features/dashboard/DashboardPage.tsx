import { Activity, BrainCircuit, ClipboardPlus, Heart, MessageCircle, Pill, ScanLine, Stethoscope, Video } from "lucide-react";
import { Link } from "react-router-dom";

import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/features/auth/AuthContext";
import { CheckInChart } from "@/features/lifestyle/CheckInChart";

const QUICK_LINKS = [
  { to: "/app/appointment-prep", label: "Prepare for an appointment", description: "Bring your health record and recent updates together for a clinician.", icon: ClipboardPlus },
  { to: "/app/symptom-check", label: "Check a symptom", description: "Describe what's going on and get a triaged next step.", icon: Stethoscope },
  { to: "/app/uploads", label: "Review a photo or test", description: "Upload a skin photo or a lab report for a structured read.", icon: ScanLine },
  { to: "/app/live-doctor", label: "Talk to a live doctor", description: "Start a spoken consultation with a doctor or nurse persona.", icon: Video },
  { to: "/app/medications", label: "Look up a medication", description: "Dosing, interactions, and what to do about a missed dose.", icon: Pill },
  { to: "/app/health-profile", label: "Your health profile", description: "Conditions, allergies, and medications you've told us about.", icon: Heart },
  { to: "/app/memory", label: "Health memory", description: "See the facts a saved chat can use and how they are retrieved.", icon: BrainCircuit },
  { to: "/app/chats", label: "Your chats", description: "Continue a saved conversation or start a private one-off chat.", icon: MessageCircle },
];

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Welcome back{user?.first_name ? `, ${user.first_name}` : ""}</h1>
        <p className="mt-1 text-navy-400">Here's where you left off, and where you might want to go next.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map(({ to, label, description, icon: Icon }) => (
          <Link key={to} to={to}>
            <Card className="h-full transition-shadow hover:shadow-lg">
              <Icon className="mb-3 h-5 w-5 text-sage-600" />
              <CardTitle>{label}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </Card>
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <Card className="border-sage-100 bg-sage-100/40">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 shrink-0 text-sage-600" />
            <p className="text-sm text-navy-600">
              Take the lifestyle assessment to get a personalized read on your habits and a few concrete
              suggestions.{" "}
              <Link to="/app/lifestyle" className="font-medium underline">
                Start it now
              </Link>
              .
            </p>
          </div>
          <div className="mt-4">
            <CheckInChart variant="compact" />
          </div>
        </Card>
      </div>
    </div>
  );
}
