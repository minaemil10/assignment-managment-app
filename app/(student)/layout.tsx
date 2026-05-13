import StudentNavbar from "@/components/shared/StudentNavbar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudentNavbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
