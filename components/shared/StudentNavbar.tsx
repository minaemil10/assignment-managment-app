import Link from "next/link";
import { auth } from "@/auth";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "./ThemeToggle";

export default async function StudentNavbar() {
  const session = await auth();
  const userName = session?.user?.name || "Student";
  const userEmail = session?.user?.email || "";

  // Get initials for a nice avatar circle
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Left Side: Logo and Links */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-2xl font-black text-primary tracking-tighter">
              AMS
            </Link>
            <div className="hidden md:flex gap-1">
              <Link href="/dashboard" className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-all">
                Dashboard
              </Link>
              <Link href="/courses" className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-all">
                Course Catalog
              </Link>
            </div>
          </div>

          {/* Right Side: User Info & Logout */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 border-r border-border pr-6 hidden sm:flex">
              <div className="text-right">
                <p className="text-sm font-bold text-foreground leading-none">{userName}</p>
                <p className="text-[10px] text-muted-foreground/70 font-medium mt-1 uppercase tracking-wider">Student Account</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-black shadow-md">
                {initials.slice(0, 2)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}
