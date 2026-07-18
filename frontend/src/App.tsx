import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/features/auth/AuthContext";
import { LoginPage } from "@/features/auth/LoginPage";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { ChatsPage } from "@/features/chats/ChatsPage";
import { ConnectionsPage } from "@/features/connections/ConnectionsPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { EncyclopediaPage } from "@/features/encyclopedia/EncyclopediaPage";
import { HealthProfilePage } from "@/features/health-profile/HealthProfilePage";
import { LifestylePage } from "@/features/lifestyle/LifestylePage";
import { LiveDoctorPage } from "@/features/live-doctor/LiveDoctorPage";
import { MedicationsPage } from "@/features/medications/MedicationsPage";
import { MeditationPage } from "@/features/meditation/MeditationPage";
import { PublicHealthPage } from "@/features/public-health/PublicHealthPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { SymptomCheckPage } from "@/features/symptom-check/SymptomCheckPage";
import { ThemeProvider } from "@/features/theme/ThemeContext";
import { UploadsPage } from "@/features/uploads/UploadsPage";
import { WellbeingPage } from "@/features/wellbeing/WellbeingPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/live-doctor"
                element={
                  <main className="min-h-screen bg-cream px-4 py-6 text-navy-700 sm:px-6 lg:px-10">
                    <div className="mx-auto max-w-6xl">
                      <LiveDoctorPage />
                    </div>
                  </main>
                }
              />

              <Route element={<ProtectedRoute />}>
                <Route path="/app" element={<AppShell />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="symptom-check" element={<SymptomCheckPage />} />
                  <Route path="uploads" element={<UploadsPage />} />
                  <Route path="medications" element={<MedicationsPage />} />
                  <Route path="live-doctor" element={<LiveDoctorPage />} />
                  <Route path="meditation" element={<MeditationPage />} />
                  <Route path="chats" element={<ChatsPage />} />
                  <Route path="health-profile" element={<HealthProfilePage />} />
                  <Route path="lifestyle" element={<LifestylePage />} />
                  <Route path="connections" element={<ConnectionsPage />} />
                  <Route path="public-health" element={<PublicHealthPage />} />
                  <Route path="encyclopedia" element={<EncyclopediaPage />} />
                  <Route path="wellbeing" element={<WellbeingPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
