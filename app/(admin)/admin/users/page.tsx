"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/models";

interface UserWithDept extends User {
  department_name: string | null;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithDept[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    if (res.ok) {
      setUsers(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUser = async (userId: number, data: Partial<User>) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      fetchUsers();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading Users...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-foreground">User Management</h1>

      <div className="bg-card rounded-xl overflow-hidden border border-border">
        <table className="w-full text-left">
          <thead className="bg-accent/50 border-b border-border">
            <tr>
              <th className="p-4 font-semibold text-muted-foreground">User</th>
              <th className="p-4 font-semibold text-muted-foreground">Role</th>
              <th className="p-4 font-semibold text-muted-foreground">Department</th>
              <th className="p-4 font-semibold text-muted-foreground">Status</th>
              <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-accent/30 transition">
                <td className="p-4">
                  <div className="font-bold text-foreground">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </td>
                <td className="p-4">
                  <select
                    className="border border-border rounded p-1 text-sm bg-input text-foreground"
                    value={user.role}
                    onChange={(e) => updateUser(user.id, { role: e.target.value as any })}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="COORDINATOR">Coordinator</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="p-4 text-muted-foreground text-sm">
                  {user.department_name || "N/A"}
                </td>
                <td className="p-4">
                  {user.is_active ? (
                    <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full text-xs font-bold uppercase">Active</span>
                  ) : (
                    <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full text-xs font-bold uppercase">Deactivated</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => updateUser(user.id, { is_active: !user.is_active })}
                    className={`text-sm font-bold px-3 py-1 rounded ${
                      user.is_active 
                        ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" 
                        : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    }`}
                  >
                    {user.is_active ? "Deactivate" : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
