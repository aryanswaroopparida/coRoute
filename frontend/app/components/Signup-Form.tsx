"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/app/components/Label";
import { Input } from "@/app/components/Input";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { nitwEmailRegex } from "../lib/utils";

type Step = "details" | "otp" | "password";

export default function SignupFormDemo({ login = false }: { login: boolean }) {
  const router = useRouter();

  const [step, setStep] = useState<Step>("details");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRePassword] = useState("");
  const [gender, setGender] = useState<"girls" | "boys" | "">("");

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

  // Button state logic
  useEffect(() => {
    if (login) {
      setIsButtonDisabled(!(email && password && !emailError));
      return;
    }

    if (step === "details") {
      setIsButtonDisabled(!(name && email && gender && !emailError));
      return;
    }

    if (step === "otp") {
      setIsButtonDisabled(!(otp.length >= 6));
      return;
    }

    if (step === "password") {
      setIsButtonDisabled(!(password && repassword && password === repassword));
      return;
    }
  }, [name, email, password, repassword, otp, login, emailError, step, gender]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      // LOGIN FLOW
      if (login) {
        const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        router.push("/dashboard");
        return;
      }

      // STEP 1: SEND OTP
      if (step === "details") {
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, gender }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setStep("otp");
        return;
      }

      // STEP 2: VERIFY OTP
      if (step === "otp") {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setStep("password");
        return;
      }

      // STEP 3: FINAL SIGNUP
      if (step === "password") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, gender }),
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-100 dark:bg-black flex items-center justify-center px-4">
      <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900 md:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="relative hidden md:flex items-center justify-center bg-linear-to-br from-blue-600 to-indigo-700 p-10 text-white">
          <div className="relative z-10 max-w-sm space-y-6">
            <Image
              src="/logo.png"
              alt="CoRoute Logo"
              width={300}
              height={300}
              className="rounded-lg"
            />
            <h2 className="text-3xl font-bold leading-tight">
              Travel Smarter. Share Better.
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">
              CoRoute connects people heading to the same destination to reduce
              cost, emissions and improve commuting.
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
              {/* SIGNUP - DETAILS */}
              {!login && step === "details" && (
                <>
                  <LabelInputContainer>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="email">NITW Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    />
                  </LabelInputContainer>

                  {emailError && (
                    <p className="text-sm text-red-500">{emailError}</p>
                  )}

                  <LabelInputContainer>
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) =>
                        setGender(e.target.value as "girls" | "boys")
                      }
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="girls">Female</option>
                      <option value="boys">Male</option>
                    </select>
                  </LabelInputContainer>
                </>
              )}

              {/* OTP STEP */}
              {!login && step === "otp" && (
                <LabelInputContainer>
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6 digit code"
                  />
                </LabelInputContainer>
              )}

              {/* PASSWORD STEP */}
              {!login && step === "password" && (
                <>
                  <LabelInputContainer>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="repassword">Confirm Password</Label>
                    <Input
                      id="repassword"
                      type="password"
                      value={repassword}
                      onChange={(e) => setRePassword(e.target.value)}
                    />
                  </LabelInputContainer>

                  {repassword && password !== repassword && (
                    <p className="text-sm text-red-500">
                      Passwords do not match
                    </p>
                  )}
                </>
              )}

              {/* LOGIN */}
              {login && (
                <>
                  <LabelInputContainer>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    />
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </LabelInputContainer>
                </>
              )}

              <button
                className="mt-4 w-full rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 py-2.5 font-semibold text-white transition disabled:opacity-50"
                type="submit"
                disabled={isButtonDisabled || loading}
              >
                {loading
                  ? "Processing..."
                  : login
                    ? "Sign In"
                    : step === "details"
                      ? "Send OTP"
                      : step === "otp"
                        ? "Verify OTP"
                        : "Create Account"}
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
