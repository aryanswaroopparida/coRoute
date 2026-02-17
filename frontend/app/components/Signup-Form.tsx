"use client";
import React from "react";
import { Label } from "@/app/components/Label";
import { Input } from "@/app/components/Input";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function SignupFormDemo({ login = false }: { login: Boolean }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");
  };
  return (
    <div className="min-h-screen w-full bg-neutral-100 dark:bg-black flex items-center justify-center px-4">
      <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900 md:grid-cols-2">
        {/* LEFT SIDE – Image / Branding */}
        <div className="relative hidden md:flex items-center justify-center bg-linear-to-br from-blue-600 to-indigo-700 p-10 text-white">
          <div className="relative z-10 max-w-sm space-y-6">
            <Image
              src={login ? "/logo.png" : "/logo2.png"}
              alt="CoRoute Logo"
              width={800}
              height={800}
              className={login ? "rounded-lg" : "rounded-full"}
            />

            <h2 className="text-3xl font-bold leading-tight">
              Travel Smarter. Share Better.
            </h2>

            <p className="text-white/80 text-sm leading-relaxed">
              CoRoute connects people heading to the same destination so they
              can reduce costs, lower emissions, and build smarter commuting
              networks.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE – Form */}
        <div className="flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">
              Welcome to CoRoute
            </h2>

            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {login ? "Sign In" : "Sign Up"} to continue
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              {!login && (
                <>
                  <div className="flex flex-col gap-4 md:flex-row">
                    <LabelInputContainer>
                      <Label htmlFor="firstname">First name</Label>
                      <Input id="firstname" placeholder="John" type="text" />
                    </LabelInputContainer>

                    <LabelInputContainer>
                      <Label htmlFor="lastname">Last name</Label>
                      <Input id="lastname" placeholder="Doe" type="text" />
                    </LabelInputContainer>
                  </div>

                  <LabelInputContainer>
                    <Label htmlFor="phonenumber">Phone Number</Label>
                    <Input
                      id="phonenumber"
                      placeholder="9876543210"
                      type="number"
                    />
                  </LabelInputContainer>
                </>
              )}

              <LabelInputContainer>
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="you@example.com" type="email" />
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="password">Password</Label>
                <Input id="password" placeholder="••••••••" type="password" />
              </LabelInputContainer>

              {!login && (
                <LabelInputContainer>
                  <Label htmlFor="reenterpassword">Confirm Password</Label>
                  <Input
                    id="reenterpassword"
                    placeholder="••••••••"
                    type="password"
                  />
                </LabelInputContainer>
              )}

              <button
                className="mt-4 w-full rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 py-2.5 font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98]"
                type="submit"
              >
                {login ? "Sign In" : "Create Account"} →
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-linear-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
