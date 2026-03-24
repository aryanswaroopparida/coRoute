"use client";
import HeroSectionOne from "@/app/components/Hero-Section";
import { FloatingNav } from "./components/Navbar";
import { navbarType } from "./types/components/navbar";
// import { GlobeDemo } from "./components/GlobeDemo";
// import { FocusCards } from "./components/Focus-Cards";
import { card } from "./types/components/card";
import { EncryptedText } from "@/app/components/encrypted-text";
import { TypewriterEffect } from "./components/typewriter-effect";
// import { GlowingEffectDemoSecond } from "./components/glowing-effect-use";
// import { Cover } from "./components/cover";
import { AnimatedTestimonials } from "./components/animated-testimonials";
import { Vortex } from "./components/vortex";
// import { DottedGlowBackground } from "./components/dotted-glow-background";
import { BackgroundLines } from "./components/background-lines";
// import { GoogleGeminiEffect } from "./components/google-gemini-effect";
import { useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export default function Home() {
  const navBarOptions: navbarType[] = [
    {
      name: "About",
      link: "#about",
    },
    // {
    //   name: "Vision",
    //   link: "#vision",
    // },
    {
      name: "Testimonials",
      link: "#testimonials",
    },
    {
      name: "Signup",
      link: "/signup",
    },
  ];

  // const Cards: card[] = [
  //   {
  //     title: "Product 1",
  //     src: "https://cdn.pixabay.com/photo/2025/11/24/11/00/burano-9973925_1280.jpg",
  //   },
  //   {
  //     title: "Product 2",
  //     src: "https://cdn.pixabay.com/photo/2025/11/24/11/00/burano-9973925_1280.jpg",
  //   },
  //   {
  //     title: "Product 3",
  //     src: "https://cdn.pixabay.com/photo/2025/11/24/11/00/burano-9973925_1280.jpg",
  //   },
  // ];
  const words = [
    {
      text: "Think",
      className: "text-white dark:text-blue-500",
    },
    {
      text: "CoRoute",
      className: "text-white dark:text-blue-500",
    },
    {
      text: "for",
      className: "text-white dark:text-blue-500",
    },
    {
      text: "Smarter Travels.",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];

  const testimonials = [
    {
      quote:
        "Finding someone going from campus to Warangal railway station used to be a struggle, especially during holidays. With CoRoute, I matched with two seniors heading the same way and split the cab fare easily.",
      name: "Ganesh Revanth",
      designation: "B.Tech CSE, NIT Warangal",
      src: "./ganesh.jpg",
    },
    {
      quote:
        "Auto fares near the campus gate can be unpredictable. Now I just check CoRoute and usually find someone going towards Hanamkonda or Kazipet. It’s convenient and way more affordable.",
      name: "N. Sriharsha",
      designation: "B.Tech CSE, NIT Warangal",
      src: "./harsha.jpg",
    },
    {
      quote:
        "During fest season and exam breaks, transport gets chaotic. CoRoute helped me coordinate rides with hostel mates and even meet students from other branches.",
      name: "Atulya Prashad",
      designation: "B.Tech CSE, NIT Warangal",
      src: "./atulya.jpg",
    },
    {
      quote:
        "I use CoRoute whenever I travel to Hyderabad airport. Sharing the ride from campus makes long-distance travel cheaper and less stressful.",
      name: "Aryan Swaroop",
      designation: "B.Tech CSE, NIT Warangal",
      src: "./aryan.jpg",
    },
    {
      quote:
        "It’s not just about saving money — it feels safer traveling with fellow NITW students. The campus-based matching makes it trustworthy.",
      name: "Manav Tejani",
      designation: "B.Tech CSE, NIT Warangal",
      src: "./manav.jpg",
    },
  ];

  // const ref = useRef(null);
  // const { scrollYProgress } = useScroll({
  //   target: ref,
  //   offset: ["start end", "end start"],
  // });

  // const pathLengthFirst = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  // const pathLengthSecond = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  // const pathLengthThird = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  // const pathLengthFourth = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  // const pathLengthFifth = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <>
      {/* <GlobeDemo /> */}
      <FloatingNav navItems={navBarOptions} />
      <Vortex
        backgroundColor="black"
        rangeY={800}
        particleCount={500}
        baseHue={120}
        className="flex items-center flex-col justify-center px-2 md:px-10  py-4 w-full h-full min-h-screen"
      >
        {/* <div
          className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed"
          style={{ backgroundImage: `url('/frontbackground.png')` }}
        > */}
        {/* <div className="flex items-center justify-center min-h-90"> */}
        <EncryptedText
          text="Smart, reliable, and trusted ride-sharing for every journey."
          flipDelayMs={50}
          className="text-center text-white p-4"
        />
        {/* </div> */}
        <TypewriterEffect words={words} />
        {/* </div> */}
      </Vortex>
      <HeroSectionOne />
      {/* <div className="relative w-full overflow-hidden">
        <DottedGlowBackground
          className="
      pointer-events-none
      absolute inset-0
      z-0
      mask-radial-to-80%
      mask-radial-at-center
    "
          opacity={1}
          gap={9}
          radius={1.8}
          colorLightVar="--color-neutral-500"
          glowColorLightVar="--color-neutral-600"
          colorDarkVar="--color-neutral-500"
          glowColorDarkVar="--color-sky-800"
          backgroundOpacity={0}
          speedMin={0.3}
          speedMax={1}
          speedScale={1}
        />
        <div id="products" className="relative z-10">
          <FocusCards cards={Cards} />
        </div>
      </div> */}

      {/* <div id="recognitions" className="m-20">
        <h1 className="text-4xl font-extrabold px-2 pt-4 text-center pb-4">
          Recognitions
        </h1>
        <GlowingEffectDemoSecond />
      </div> */}
      {/* <div
        id="vision"
        ref={ref}
        className="relative h-45 w-full bg-black overflow-hidden"
      >
        <GoogleGeminiEffect
          pathLengths={[
            pathLengthFirst,
            pathLengthSecond,
            pathLengthThird,
            pathLengthFourth,
            pathLengthFifth,
          ]}
        />
      </div> */}
      <div id="testimonials">
        <BackgroundLines className="relative flex items-center justify-center w-full flex-col px-4 overflow-hidden">
          <h2 className="bg-clip-text text-transparent text-center bg-linear-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-4xl font-bold tracking-tight z-20">
            Testimonials
          </h2>
          <AnimatedTestimonials testimonials={testimonials} />
        </BackgroundLines>
      </div>
    </>
  );
}
