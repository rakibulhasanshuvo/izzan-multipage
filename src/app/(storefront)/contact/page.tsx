import React from "react";
import { ContactSection } from "@/components/sections/ContactSection";
import { FAQ } from "@/components/sections/FAQ";
import { CareGuide } from "@/components/sections/CareGuide";

export default function ContactPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark py-12 transition-colors duration-300">
      {/* Page Header */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 text-center mb-12">
        <span className="text-[#607c64] dark:text-[#84a98c] font-bold tracking-[0.3em] uppercase text-xs mb-3 block">
          Help & Support
        </span>
        <h1 className="text-4xl md:text-6xl font-display mb-6 dark:text-gray-100">
          Support Center
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-light text-sm md:text-base leading-relaxed">
          Submit an inquiry, browse answers to frequently asked questions, or explore guidelines on how to care for your artisanal candles and oils.
        </p>
      </div>

      {/* Contact Form & Details Section */}
      <div className="border-t border-gray-100 dark:border-gray-800/50 pt-4">
        <ContactSection />
      </div>

      {/* FAQ Accordion Section */}
      <div className="border-t border-gray-100 dark:border-gray-800/50 mt-16 pt-16">
        <FAQ />
      </div>

      {/* Scent Care Guide Section */}
      <div className="border-t border-gray-100 dark:border-gray-800/50 mt-16 pt-16 bg-black/[0.01] dark:bg-white/[0.01] py-16">
        <div className="text-center mb-8 px-6">
          <h2 className="text-3xl font-display dark:text-gray-100">Artisanal Scent Ritual</h2>
          <p className="text-sm text-gray-500 mt-2 font-light">Follow our candle care guidelines for a clean burn and rich scent release.</p>
        </div>
        <CareGuide />
      </div>

      {/* Stockists & Location Block */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 mt-16 pt-16 border-t border-gray-200 dark:border-gray-800 text-center">
        <h2 className="text-2xl font-display mb-4 dark:text-gray-100">Our Studio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto mt-8">
          <div className="p-6 bg-black/[0.01] dark:bg-white/[0.01] rounded-2xl border border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-base mb-2 dark:text-gray-200">Main Office & Production</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed">
              12 Scented Lane, Suite 400<br />
              Calm District, NY 10001<br />
              United States
            </p>
          </div>
          <div className="p-6 bg-black/[0.01] dark:bg-white/[0.01] rounded-2xl border border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-base mb-2 dark:text-gray-200">Hours of Operation</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed">
              Monday – Friday: 9:00 AM – 6:00 PM EST<br />
              Saturday: 10:00 AM – 4:00 PM EST<br />
              Sunday: Closed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
