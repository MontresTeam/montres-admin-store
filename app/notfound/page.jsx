"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const page = () => {
  return (
    <div className="relative w-screen h-screen bg-gradient-to-b from-blue-100 to-blue-300 overflow-hidden flex items-center justify-center">
      {/* Paper Planes */}
      <motion.div
        className="absolute w-12 h-12 bg-orange-400 rotate-45 rounded-lg paperPlane"
        animate={{ x: [0, 300, 0], y: [0, -100, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-12 h-12 bg-red-500 rotate-45 rounded-lg paperPlane"
        animate={{ x: [0, -250, 0], y: [0, 150, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-12 h-12 bg-cyan-400 rotate-45 rounded-lg paperPlane"
        animate={{ x: [0, 200, 0], y: [0, -200, 0] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
      />

      {/* Main Content */}
      <div className="text-center z-10 p-6  bg-opacity-70 ">
        <motion.h1
          className="text-5xl font-bold mb-4 "
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Commig Soon
        </motion.h1>
        <motion.p
          className="text-lg mb-6 text-gray-700"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          We're making things better. Check back soon or...
        </motion.p>

        <Link href="/dashboard">
          <motion.button
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-all"
            whileHover={{
              scale: 1.1,
              boxShadow: "0px 0px 15px rgba(128,0,128,0.5)",
            }}
          >
            Go to Dashboard
          </motion.button>
        </Link>
      </div>

      {/* Clouds */}
<motion.div
  className="absolute top-20 left-0 w-56 h-32 bg-white opacity-85 blur-sm shadow-xl"
  style={{
    borderRadius: "60% 40% 70% 30% / 50% 60% 40% 50%"
  }}
  animate={{ 
    x: [0, 600, 0]
  }}
  transition={{ 
    repeat: Infinity, 
    duration: 50, 
    ease: "linear" 
  }}
/>

<motion.div
  className="absolute top-36 right-0 w-44 h-24 bg-white opacity-75 blur-sm shadow-lg"
  style={{
    borderRadius: "50% 40% 60% 30% / 40% 50% 50% 60%"
  }}
  animate={{ 
    x: [0, -500, 0]
  }}
  transition={{ 
    repeat: Infinity, 
    duration: 45, 
    ease: "linear" 
  }}
/>

{/* Additional cloud for better cloud effect */}
<motion.div
  className="absolute top-52 left-20 w-36 h-20 bg-white opacity-80 blur-sm shadow-md"
  style={{
    borderRadius: "40% 60% 30% 70% / 60% 30% 70% 40%"
  }}
  animate={{ 
    x: [0, 400, 0]
  }}
  transition={{ 
    repeat: Infinity, 
    duration: 55, 
    ease: "linear" 
  }}
/>
    </div>
  );
};

export default page;
