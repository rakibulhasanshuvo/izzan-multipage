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

const pillars = [
  {
    title: "100% Natural Soy Wax",
    subtitle: "Clean, non-toxic burn for your sanctuary.",
    img: "/images/pillar-wax.png"
  },
  {
    title: "Pure Essential Oils",
    subtitle: "Therapeutic-grade scents from nature.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVmDWzO3fIsa6g8efDclw6fOt6K0ZJuceIbbrDTaD2Lyup9gS9lNFkMxB73LazQVYHFhBmALDWnYbd2v6w8WuErf5e4Vz82GS_Od72Mf1OlAuTukU5Oeyby1hGQXAfQIpYZEUBI2hBHRZc5UpwYghogk-pJsppAQBNHIE3XH0kxgQIlcj_x9NVei5WeFiaD1w-KxTTY7ik-KnMJ7DgH9tJg4l8Hgk1q1QLCjurasFTKxaAIXCfeA3lHICD8n2ZVZJux9A1t-KQ2TOZ"
  },
  {
    title: "Hand-Poured",
    subtitle: "Small batch craftsmanship with love.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDIDE2F4Nv-A22bv0inayjUaRJLcS0bkQlr2QPziWSLLwHEOuiHmCgQRawZ1vUFoXCkDcOQDnc89CjhmuiyWpopVGUtTb5tPxmAZRLBk3fQqix7CCwY2MMxDHKmNPfvbrdXtkQh2NBnB1oP-fOFU3up8ZoMga4eBv1H9X7JXK99tV7p8SFlaImUb8tXfUyiulb3DW9vMLtOr56ol2GoWjkYXGvCMxvMXBOlTBTd81fX0JP82WIY9Bi99-aMl3WSmKI8LefUY2_7fdll"
  }
];

export function Pillars({ images = [] }: { images?: string[] }) {
  return (
    <section className="pt-20 md:pt-32 pb-12 md:pb-16 px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-12">
        <motion.span variants={fadeIn} className="text-primary font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Our Values</motion.span>
        <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl font-display mb-4 dark:text-gray-100">The Izzan Promise</motion.h2>
        <motion.p variants={fadeIn} className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">Crafted with intention. We never compromise on quality or your well-being, ensuring every scent is a sanctuary.</motion.p>
      </motion.div>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        {pillars.map((pillar, idx) => (
          <motion.div key={idx} variants={fadeIn} className="relative aspect-[4/5] overflow-hidden rounded-3xl group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500">
            <Image src={images[idx] || pillar.img} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:via-black/40 transition-all duration-500"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-end text-white p-6 md:p-10 text-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <h3 className="text-2xl font-display font-semibold mb-4 leading-tight">{pillar.title}</h3>
              <p className="text-xs text-gray-300 font-light tracking-wide leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{pillar.subtitle}</p>
              <div className="mt-6 w-8 h-[1px] bg-primary group-hover:w-16 transition-all duration-500"></div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
