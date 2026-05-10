import { auth } from "@/auth";

export default async function StudentDashboard() {
  // We can securely grab the logged-in user's data on the server!
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <header className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {session?.user?.name}!</p>
        </header>

        {/* Content Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Assignments</h2>
          <p className="text-gray-500">You haven't enrolled in any courses yet. Once you do, your assignments will appear here.</p>
        </div>
      </div>
    </div>
  );
}
