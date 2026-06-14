"use client";

import { motion, Variants } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

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

export function ContactSection() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Message sent!", {
      description: "We’ll get back to you within 24 hours.",
    });
    e.currentTarget.reset();
  };

  return (
    <section id="contact" className="py-24 px-6 md:px-12 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-8"
          >
            <div>
              <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl font-display mb-4 dark:text-gray-100">Get in Touch</motion.h2>
              <motion.p variants={fadeIn} className="text-gray-600 dark:text-gray-400 max-w-md">
                Have questions about our scents or interested in wholesale? We&apos;d love to hear from you.
              </motion.p>
            </div>

            <div className="space-y-6">
              <motion.div variants={fadeIn} className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-secondary-light dark:bg-secondary-dark flex items-center justify-center text-primary">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-gray-400">Email Us</p>
                  <p className="font-semibold dark:text-gray-200">hello@izzan.com</p>
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-secondary-light dark:bg-secondary-dark flex items-center justify-center text-primary">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-gray-400">Call Us</p>
                  <p className="font-semibold dark:text-gray-200">+1 (555) 123-4567</p>
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-secondary-light dark:bg-secondary-dark flex items-center justify-center text-primary">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-gray-400">Visit Us</p>
                  <p className="font-semibold dark:text-gray-200">123 Sanctuary Way, Calm City, CA 90210</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gray-50 dark:bg-gray-800/50 p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-gray-800"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">Full Name</label>
                  <input 
                    id="fullName" 
                    type="text" 
                    placeholder="Your Name…" 
                    required 
                    autoComplete="name"
                    className="w-full px-6 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all dark:text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contactEmail" className="text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">Email Address</label>
                  <input 
                    id="contactEmail" 
                    type="email" 
                    placeholder="Email Address…" 
                    required 
                    autoComplete="email"
                    spellCheck={false}
                    className="w-full px-6 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all dark:text-white" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">Subject</label>
                <select id="subject" className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all dark:text-gray-100">
                  <option>General Inquiry</option>
                  <option>Wholesale</option>
                  <option>Shipping Question</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-xs uppercase tracking-widest font-bold text-gray-500">Message</label>
                <textarea 
                  id="message" 
                  rows={4} 
                  required 
                  placeholder="Your message…"
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all dark:text-gray-100 resize-none"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-primary text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-sm hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              >
                <span>Send Message</span>
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
