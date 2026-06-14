import React from "react";
import { prisma } from "@/lib/db";
import { Story } from "@/components/sections/Story";
import { Pillars } from "@/components/sections/Pillars";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StoryPage() {
  // Fetch CMS content
  const cmsItems = await prisma.cMSContent.findMany();
  const cms = cmsItems.reduce((acc: Record<string, string>, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});

  return (
    <div className="bg-background-light dark:bg-background-dark py-12 transition-colors duration-300">
      {/* Story Banner */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 text-center mb-16">
        <span className="text-[#607c64] dark:text-[#84a98c] font-bold tracking-[0.3em] uppercase text-xs mb-3 block">
          Behind the Scent
        </span>
        <h1 className="text-4xl md:text-6xl font-display mb-6 dark:text-gray-100">
          Our Story & Craft
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-light text-sm md:text-base leading-relaxed">
          At Izzan, we believe scent is a powerful medium that connects memory, space, and emotion. Here is how we craft our sanctuary.
        </p>
      </div>

      {/* Main Story Section */}
      <Story 
        title={cms.story_title || "Our Story"} 
        content={cms.story_content || "We craft mindfully poured candles and essential oils designed to bring calm to your everyday rituals."} 
        imgUrl={cms.story_img || "/images/story-workshop.png"} 
      />

      {/* Pillars Section */}
      <div className="border-t border-gray-100 dark:border-gray-800/50 mt-16 pt-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display dark:text-gray-100">Our Core Principles</h2>
          <p className="text-sm text-gray-500 mt-2 font-light">The foundation of everything we create.</p>
        </div>
        <Pillars images={[cms.pillar_1_img, cms.pillar_2_img, cms.pillar_3_img].filter(Boolean)} />
      </div>

      {/* Founder's Note Section */}
      <div className="max-w-3xl mx-auto px-6 text-center mt-24 py-16 bg-black/[0.01] dark:bg-white/[0.01] rounded-3xl border border-[#607c64]/10 dark:border-white/5 relative">
        <span className="text-4xl font-serif text-[#607c64]/40 absolute top-6 left-8">“</span>
        <h3 className="font-serif italic text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-6 leading-relaxed px-6">
          Scents have a unique way of grounding us in the present. In a busy world, our candles are hand-poured to help you carve out a small moment of mindfulness and peace each day.
        </h3>
        <span className="text-4xl font-serif text-[#607c64]/40 absolute bottom-6 right-8">”</span>
        <p className="font-semibold text-xs tracking-wider uppercase text-zinc-900 dark:text-gray-200">The Artisans at Izzan</p>
        <p className="text-[10px] uppercase text-gray-400 tracking-widest mt-1">Hand-Poured in small batches</p>
      </div>

      {/* Journey Timeline Section */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 mt-28">
        <div className="text-center mb-16">
          <span className="text-[#607c64] dark:text-[#84a98c] font-bold tracking-[0.25em] uppercase text-xs mb-2 block">
            Our Journey
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-zinc-900 dark:text-gray-100">
            Timeline of Milestones
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto font-light leading-relaxed">
            The evolution of our sustainable apothecary practices and scent formulations.
          </p>
        </div>

        <div className="relative border-l-2 md:border-l-0 md:before:absolute md:before:left-1/2 md:before:top-0 md:before:bottom-0 md:before:w-0.5 md:before:bg-gray-200 md:before:dark:bg-zinc-800 border-gray-200 dark:border-zinc-800 ml-4 md:ml-0 space-y-12 md:space-y-0">
          
          {/* Milestone 1: 2024 */}
          <div className="relative md:grid md:grid-cols-2 md:gap-8 md:items-center">
            {/* Timeline Dot */}
            <div className="absolute left-[-9px] md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-[#607c64] border-4 border-white dark:border-zinc-900 shadow-sm z-10" />
            
            <div className="md:text-right md:pr-12 md:col-span-1">
              <span className="text-xs font-bold text-[#607c64] dark:text-[#84a98c] tracking-widest uppercase mb-1 block">
                Founding Year
              </span>
              <div className="text-2xl font-bold font-display text-zinc-900 dark:text-gray-100 mb-2">
                2024: The Scent Laboratory
              </div>
            </div>
            
            <div className="pl-6 md:pl-12 md:col-span-1">
              <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
                <h4 className="text-sm font-semibold text-[#607c64] dark:text-[#84a98c] mb-1">
                  First trial pours of botanical extracts
                </h4>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">
                  Our journey began in a tiny workspace, blending pure essential oils and organic waxes. Hundreds of formulations were refined to establish our baseline clean-burn standard.
                </p>
              </div>
            </div>
          </div>

          {/* Milestone 2: 2025 */}
          <div className="relative md:grid md:grid-cols-2 md:gap-8 md:items-center md:pt-16">
            {/* Timeline Dot */}
            <div className="absolute left-[-9px] md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-[#607c64] border-4 border-white dark:border-zinc-900 shadow-sm z-10" />
            
            <div className="pl-6 md:pl-12 md:col-span-1 md:order-2 md:text-left">
              <span className="text-xs font-bold text-[#607c64] dark:text-[#84a98c] tracking-widest uppercase mb-1 block">
                Brand Evolution
              </span>
              <div className="text-2xl font-bold font-display text-zinc-900 dark:text-gray-100 mb-2">
                2025: Expanding the Ritual
              </div>
            </div>
            
            <div className="pl-6 md:pl-0 md:pr-12 md:col-span-1 md:order-1">
              <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
                <h4 className="text-sm font-semibold text-[#607c64] dark:text-[#84a98c] mb-1">
                  Launch of custom mist diffusers & wellness oils
                </h4>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">
                  We expanded beyond wax candles into room mist diffusers and therapeutic wellness oils. Customers embraced scent rituals as daily mindfulness anchors.
                </p>
              </div>
            </div>
          </div>

          {/* Milestone 3: 2026 */}
          <div className="relative md:grid md:grid-cols-2 md:gap-8 md:items-center md:pt-16">
            {/* Timeline Dot */}
            <div className="absolute left-[-9px] md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-[#607c64] border-4 border-white dark:border-zinc-900 shadow-sm z-10" />
            
            <div className="md:text-right md:pr-12 md:col-span-1">
              <span className="text-xs font-bold text-[#607c64] dark:text-[#84a98c] tracking-widest uppercase mb-1 block">
                Sustainable Apothecary
              </span>
              <div className="text-2xl font-bold font-display text-zinc-900 dark:text-gray-100 mb-2">
                2026: Direct Relationships
              </div>
            </div>
            
            <div className="pl-6 md:pl-12 md:col-span-1">
              <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
                <h4 className="text-sm font-semibold text-[#607c64] dark:text-[#84a98c] mb-1">
                  Establishing direct partnerships with organic farmers
                </h4>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">
                  Transitioned to a fully transparent supply chain, establishing direct relationships with organic lavender and pine farmers worldwide to preserve botanical purity.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-20">
        <Link
          href="/shop"
          className="group inline-flex items-center space-x-3 px-10 py-4 bg-[#607c64] text-white rounded-full font-bold tracking-[0.2em] text-xs md:text-sm uppercase hover:bg-opacity-95 transition-all duration-500 shadow-lg shadow-[#607c64]/20 cursor-pointer"
        >
          <span>Explore The Collections</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </div>
    </div>
  );
}
