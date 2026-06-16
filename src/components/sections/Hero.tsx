"use client";

import Link from "next/link";
import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const revealContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    }
  }
};


export function Hero({ title, subtitle, videoUrl, posterUrl }: { title?: string, subtitle?: string, videoUrl?: string, posterUrl?: string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative w-full min-h-[90vh] flex items-center justify-start overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="object-cover object-center w-full h-full absolute inset-0"
          poster={posterUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAA-cKA0BI5PyiKmmlJ1V4jP1syMuPAzOAXIg7d-HjGJcIi-wOO_raH4mHQISILYP2dCAe3YP8niL9GpCqDGx6U8kAhAJPf1IJEPHryVq-UTqasBOwMnjEhr_6pcPLPG38UbgVhyUd0EDmxBB7oZqinh86xlSSHIGNXBltOus4NhdIR7NMUktxgeJh409TEpLaA5a_g0YFX-JUoUK6mH0gN5DaWIOvpOULZDRFWAnDvBNuh8UppFkbV0cNJjEgGinBO3d1T8xaM-Vu8"}
        >
          <track kind="captions" srcLang="en" label="English" />
          {videoUrl && <source src={videoUrl} type="video/mp4" />}
          {/* Add your short video source here, e.g., <source src="/video.mp4" type="video/mp4" /> */}
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30 md:to-transparent dark:from-black/95 dark:via-black/70"></div>
      </motion.div>
      <motion.div style={{ opacity }} className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 w-full text-white">
        <motion.div 
          className="max-w-2xl"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1 
            variants={revealContainer}
            className="text-5xl md:text-8xl font-display font-semibold mb-8 leading-[1.1] break-words"
          >
            {title || "Discover Your Moment of Calm."}
          </motion.h1>
          <motion.p variants={fadeIn} className="text-xl md:text-2xl mb-12 font-light max-w-lg leading-relaxed text-gray-200">
            {subtitle || "Handcrafted, Natural Candles & Essential Oils. Elevate Your Space."}
          </motion.p>
          <motion.div variants={fadeIn} className="flex flex-wrap gap-4">
            <Link href="/#shop" className="inline-block bg-primary text-white px-10 py-4 tracking-widest text-xs md:text-sm font-bold uppercase hover:bg-primary-dark transition-all rounded-full shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
              Shop the Collection
            </Link>
            <Link href="/#story" className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-4 tracking-widest text-xs md:text-sm font-bold uppercase hover:bg-white/20 transition-all rounded-full">
              Read Our Story
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
      
    </section>
  );
}

