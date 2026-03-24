"use client";

export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
      {children}
    </div>
  );
}