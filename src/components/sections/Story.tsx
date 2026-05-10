"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

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

export function Story({ title, content, imgUrl }: { title?: string, content?: string, imgUrl?: string }) {
  return (
    <section id="story" className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto scroll-mt-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center flex-col-reverse md:flex-row">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="flex flex-col space-y-6 order-2 md:order-1"
        >
          <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl font-display mb-6 dark:text-gray-100">{title || "The Art of Slow Living."}</motion.h2>
          <motion.p variants={fadeIn} className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed font-light text-lg">
            {content || "Izzan was born from a simple desire: to create moments of stillness in a chaotic world. We believe that your space is your sanctuary, and the scents you fill it with should be as pure as nature intended."}
          </motion.p>
          <motion.h3 variants={fadeIn} className="text-xl font-display font-semibold mb-4 dark:text-gray-100 text-primary">Crafted with Purpose</motion.h3>
          <motion.p variants={fadeIn} className="text-gray-600 dark:text-gray-400 mb-8 text-sm leading-relaxed">
            Every candle is hand-poured in our studio using 100% natural soy wax, lead-free cotton wicks, and premium essential oils. No toxins, no artificial dyes—just clean, sustainable burns that elevate your everyday rituals.
          </motion.p>
          <motion.div variants={fadeIn} className="pt-4">
            <Link href="#" className="inline-flex items-center text-primary font-semibold tracking-wider uppercase text-sm hover:underline underline-offset-4">
              Read Our Story <ArrowRight size={16} className="ml-2" />
            </Link>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative aspect-[4/3] w-full rounded-lg overflow-hidden shadow-xl order-1 md:order-2"
        >
          <Image
            src={imgUrl || "/images/story-workshop.png"}
            alt="Hand pouring candles"
            fill
            className="object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
