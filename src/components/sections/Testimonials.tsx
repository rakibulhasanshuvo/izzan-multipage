"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Star } from "lucide-react";

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

const testimonials = [
  { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDC0gX_v-BP3YuN_0rTn-FbcluHhhZpqexXR45VaTMmDHWKw5rlBOxpHeVvQJByBF9NUNzWQXa_U0rxD0Z5xXAUvDlqErBVkMeq1CUPAD8r0zGSCxSdkE4sDDIQ9P33nNu73IHLFbZ33uTIqDvSwrwecvoRrHWjTm2V6J4rgRr1m6caMl6Pt1N5idobOAYDvpbCEeL5HQs0uiDfpRBCsKKKpz-0uO95P2AQGIAO2_NcvAriFi26a-Lc0hzzs92Nczg63qktDkBNEkyx", quote: "\"The best candles I've ever owned!\"", author: "Sarah P." },
  { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWQkLe8ngyzHV3JPrC9jePY4CSW3yDg0fXr-DV8aKmJzj38Xc3OpJ_q1MrzILnS55ocCqE1cILs_AxZHk0knKxqmvPNSSPQZmhatTp33gMFhrHIp28lAp0v45_uKEslJo5ZAWzP1XenV3wkfPdqIA8crAAGQz8i8kpap7jhFda0yLt68__6eEw0E-bpCA5HGhVdwSD8qkxJYnJEnyb8hmDj3XhUyJzQqznGmvK_tU1Ta7HdFqf0YFN3722hHmYWTtaLwlK-j-E9Kc-", quote: "\"This scent makes me feel so much more calm.\"", author: "Elena M." },
  { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQPXsP1CgPPqF1xvSW7f9T05SRu64pwlRphx1tvALx0wpiBDi2fgpib7qsoJifdDwj9STHpNkOfur_hVi80OURr2ZnaKqK-Nz6E-IgJLnMEh-1HY5dnv7svIMD77DfhYPVm5w4H5q1ene73Vep6u5np-0ossnRSb2VRN4WPD57GdFcKhq6BgWEOyaUNUTxhccO4kJkwbS5Bi9IaFJj0uoOV9yzOSCY9_BIDH3kWRxwbrbpfBI8cYLHguowm5nOZLdKWWlN1BtMj_er", quote: "\"They are my go-to gift for everyone.\"", author: "Jessica T." }
];

export function Testimonials({ images = [] }: { images?: string[] }) {
  return (
    <section id="reviews" className="bg-secondary-light dark:bg-secondary-dark py-12 md:py-20 transition-colors duration-300">
      <div className="px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto text-center">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-3xl md:text-4xl font-display mb-12 dark:text-gray-100">Customer Favorites</motion.h2>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {testimonials.map((testimonial, idx) => (
            <motion.div key={idx} variants={fadeIn} className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-sm">
              <div className="w-full aspect-video relative overflow-hidden mb-6 rounded-md">
                <Image alt="" className="object-cover" src={images[idx] || testimonial.img} fill sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <p className="italic mb-4 text-gray-700 dark:text-gray-300">{testimonial.quote}</p>
              <p className="font-semibold text-sm mb-2 dark:text-gray-100">- {testimonial.author}</p>
              <div className="flex text-accent-gold">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
