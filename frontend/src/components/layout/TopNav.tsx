import { LogOut } from "lucide-react";

import { useAuth } from "@/features/auth/AuthContext";

export function TopNav() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-navy-100 bg-cream-100 px-6">
      <div>
        <p className="text-sm text-navy-400">Good to see you,</p>
        <p className="font-serif text-base font-medium text-navy-700">{user?.full_name ?? "there"}</p>
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy-600 hover:bg-navy-50"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </header>
  );
}
