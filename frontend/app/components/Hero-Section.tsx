"use client";

import { motion, useInView } from "motion/react";
import { useState, useRef } from "react";
import Image from "next/image";

export default function HeroSectionOne() {
  const [isExpanded, setIsExpanded] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true, // animation runs only once
  });

  return (
    <div
      id="about"
      className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center"
    >
      <Navbar />

      {/* Decorative Borders */}
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute top-0 h-40 w-px bg-linear-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute h-40 w-px bg-linear-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute mx-auto h-px w-40 bg-linear-to-r from-transparent via-blue-500 to-transparent" />
      </div>

      <div className="px-4 py-2 md:py-10">
        {/* Animated Title */}
        <h1
          ref={ref}
          className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300"
        >
          {"Trusted Platform for Smarter Shared Travel"
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={
                  isInView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}
                }
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
        </h1>

        {/* Content Container */}
        <div className="relative mx-auto max-w-5xl px-6 py-12">
          <motion.div
            animate={{ height: "auto" }}
            transition={{ duration: 0.4 }}
            className={`relative overflow-hidden p-8 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/60 ${
              !isExpanded ? "line-clamp-6" : ""
            }`}
          >
            <div className="space-y-6 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
              {/* Highlighted Intro */}
              <div className="rounded-2xl bg-linear-to-r from-orange-500/10 to-blue-500/10 p-6 dark:from-orange-400/10 dark:to-blue-400/10">
                <p className="text-xl font-semibold text-neutral-900 dark:text-white">
                  CoRoute connects people traveling to the same destination so
                  they can share rides, reduce costs, and travel smarter.
                </p>
                <p className="mt-3 font-medium">
                  We combine real-time location intelligence with seamless
                  communication to make coordinated commuting effortless.
                </p>
                <p className="mt-3 font-medium">
                  Our mission is simple: fewer empty seats, lower travel
                  expenses, and more meaningful connections on the road.
                </p>
              </div>

              <p>
                CoRoute is a location-aware ride coordination platform designed
                to intelligently match individuals heading toward the same or
                nearby destinations within a defined geographic radius. Whether
                commuting to work, attending an event, or traveling across the
                city, CoRoute ensures that unused vehicle capacity becomes
                opportunity rather than inefficiency.
              </p>

              <p>
                At its core, CoRoute leverages precise geospatial indexing and
                real-time availability signals to identify compatible routes. By
                analyzing origin points, destination vectors, timing
                constraints, and route overlap, the platform connects users
                whose journeys align.
              </p>

              {/* Section Divider */}
              <div className="pt-4">
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  Our Core Principles
                </h3>
                <div className="mt-2 h-1 w-16 rounded-full bg-linear-to-r from-orange-500 to-blue-500"></div>
              </div>

              {/* Principles */}
              <div className="space-y-6">
                <div className="rounded-xl border border-neutral-200 p-5 transition hover:shadow-md dark:border-neutral-800">
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    1. Cost Efficiency
                  </h4>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    Shared travel reduces fuel expenses and overall
                    transportation costs while maintaining convenience and route
                    efficiency.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 p-5 transition hover:shadow-md dark:border-neutral-800">
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    2. Environmental Responsibility
                  </h4>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    Optimized seat utilization reduces redundant vehicle usage,
                    fuel consumption, congestion, and carbon emissions.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 p-5 transition hover:shadow-md dark:border-neutral-800">
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    3. Seamless Connectivity
                  </h4>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    Real-time messaging and dynamic route visibility allow users
                    to coordinate smoothly and securely.
                  </p>
                </div>
              </div>

              <p>
                Our system is built for scalability, reliability, and
                low-latency coordination. Privacy and authenticated access
                controls remain foundational to our architecture.
              </p>

              <p className="text-lg font-semibold text-center text-neutral-900 dark:text-white">
                Connect. Share. Ride Together.
              </p>
            </div>
          </motion.div>

          {/* Read More Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="group relative flex items-center gap-2 rounded-full bg-linear-to-r from-orange-500 to-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <span>{isExpanded ? "Read Less" : "Read More"}</span>
              <motion.span
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="inline-block"
              >
                ↓
              </motion.span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const Navbar = () => {
  return (
    <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="CoRoute Logo"
          width={28}
          height={28}
          className="rounded-full object-cover"
        />
        <h1 className="text-base font-bold md:text-2xl">CoRoute</h1>
      </div>
    </nav>
  );
};
