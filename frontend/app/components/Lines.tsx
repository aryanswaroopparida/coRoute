import { motion } from "framer-motion";

export const Lines = () => {
  return (
    <>
      {/* Blur Line */}
      <motion.div className="absolute right-1/2 bottom-1/2 bg-linear-to-b from-transparent to-cyan-500 translate-y-3.5 w-px h-40 blur-[2px]" />
      {/* Glow Line */}
      <motion.div className="absolute right-1/2 bottom-1/2 bg-linear-to-b from-transparent to-cyan-500 translate-y-3.5 w-px h-40 " />
      {/* Blur Circle */}
      <motion.div className="absolute right-1/2 translate-x-[1.5px] bottom-1/2 bg-cyan-600 translate-y-3.5 w-1 h-1 rounded-full z-40 blur-[3px]" />
      {/* Glow Circle */}
      <motion.div className="absolute right-1/2 translate-x-[0.5px] bottom-1/2 bg-cyan-300 translate-y-3.5 w-0.5 h-0.5 rounded-full z-40 " />
    </>
  );
};
