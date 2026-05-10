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
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDIDE2F4Nv-A22bv0inayjUaRJLcS0bkQlr2QPziWSLLwHEOuiHmCgQRawZ1vUFoXCkDcOQDnc89CjhmuiyWpopVGUtTb5tPxmAZRLBk3fQqix7CCwY2MMxDHKmNPfvbrdXtkQh2NBnB1oP-fOFU3up8ZoMga4eBv1H9X7JXK99tV7p8SFlaImUb8tXfUyiulb3DW9vMLtOr56ol2GoWjkYXGvCMxvMXBOlTBTd81fX0JP82WIY9Bi99-aMl3WSmKI8LefUY2_7fdll",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBVRS56JXxhvBOmwAnxPzsdkGHOqJHT9et-LYEFwMxGmVIUECqiH7lcXVXuu-XJUSkc_VvJ36f2FJrJpH6NJFuOU1rrbe04rY3A6japGe2FAiBaOPuHUiAdBW2Y0m-Sjn4bGbRH45ABHwEOkEZxncal_hrvss02p1Q9KMWAevVACZXBkuO2AeDa7gtFDqGrgYZjdK7ziqC_Kp5PzZ8sInDxWBI27-ylTsrd35nkix0xvOlTwz5sGteSeaH4upAk5_pBeZ1xJA0r7Z58"
];

export function Community({ images = [] }: { images?: string[] }) {
  return (
    <section className="py-16 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto px-6 text-center">
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
              <Image 
                alt=""
                className="object-cover hover:scale-105 transition-transform duration-500" 
                src={images[idx] || img}
                fill 
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
