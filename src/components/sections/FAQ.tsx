"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Plus, Minus } from "lucide-react";

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

const faqs = [
  { question: "How long do your candles burn?", answer: "Our standard 8oz candles offer a clean burn for approximately 45-50 hours when cared for properly." },
  { question: "Are your essential oils safe for pets?", answer: "While our ingredients are 100% natural, some essential oils can be sensitive to certain pets. We recommend consulting your vet and burning in well-ventilated areas." },
  { question: "What is your return policy?", answer: "We offer a 30-day money-back guarantee. If you don't love your Izzan product, simply return it unused for a full refund." },
];

export function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-6 md:px-12 max-w-3xl mx-auto scroll-mt-20">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-12">
        <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-display mb-4 dark:text-gray-100">Frequently Asked Questions</motion.h2>
      </motion.div>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-300">
            <button 
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              aria-expanded={openFaq === idx}
              className="w-full flex justify-between items-center p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            >
              <span className="font-semibold dark:text-gray-100">{faq.question}</span>
              <motion.div
                animate={{ rotate: openFaq === idx ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-primary"
              >
                {openFaq === idx ? <Minus size={20} /> : <Plus size={20} />}
              </motion.div>
            </button>
            <AnimatePresence>
              {openFaq === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
