import { Outlet } from "react-router-dom";

import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopNav />
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
