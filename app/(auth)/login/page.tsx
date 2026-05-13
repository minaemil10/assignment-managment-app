"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/shared/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  // State variables to hold what the user types
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Stop the page from reloading
    
    // Call next-auth's signIn function
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // We handle the redirect ourselves
    });

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      // If success, go to the homepage ('/').
      // Remember our 'middleware.ts'? It will instantly redirect the user 
      // from '/' to their correct dashboard!
      router.push("/");
      router.refresh(); 
    }
  };

  const inputClass = "w-full px-3 py-2 border border-border bg-input rounded focus:outline-none focus:ring-2 focus:ring-ring text-foreground";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full bg-card rounded-lg shadow-md border border-border p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-foreground">Login</h2>
        
        {/* Show error message if login fails */}
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
            <input 
              type="email" 
              required
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
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded hover:bg-primary/90 transition duration-200"
          >
            Sign In
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account? <a href="/signup" className="text-primary hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}
