"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconMapPin,
  IconMessageCircle,
  IconUser,
  IconLogout,
  IconLayoutSidebarRightCollapse,
  IconSettings,
} from "@tabler/icons-react";
import { isMobile } from "@/app/lib/utils";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

const navItems = [
  // { label: "Dashboard", href: "/dashboard", icon: IconLayoutDashboard },
  { label: "Find Matches", href: "/dashboard", icon: IconMapPin },
  { label: "Profile", href: "/dashboard/profile", icon: IconUser },
  { label: "Chat", href: "/dashboard/my-chats", icon: IconMessageCircle },
  {
    label: "Change Password",
    href: "/dashboard/change-password",
    icon: IconSettings,
  },
  // { label: "Settings", href: "/dashboard/settings", icon: IconSettings },
];

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const current = theme === "system" ? resolvedTheme : theme;

  return (
    <button
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      className="px-3 py-1 rounded-md bg-muted text-foreground border border-border"
    >
      {current === "dark" ? "🌙" : "☀️"}
    </button>
  );
}

export const Sidebar = () => {
  const router = useRouter();
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
            className="px-6 py-8 max-w-60 fixed lg:relative h-screen left-0 flex flex-col justify-between border-r"
          >
            <div className="flex-1 overflow-auto">
              <SidebarHeader />
              <Navigation setOpen={setOpen} />
            </div>

            {/* Logout Section */}
            <div
              className="flex items-center space-x-2 text-sm text-red-500 cursor-pointer p-2 rounded-md"
              onClick={async () => {
                try {
                  await fetch("/api/protected/logout", {
                    method: "POST",
                    credentials: "include",
                  });
                  router.push("/");
                } catch (error) {
                  alert("Failed to log out");
                }
              }}
            >
              <IconLogout className="h-4 w-4" />
              <span>Logout</span>
            </div>
            <ThemeToggle />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Toggle */}
      <button
        className="fixed lg:hidden bottom-4 right-4 h-10 w-10 border rounded-full shadow flex items-center justify-center z-50"
        onClick={() => setOpen(!open)}
      >
        <IconLayoutSidebarRightCollapse className="h-5 w-5 text-foreground" />
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
          className={twMerge(
            "flex items-center space-x-3 py-2 px-3 rounded-lg text-sm transition",
            isActive(item.href)
              ? "bg-blue-50 text-blue-600 font-semibold"
              : "hover:bg-foreground hover:text-background",
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
  const [name, setName] = useState("");
  const [profile, setProfile] = useState("");
  useEffect(() => {
    try {
      (async () => {
        const res = await fetch("/api/protected/user");
        let jsonData = await res.json();
        console.log("jsonData :", jsonData);
        setName(jsonData.user.name);
        setProfile(jsonData.user.profilepic);
      })();
    } catch (error) {}
  }, []);
  return (
    <div className="flex items-center space-x-3">
      <Image
        src={
          profile
            ? profile
            : "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80"
        } // replace with logged-in user image
        alt="User Avatar"
        height={40}
        width={40}
        className="rounded-full object-cover"
      />
      <div className="flex flex-col">
        <p className="font-semibold text-sm">{name}</p>
        <p className="text-xs">NIT Warangal</p>
      </div>
    </div>
  );
};
