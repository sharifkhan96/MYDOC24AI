import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { useAuth } from "./AuthContext";

export function LoginPage() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/app/dashboard");
    } catch {
      setError("That email and password combination doesn't match an account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDemoLogin() {
    setError(null);
    setIsSubmitting(true);
    try {
      await demoLogin();
      navigate("/app/dashboard");
    } catch {
      setError("Demo sign-in is unavailable. Check that the local backend is running in debug mode.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl font-semibold text-navy-700">MyDoc24</h1>
          <p className="mt-1 text-sm text-navy-400">Your health, understood.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl2 border border-navy-100 bg-cream-100 text-navy-700 p-6 shadow-card">
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-600">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-urgent-emergency">{error}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
          <Button type="button" variant="secondary" disabled={isSubmitting} className="w-full" onClick={handleDemoLogin}>
            Continue as demo user
          </Button>
        </form>
        <p className="mt-3 text-center text-xs text-navy-400">Available only in the local development environment.</p>
        <p className="mt-6 text-center text-sm text-navy-400">
          New to MyDoc24?{" "}
          <Link to="/register" className="font-medium text-navy-700 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
