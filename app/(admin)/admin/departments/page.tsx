"use client"; // This tells Next.js this is a Client Component, allowing us to use React hooks like useState

import { useState, useEffect } from "react";
import { Department } from "@/types/models"; // We import the shared interface!

export default function DepartmentsPage() {
  // --- STATE ---
  // We use useState to hold the data we get from the API
  const [departments, setDepartments] = useState<Department[]>([]);
  // We use useState to track what the user types into the input box
  const [newDeptName, setNewDeptName] = useState("");
  // We use useState to show error messages
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // --- FUNCTIONS ---
  // 1. Function to fetch all departments from our API route
  const fetchDepartments = async () => {
    const res = await fetch("/api/departments");
    if (res.ok) {
      const data = await res.json();
      setDepartments(data); // Save the data to our state!
    }
  };

  // 2. useEffect runs automatically right when the page loads for the first time
  useEffect(() => {
    fetchDepartments();
  }, []);

  // 3. Function to handle what happens when they click "Add"
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Stop the browser from refreshing the page completely
    setError(""); // Clear old errors

    // Send a POST request to our API with the new department name
    const res = await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newDeptName }),
    });

    if (res.ok) {
      // Success!
      setNewDeptName(""); // Empty the input box
      fetchDepartments(); // Re-fetch the list so the new department appears instantly!
    } else {
      // Failure
      const data = await res.json();
      setError(data.error || "Failed to add department");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this department? This will also delete all terms associated with it.");
    if (!confirmed) return;

    setIsDeleting(id);
    const res = await fetch(`/api/departments/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchDepartments();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete department");
    }
    setIsDeleting(null);
  };

  // --- UI RENDER ---
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Manage Departments</h1>

      {/* The Form to add a new department */}
      <div className="bg-accent/30 p-6 rounded-lg border border-border mb-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Add New Department</h2>
        
        {/* If there's an error, print it here */}
        {error && <p className="text-destructive mb-4 bg-destructive/10 p-3 rounded">{error}</p>}
        
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            required
            placeholder="e.g., Software Engineering"
            className="border border-border bg-input p-2 rounded flex-1 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)} // Update state as they type
          />
          <button 
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 px-6 rounded transition"
          >
            Add
          </button>
        </form>
      </div>

      {/* The Table to display existing departments */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-accent/50 border-b border-border">
              <th className="p-4 text-muted-foreground font-semibold w-24">ID</th>
              <th className="p-4 text-muted-foreground font-semibold">Department Name</th>
              <th className="p-4 text-muted-foreground font-semibold w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-muted-foreground">
                  No departments found. Loading...
                </td>
              </tr>
            ) : (
              // We loop through the departments state and render a row for each one
              departments.map((dept) => (
                <tr key={dept.id} className="border-b border-border hover:bg-accent/30">
                  <td className="p-4 text-muted-foreground">#{dept.id}</td>
                  <td className="p-4 font-medium text-foreground">{dept.name}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(dept.id)}
                      disabled={isDeleting === dept.id}
                      className="text-destructive hover:text-destructive/80 font-medium transition disabled:opacity-50"
                    >
                      {isDeleting === dept.id ? "..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
