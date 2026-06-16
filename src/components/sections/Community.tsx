"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";

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

const communityImages = [
  "/images/community-1.png",
  "/images/community-2.png",
  "/images/community-3.png",
  "/images/community-4.png",
  "/images/community-5.png"
];

export function Community({ images = [] }: { images?: string[] }) {
  return (
    <section className="py-12 md:py-16 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 text-center">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-3xl font-display mb-2 dark:text-gray-100">Join the Izzan Community</motion.h2>
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-sm mb-8 dark:text-gray-400">Instagram grid real reels: #MyIzzanMoment</motion.p>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {communityImages.map((img, idx) => (
            <motion.div key={idx} variants={fadeIn} className={`w-full aspect-square relative overflow-hidden rounded-md ${idx > 1 ? 'hidden md:block' : ''}`}>
              <Image alt="" className="object-cover hover:scale-105 transition-transform duration-500" src={images[idx] || img} fill sizes="(max-width: 768px) 50vw, 20vw" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
