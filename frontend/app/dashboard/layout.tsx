"use client";

import { Sidebar } from "@/app/components/Sidebar_Admin";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 bg-card min-h-screen dark:bg-indigo-500/10 lg:rounded-tl-xl border border-border overflow-y-scroll max-h-screen">
        {children}
      </div>
    </div>
  );
}
