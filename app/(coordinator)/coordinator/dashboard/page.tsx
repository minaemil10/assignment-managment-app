import { auth } from "@/auth";
import LogoutButton from "@/components/shared/LogoutButton";

export default async function CoordinatorDashboard() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <header className="bg-white shadow rounded-lg p-6 mb-6 border-t-4 border-blue-500 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Coordinator Dashboard</h1>
            <p className="text-gray-600 mt-2">Hello, {session?.user?.name}</p>
          </div>
          <LogoutButton />
        </header>

        {/* Content Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">My Courses</h2>
          <p className="text-gray-500">You are not assigned to coordinate any courses yet.</p>
        </div>
      </div>
    </div>
  );
}
