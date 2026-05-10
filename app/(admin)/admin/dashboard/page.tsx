import { auth } from "@/auth";

export default async function AdminDashboard() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <header className="bg-gray-800 shadow rounded-lg p-6 mb-6 border border-gray-700">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">System Administrator: {session?.user?.name}</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700 text-center">
            <h3 className="text-gray-400 font-medium">Total Users</h3>
            <p className="text-3xl font-bold text-white mt-2">1</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700 text-center">
            <h3 className="text-gray-400 font-medium">Departments</h3>
            <p className="text-3xl font-bold text-white mt-2">3</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700 text-center">
            <h3 className="text-gray-400 font-medium">Pending Requests</h3>
            <p className="text-3xl font-bold text-yellow-500 mt-2">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
