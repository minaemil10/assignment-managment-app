"use client";

import { useState, useEffect } from "react";

interface CoordinatorRequest {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  user_id: number;
  user_name: string;
  user_email: string;
  reviewed_by_name: string | null;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<CoordinatorRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    const res = await fetch("/api/requests");
    if (res.ok) {
      setRequests(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId: number, action: "APPROVED" | "REJECTED") => {
    const res = await fetch("/api/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: requestId, action }),
    });
    if (res.ok) {
      fetchRequests();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Requests...</div>;

  const pending = requests.filter(r => r.status === "PENDING");
  const history = requests.filter(r => r.status !== "PENDING");

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Coordinator Requests</h1>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4 text-orange-600 flex items-center gap-2">
          <span className="w-3 h-3 bg-orange-600 rounded-full animate-pulse"></span>
          Pending Requests ({pending.length})
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {pending.map((req) => (
            <div key={req.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500 flex justify-between items-center">
              <div>
                <p className="text-lg font-bold text-gray-900">{req.user_name}</p>
                <p className="text-gray-500">{req.user_email}</p>
                <p className="text-xs text-gray-400 mt-1">Requested on: {new Date(req.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(req.id, "REJECTED")}
                  className="px-4 py-2 text-red-600 font-bold hover:bg-red-50 rounded transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAction(req.id, "APPROVED")}
                  className="px-6 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 shadow-sm transition"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
          {pending.length === 0 && (
            <div className="bg-gray-50 p-8 rounded-lg border border-dashed border-gray-300 text-center text-gray-500">
              No pending requests at the moment.
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 text-gray-600">Request History</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-gray-600 font-semibold">User</th>
                <th className="p-4 text-gray-600 font-semibold">Status</th>
                <th className="p-4 text-gray-600 font-semibold">Reviewed By</th>
                <th className="p-4 text-gray-600 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((req) => (
                <tr key={req.id}>
                  <td className="p-4 text-gray-800">{req.user_name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      req.status === "APPROVED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">{req.reviewed_by_name || "System"}</td>
                  <td className="p-4 text-gray-500 text-sm">{new Date(req.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
