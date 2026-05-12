"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">📩</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Sent!</h2>
          <p className="text-gray-600 mb-6">
            Your request to become a <strong>Coordinator</strong> has been sent to the system administrator. 
            You will be able to log in once your account is approved.
          </p>
          <button 
            onClick={() => router.push("/login")}
            className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Create Account</h2>
        
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              placeholder="email@university.edu"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">I am signing up as a:</label>
            <div className="flex gap-4">
              <label className={`flex-1 flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition ${roleRequested === 'STUDENT' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}>
                <input type="radio" className="hidden" name="role" value="STUDENT" checked={roleRequested === 'STUDENT'} onChange={(e) => setRoleRequested(e.target.value)} />
                <span className="text-xl mb-1">🎓</span>
                <span className="text-sm font-bold">Student</span>
              </label>
              <label className={`flex-1 flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition ${roleRequested === 'COORDINATOR' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}>
                <input type="radio" className="hidden" name="role" value="COORDINATOR" checked={roleRequested === 'COORDINATOR'} onChange={(e) => setRoleRequested(e.target.value)} />
                <span className="text-xl mb-1">👨‍🏫</span>
                <span className="text-sm font-bold">Coordinator</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-md mt-4"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <a href="/login" className="text-blue-600 font-bold hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
}
