import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { useAuth } from "./AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({ email, password, first_name: firstName, last_name: lastName });
      navigate("/app/dashboard");
    } catch {
      setError("We couldn't create that account. The email may already be in use.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl font-semibold text-navy-700">MyDoc24</h1>
          <p className="mt-1 text-sm text-navy-400">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl2 border border-navy-100 bg-cream-100 text-navy-700 p-6 shadow-card">
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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-navy-100 bg-cream-100 text-navy-700 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-urgent-emergency">{error}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-navy-400">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-navy-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
