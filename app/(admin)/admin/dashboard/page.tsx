import { auth } from "@/auth";
import { query } from "@/lib/db";

export default async function AdminDashboard() {
  const session = await auth();

  // Fetch actual stats from the database
  let totalUsers = 0;
  let totalDepartments = 0;
  let pendingRequests = 0;

  try {
    const [usersRes, deptsRes, requestsRes] = await Promise.all([
      query("SELECT COUNT(*) FROM users"),
      query("SELECT COUNT(*) FROM departments"),
      query("SELECT COUNT(*) FROM coordinator_requests WHERE status = 'PENDING'")
    ]);

    totalUsers = parseInt(usersRes.rows[0].count, 10);
    totalDepartments = parseInt(deptsRes.rows[0].count, 10);
    pendingRequests = parseInt(requestsRes.rows[0].count, 10);
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">System Administrator: {session?.user?.name}</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-accent/50 p-6 rounded-lg border border-border text-center">
            <h3 className="text-muted-foreground font-medium">Total Users</h3>
            <p className="text-3xl font-bold text-foreground mt-2">{totalUsers}</p>
          </div>
          <div className="bg-accent/50 p-6 rounded-lg border border-border text-center">
            <h3 className="text-muted-foreground font-medium">Departments</h3>
            <p className="text-3xl font-bold text-foreground mt-2">{totalDepartments}</p>
          </div>
          <div className="bg-accent/50 p-6 rounded-lg border border-border text-center">
            <h3 className="text-muted-foreground font-medium">Pending Requests</h3>
            <p className="text-3xl font-bold text-yellow-500 mt-2">{pendingRequests}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
