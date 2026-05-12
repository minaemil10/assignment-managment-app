"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/shared/ThemeToggle";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleRequested, setRoleRequested] = useState("STUDENT");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name, 
        email, 
        password,
        role_requested: roleRequested
      }),
    });

    if (res.ok) {
      if (roleRequested === "COORDINATOR") {
        setIsSuccess(true);
      } else {
        router.push("/login");
      }
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
  };

  const inputClass = "w-full px-3 py-2 border border-border bg-input rounded focus:ring-2 focus:ring-ring outline-none text-foreground placeholder-muted-foreground";

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="max-w-md w-full bg-card rounded-xl shadow-lg border border-border p-8 text-center">
          <div className="text-5xl mb-4">📩</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Request Sent!</h2>
          <p className="text-muted-foreground mb-6">
            Your request to become a <strong className="text-foreground">Coordinator</strong> has been sent to the system administrator. 
            You will be able to log in once your account is approved.
          </p>
          <button 
            onClick={() => router.push("/login")}
            className="w-full bg-primary text-primary-foreground font-bold py-2 rounded hover:bg-primary/90 transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full bg-card border border-border rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-foreground">Create Account</h2>
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded mb-4 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
            <input 
              type="text" 
              required
              placeholder="Enter your name"
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
            <input 
              type="email" 
              required
              placeholder="email@university.edu"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-muted-foreground mb-2">I am signing up as a:</label>
            <div className="flex gap-4">
              <label className={`flex-1 flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition ${roleRequested === 'STUDENT' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                <input type="radio" className="hidden" name="role" value="STUDENT" checked={roleRequested === 'STUDENT'} onChange={(e) => setRoleRequested(e.target.value)} />
                <span className="text-xl mb-1">🎓</span>
                <span className="text-sm font-bold">Student</span>
              </label>
              <label className={`flex-1 flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition ${roleRequested === 'COORDINATOR' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                <input type="radio" className="hidden" name="role" value="COORDINATOR" checked={roleRequested === 'COORDINATOR'} onChange={(e) => setRoleRequested(e.target.value)} />
                <span className="text-xl mb-1">👨‍🏫</span>
                <span className="text-sm font-bold">Coordinator</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition shadow-md mt-4"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <a href="/login" className="text-primary font-bold hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
}
