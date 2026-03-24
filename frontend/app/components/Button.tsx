"use client";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
};

export default function Button({ children, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-2 rounded-md text-sm transition border border-[#30363d]"
    >
      {children}
    </button>
  );
}