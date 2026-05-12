import { auth } from "@/auth";
import { query } from "@/lib/db";

export default async function AdminDashboard() {
  const session = await auth();

  // Fetch live stats from the database
  const userRes = await query("SELECT COUNT(*) FROM users");
  const deptRes = await query("SELECT COUNT(*) FROM departments");
  const courseRes = await query("SELECT COUNT(*) FROM courses");

  const totalUsers = userRes.rows[0].count;
  const totalDepts = deptRes.rows[0].count;
  const totalCourses = courseRes.rows[0].count;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {session?.user?.name}</h1>
        <p className="text-gray-500 mt-1">Here is what is happening across the university system today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-4">👥</div>
          <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">Total Users</h3>
          <p className="text-4xl font-extrabold text-gray-900 mt-2">{totalUsers}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mb-4">🏢</div>
          <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">Departments</h3>
          <p className="text-4xl font-extrabold text-gray-900 mt-2">{totalDepts}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl mb-4">📚</div>
          <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">Total Courses</h3>
          <p className="text-4xl font-extrabold text-gray-900 mt-2">{totalCourses}</p>
        </div>
      </div>

      {/* Quick Actions / Tips */}
      <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-100">
        <h3 className="text-blue-800 font-bold mb-2">Admin Tip</h3>
        <p className="text-blue-700 text-sm">
          You can manage sections and assign coordinators directly from the <strong>Courses</strong> detail page. 
          New coordinator signups will appear in the <strong>Requests</strong> tab for your approval.
        </p>
      </div>
    </div>
  );
}
