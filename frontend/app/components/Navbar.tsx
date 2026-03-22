"use client";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { cn } from "@/app/lib/utils";
import { navbarType } from "../types/components/navbar";
import Link from "next/link";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: navbarType[];
  className?: string;
}) => {
  // const [visible, setVisible] = useState(true);

  // useEffect(() => {
  //   const handleMouseMove = (e: MouseEvent) => {
  //     // Show navbar when cursor is within 150px of the top
  //     // You can adjust this threshold value as needed
  //     if (e.clientY < 150) {
  //       setVisible(true);
  //     } else {
  //       setVisible(false);
  //     }
  //   };

  //   window.addEventListener("mousemove", handleMouseMove);

  //   return () => {
  //     window.removeEventListener("mousemove", handleMouseMove);
  //   };
  // }, []);

  return (
    <AnimatePresence>
      {
        <motion.div
          initial={{
            opacity: 0,
            y: -100,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          exit={{
            y: -100,
            opacity: 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className={cn(
            "flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-transparent dark:border-white/20 rounded-full dark:bg-black bg-white shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-5000 pr-2 pl-8 py-2 items-center justify-center space-x-4",
            className,
          )}
        >
          {navItems.map((navItem: navbarType, idx: number) => (
            <a
              key={`link=${idx}`}
              href={navItem.link}
              className={cn(
                "relative dark:text-neutral-50 items-center flex space-x-1 text-neutral-600 dark:hover:text-neutral-300 hover:text-neutral-500",
              )}
            >
              <span className="block sm:hidden">{navItem.icon}</span>
              <span className="hidden sm:block text-sm">{navItem.name}</span>
            </a>
          ))}
          <Link href={"/login"}>
            <button className="border text-sm font-medium relative border-neutral-200 dark:border-white/20 text-foreground dark:text-white px-4 py-2 rounded-full cursor-pointer">
              <span>Login</span>
              <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-linear-to-r from-transparent via-blue-500 to-transparent h-px" />
            </button>
          </Link>
        </motion.div>
      }
    </AnimatePresence>
  );
};
