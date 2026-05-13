import { auth } from "@/auth";

export default async function AdminDashboard() {
  const session = await auth();

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
            <p className="text-3xl font-bold text-foreground mt-2">1</p>
          </div>
          <div className="bg-accent/50 p-6 rounded-lg border border-border text-center">
            <h3 className="text-muted-foreground font-medium">Departments</h3>
            <p className="text-3xl font-bold text-foreground mt-2">3</p>
          </div>
          <div className="bg-accent/50 p-6 rounded-lg border border-border text-center">
            <h3 className="text-muted-foreground font-medium">Pending Requests</h3>
            <p className="text-3xl font-bold text-yellow-500 mt-2">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
