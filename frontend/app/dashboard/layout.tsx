import { Sidebar } from "@/app/components/Sidebar_Admin";
import { Footer } from "@/app/components/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="lg:pl-2 lg:pt-2 bg-gray-100 flex-1 overflow-y-auto">
        <div className="flex-1 bg-white min-h-screen lg:rounded-tl-xl border border-transparent lg:border-neutral-200 overflow-y-scroll max-h-screen">
          {children}
          <Footer />
        </div>
      </div>
    </div>
  );
}
