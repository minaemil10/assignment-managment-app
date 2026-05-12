"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/shared/LogoutButton";
import ThemeToggle from "@/components/shared/ThemeToggle";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { name: "Departments", href: "/admin/departments", icon: "🏢" },
    { name: "Terms", href: "/admin/terms", icon: "📅" },
    { name: "Courses", href: "/admin/courses", icon: "📚" },
    { name: "Users", href: "/admin/users", icon: "👥" },
    { name: "Requests", href: "/admin/requests", icon: "📩" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - always dark */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed inset-y-0 shadow-xl">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold tracking-wider text-blue-400">ADMIN PANEL</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 flex items-center gap-2">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-4">
        <div className="bg-card text-card-foreground min-h-[calc(100vh-2rem)] rounded-2xl shadow-sm border border-border overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
