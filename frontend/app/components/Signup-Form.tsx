"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/app/components/Label";
import { Input } from "@/app/components/Input";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { nitwEmailRegex } from "../lib/utils";

export default function SignupFormDemo({ login = false }: { login: boolean }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRePassword] = useState("");

  const [emailError, setEmailError] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email validation
  useEffect(() => {
    if (!email) {
      setEmailError(null);
      return;
    }

    if (!nitwEmailRegex.test(email)) {
      setEmailError("Only NITW student emails are allowed");
    } else {
      setEmailError(null);
    }
  }, [email]);

  // Form validation
  useEffect(() => {
    if (login) {
      setIsButtonDisabled(!(email && password && !emailError));
    } else {
      setIsButtonDisabled(
        !(
          name &&
          email &&
          password &&
          repassword &&
          password === repassword &&
          !emailError
        ),
      );
    }
  }, [name, email, password, repassword, login, emailError]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (emailError) return;

    try {
      setLoading(true);
      setError(null);

      const url = login ? "/api/auth/signin" : "/api/auth/signup";

      const payload = login ? { email, password } : { name, email, password };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-100 dark:bg-black flex items-center justify-center px-4">
      <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900 md:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="relative hidden md:flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-white">
          <div className="relative z-10 max-w-sm space-y-6">
            <Image
              src={login ? "/logo.png" : "/logo2.png"}
              alt="CoRoute Logo"
              width={300}
              height={300}
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

        {/* RIGHT SIDE */}
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
                <LabelInputContainer>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </LabelInputContainer>
              )}

              <LabelInputContainer>
                <Label htmlFor="email">NITW Email</Label>
                <Input
                  id="email"
                  placeholder="as25csb1a21@student.nitw.ac.in"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                />
              </LabelInputContainer>

              {emailError && (
                <p className="text-sm text-red-500">{emailError}</p>
              )}

              <LabelInputContainer>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </LabelInputContainer>

              {!login && (
                <LabelInputContainer>
                  <Label htmlFor="reenterpassword">Confirm Password</Label>
                  <Input
                    id="reenterpassword"
                    placeholder="••••••••"
                    type="password"
                    value={repassword}
                    onChange={(e) => setRePassword(e.target.value)}
                  />
                </LabelInputContainer>
              )}

              {!login && repassword && password !== repassword && (
                <p className="text-sm text-red-500">Passwords do not match</p>
              )}

              <button
                className="mt-4 w-full rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 py-2.5 font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isButtonDisabled || loading}
              >
                {loading
                  ? "Processing..."
                  : login
                    ? "Sign In"
                    : "Create Account"}{" "}
                →
              </button>

              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

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
