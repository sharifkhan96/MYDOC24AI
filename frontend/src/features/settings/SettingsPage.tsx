import { Monitor, Moon, Sun } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { updateMe, type Region } from "@/api/auth";
import { useAuth } from "@/features/auth/AuthContext";
import { useTheme, type ThemePreference } from "@/features/theme/ThemeContext";

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { preference, setPreference } = useTheme();
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [region, setRegion] = useState<Region>(user?.region ?? "OTHER");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await updateMe({ first_name: firstName, last_name: lastName, region });
    await refreshUser();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how MyDoc24 looks on this device.</CardDescription>
        </CardHeader>
        <div className="flex gap-2">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setPreference(value)}
              className={`flex flex-1 flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
                preference === value
                  ? "border-navy-700 bg-brand text-onbrand"
                  : "border-navy-100 text-navy-600 hover:bg-navy-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your details</CardTitle>
          <CardDescription>Region determines which health system connections are relevant to you.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-navy-600">First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-navy-600">Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-600">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as Region)}
              className="w-full rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
            >
              <option value="UK">United Kingdom</option>
              <option value="US">United States</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <Button type="submit">Save changes</Button>
          {saved && <p className="text-sm text-sage-600">Saved.</p>}
        </form>
      </Card>
    </div>
  );
}
