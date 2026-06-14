"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/generated/client";
import { useCart } from "@/context/CartContext";
import { Sparkles, RefreshCw, Check, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ScentQuizProps {
  products: Product[];
  onFilterMatch: (scentFamily: string) => void;
}

interface Question {
  id: number;
  text: string;
  options: {
    label: string;
    value: string;
    description: string;
    icon: string;
  }[];
}

const quizQuestions: Question[] = [
  {
    id: 1,
    text: "What is your primary mood or wellness goal?",
    options: [
      { label: "Unwind & Relax", value: "relax", description: "Soothe stress and invite tranquil rest.", icon: "🌙" },
      { label: "Energize & Focus", value: "energize", description: "Awaken senses and clear mental clutter.", icon: "⚡" },
      { label: "Cozy & Warm", value: "cozy", description: "Create a rich, comforting space of solace.", icon: "🔥" },
      { label: "Ground & Meditate", value: "ground", description: "Connect deeply and discover inner quiet.", icon: "🧘" }
    ]
  },
  {
    id: 2,
    text: "Where will this scent primarily live?",
    options: [
      { label: "Bedroom & Bath", value: "bedroom", description: "Private sanctuary for winding down.", icon: "🛏️" },
      { label: "Living Room & Lounge", value: "living", description: "Welcoming and relaxing gathering space.", icon: "🛋️" },
      { label: "Kitchen & Dining", value: "kitchen", description: "Fresh, clean, and vibrant aromas.", icon: "🍋" },
      { label: "Office & Study", value: "office", description: "Promoting productivity and clarity.", icon: "💻" }
    ]
  },
  {
    id: 3,
    text: "Which scent description speaks to you most?",
    options: [
      { label: "Woody & Earthy", value: "woody", description: "Sandalwood, cedar, resin, and warm amber.", icon: "🌲" },
      { label: "Floral & Botanical", value: "floral", description: "Jasmine, lavender, roses, and field herbs.", icon: "🌸" },
      { label: "Citrus & Vibrant", value: "citrus", description: "Lemongrass, bergamot, and fresh citrus peel.", icon: "🍊" },
      { label: "Fresh & Herbal", value: "fresh", description: "Eucalyptus, peppermint, and green tea tree.", icon: "🌿" }
    ]
  }
];

export default function ScentQuiz({ products, onFilterMatch }: ScentQuizProps) {
  const { addToCart } = useCart();
  const [step, setStep] = useState(0); // 0 = Start, 1-3 = Questions, 4 = Result
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [added, setAdded] = useState(false);

  const handleSelect = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setTimeout(() => {
      setStep(prev => prev + 1);
    }, 350);
  };

  const matchedProduct = useMemo(() => {
    if (step !== 4) return null;

    const mood = answers[1];
    const scentFamily = answers[3];

    // Core Matching Engine
    let targetKeywords: string[] = [];
    if (scentFamily === "woody") {
      targetKeywords = ["amber", "sandalwood", "cedar", "pine", "patchouli", "fig"];
    } else if (scentFamily === "floral") {
      targetKeywords = ["lavender", "jasmine", "rose", "blossom", "sage", "sweetgrass"];
    } else if (scentFamily === "citrus") {
      targetKeywords = ["citrus", "grove", "lemongrass", "bergamot", "clove"];
    } else if (scentFamily === "fresh") {
      targetKeywords = ["eucalyptus", "mint", "tea tree", "peppermint", "breeze"];
    }

    // Secondary fallback matching on mood
    if (targetKeywords.length === 0) {
      if (mood === "relax") targetKeywords = ["lavender", "jasmine", "breeze"];
      else if (mood === "energize") targetKeywords = ["eucalyptus", "mint", "citrus", "lemongrass"];
      else if (mood === "cozy") targetKeywords = ["cinnamon", "amber", "vanilla"];
      else targetKeywords = ["sandalwood", "sage", "tea tree"];
    }

    // Filter products matching keyword
    const matches = products.filter(p => {
      const nameLower = p.name.toLowerCase();
      const descLower = (p.description || "").toLowerCase();
      return targetKeywords.some(keyword => nameLower.includes(keyword) || descLower.includes(keyword));
    });

    if (matches.length > 0) {
      // Return first match (pure and deterministic)
      return matches[0];
    }

    // Hard fallback: Best Seller Signature Collection
    const signature = products.find(p => p.name.includes("Signature") || p.badge === "Best Seller");
    return signature || products[0];
  }, [step, answers, products]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!matchedProduct) return;

    addToCart(matchedProduct);
    setAdded(true);
    toast.success("Added Scent Match!", {
      description: `${matchedProduct.name} added to your cart.`
    });
    setTimeout(() => setAdded(false), 2000);
  };

  const handleApplyFilter = () => {
    const scentFamily = answers[3];
    let queryVal = "All";
    if (scentFamily === "woody") queryVal = "woody";
    else if (scentFamily === "floral") queryVal = "floral";
    else if (scentFamily === "citrus") queryVal = "citrus";
    else if (scentFamily === "fresh") queryVal = "fresh";

    onFilterMatch(queryVal);
    toast.info("Applied Scent Profile Filter", {
      description: `Showing products matching your scent profile.`
    });
  };

  const handleReset = () => {
    setAnswers({});
    setStep(0);
    setAdded(false);
  };

  return (
    <div className="bg-gradient-to-br from-zinc-50 to-zinc-100/50 dark:from-zinc-900/60 dark:to-zinc-950/60 rounded-3xl border border-black/5 dark:border-white/5 p-6 shadow-sm overflow-hidden min-h-[360px] flex flex-col justify-between transition-all duration-300">
      
      <AnimatePresence mode="wait">
        {/* Step 0: Welcome Screen */}
        {step === 0 && (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center text-center justify-center flex-1 py-4"
          >
            <div className="w-12 h-12 rounded-full bg-[#607c64]/10 dark:bg-[#84a98c]/10 text-[#607c64] dark:text-[#84a98c] flex items-center justify-center mb-4">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
              Scent Finder Quiz
            </h3>
            <p className="text-xs text-gray-400 mt-2 max-w-[240px] font-light leading-relaxed">
              Answer 3 quick questions to discover your ideal hand-poured custom fragrance pairing.
            </p>
            <button
              onClick={() => setStep(1)}
              className="mt-6 w-full py-3 bg-[#607c64] hover:bg-[#4d6350] text-white rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all cursor-pointer shadow-md shadow-[#607c64]/10 flex items-center justify-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span>Begin Scent Quiz</span>
              <ArrowRight size={14} />
            </button>
          </motion.div>
        )}

        {/* Steps 1, 2, 3: Questions */}
        {step >= 1 && step <= 3 && (
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1"
          >
            {/* Header progress info */}
            <div className="flex items-center justify-between mb-4 border-b border-black/5 dark:border-white/5 pb-2">
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#607c64] dark:text-[#84a98c]">
                Step {step} of 3
              </span>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className={`w-4 h-1 rounded-full transition-all ${
                      i <= step ? "bg-[#607c64]" : "bg-black/10 dark:bg-white/10"
                    }`} 
                  />
                ))}
              </div>
            </div>

            {/* Question Text */}
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
              {quizQuestions[step - 1].text}
            </h4>

            {/* Option Cards */}
            <div className="flex flex-col gap-2 flex-1 justify-center">
              {quizQuestions[step - 1].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(step, opt.value)}
                  className="w-full text-left p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[#607c64] dark:hover:border-[#84a98c] hover:bg-[#607c64]/5 dark:hover:bg-[#84a98c]/5 flex items-start gap-3 transition-all cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="text-xl leading-none group-hover:scale-110 transition-transform duration-300">
                    {opt.icon}
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block mb-0.5 group-hover:text-[#607c64] dark:group-hover:text-[#84a98c]">
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 block truncate leading-normal">
                      {opt.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 4: Recommendation Results */}
        {step === 4 && matchedProduct && (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col flex-1"
          >
            {/* Header */}
            <div className="text-center mb-4 border-b border-black/5 dark:border-white/5 pb-2">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#607c64] dark:text-[#84a98c] flex items-center justify-center gap-1">
                <Sparkles size={12} />
                Your Scent Match
              </span>
            </div>

            {/* Product Card Match */}
            <div className="flex gap-4 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 mb-4 items-center">
              <div className="relative w-16 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={matchedProduct.img}
                  alt={matchedProduct.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate leading-snug">
                  {matchedProduct.name}
                </h5>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 block mt-0.5 truncate uppercase tracking-widest font-semibold">
                  {matchedProduct.categories.split(",")[0]}
                </span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block mt-1">
                  ${matchedProduct.price}
                </span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleQuickAdd}
                className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-[0.15em] transition-all flex items-center justify-center space-x-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  added 
                    ? "bg-green-600 text-white" 
                    : "bg-[#607c64] hover:bg-[#4d6350] text-white shadow-md shadow-[#607c64]/10"
                }`}
              >
                {added ? (
                  <>
                    <span>Added Match</span>
                    <Check size={14} />
                  </>
                ) : (
                  <>
                    <span>Quick Add Match</span>
                    <span className="text-lg leading-none">+</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/product/${matchedProduct.id}`}
                  className="py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-600 dark:text-gray-400 text-center transition-all cursor-pointer hover:bg-black/[0.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  View Details
                </Link>
                <button
                  onClick={handleApplyFilter}
                  className="py-2.5 rounded-xl border border-[#607c64]/30 hover:border-[#607c64] text-[10px] font-bold uppercase tracking-[0.1em] text-[#607c64] dark:text-[#84a98c] text-center transition-all cursor-pointer hover:bg-[#607c64]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Apply Filter
                </button>
              </div>

              {/* Reset Quiz */}
              <button
                onClick={handleReset}
                className="mt-2 text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center justify-center gap-1 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary px-2 rounded"
              >
                <RefreshCw size={10} />
                Retake Quiz
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
