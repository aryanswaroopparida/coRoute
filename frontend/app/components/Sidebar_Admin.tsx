"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconLayoutDashboard,
  IconMapPin,
  IconMessageCircle,
  IconUser,
  IconPlus,
  IconSettings,
  IconLogout,
  IconLayoutSidebarRightCollapse,
} from "@tabler/icons-react";
import { isMobile } from "@/app/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: IconLayoutDashboard },
  { label: "Find Matches", href: "/dashboard/match", icon: IconMapPin },
  { label: "My Rides", href: "/dashboard/rides", icon: IconPlus },
  { label: "Chat", href: "/dashboard/chat", icon: IconMessageCircle },
  { label: "Profile", href: "/dashboard/profile", icon: IconUser },
  { label: "Settings", href: "/dashboard/settings", icon: IconSettings },
];

export const Sidebar = () => {
  const [open, setOpen] = useState(isMobile() ? false : true);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: -200 }}
            animate={{ x: 0 }}
            exit={{ x: -200 }}
            transition={{ duration: 0.2 }}
            className="px-6 py-8 bg-white max-w-60 fixed lg:relative h-screen left-0 flex flex-col justify-between border-r"
          >
            <div className="flex-1 overflow-auto">
              <SidebarHeader />
              <Navigation setOpen={setOpen} />
            </div>

            {/* Logout Section */}
            <div
              className="flex items-center space-x-2 text-sm text-red-500 cursor-pointer hover:bg-red-50 p-2 rounded-md"
              onClick={() => {
                // call logout API
              }}
            >
              <IconLogout className="h-4 w-4" />
              <span>Logout</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Toggle */}
      <button
        className="fixed lg:hidden bottom-4 right-4 h-10 w-10 border rounded-full bg-white shadow flex items-center justify-center z-50"
        onClick={() => setOpen(!open)}
      >
        <IconLayoutSidebarRightCollapse className="h-5 w-5 text-black" />
      </button>
    </>
  );
};

const Navigation = ({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex flex-col space-y-1 my-10">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => isMobile() && setOpen(false)}
          className={twMerge(
            "flex items-center space-x-3 py-2 px-3 rounded-lg text-sm transition",
            isActive(item.href)
              ? "bg-blue-50 text-blue-600 font-semibold"
              : "hover:bg-gray-100 text-gray-700",
          )}
        >
          <item.icon
            className={twMerge(
              "h-4 w-4",
              isActive(item.href) && "text-blue-600",
            )}
          />
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );
};

const SidebarHeader = () => {
  return (
    <div className="flex items-center space-x-3">
      <Image
        src="/profile.png" // replace with logged-in user image
        alt="User Avatar"
        height={40}
        width={40}
        className="rounded-full object-cover"
      />
      <div className="flex flex-col">
        <p className="font-semibold text-sm">Swagat Parida</p>
        <p className="text-xs text-gray-500">NIT Warangal</p>
      </div>
    </div>
  );
};
