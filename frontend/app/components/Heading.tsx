import React from "react";
import localFont from "next/font/local";
import { twMerge } from "tailwind-merge";

const CalSans = localFont({
  src: [{ path: "../../fonts/CalSans-SemiBold.woff2" }],
  display: "swap",
});

type HeadingProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

export const Heading = <T extends React.ElementType = "h1">({
  as,
  className,
  children,
  ...props
}: HeadingProps<T>) => {
  const Component = (as || "h1") as React.ElementType<React.ComponentProps<T>>;

  return (
    <h1
      className={twMerge(
        CalSans.className,
        "text-base md:text-xl lg:text-4xl font-semibold bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
};
