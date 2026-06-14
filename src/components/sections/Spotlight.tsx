"use client";

import { motion, Variants } from "framer-motion";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { Product } from "@/generated/client";

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

export function Spotlight({ product, videoUrl }: { product: Product | null; videoUrl?: string }) {
  const { addToCart } = useCart();
  
  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast.success(`${product.name} added to cart!`, {
        description: "You've added 1 item to your sanctuary.",
      });
    } else {
      toast.error("Product not available");
    }
  };

  return (
    <section className="bg-secondary-light dark:bg-secondary-dark py-24 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.4)]"
        >
          <video
            src={videoUrl || "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
          >
            <track kind="captions" srcLang="en" label="English" />
          </video>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="flex flex-col space-y-8"
        >
          <motion.div variants={fadeIn}>
            <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Product Spotlight</span>
            <h2 className="text-5xl md:text-6xl font-display mt-2 dark:text-gray-100 leading-tight">
              {product ? (
                product.name.includes(" ") ? (
                  <>
                    {product.name.substring(0, product.name.lastIndexOf(" "))}{" "}
                    <span className="italic font-normal">
                      {product.name.substring(product.name.lastIndexOf(" ") + 1)}
                    </span>
                  </>
                ) : (
                  product.name
                )
              ) : (
                <>
                  Lavender <span className="italic font-normal">Drift</span>
                </>
              )}
            </h2>
            <div className="flex items-center space-x-4 mt-4">
              <p className="text-2xl font-bold text-primary dark:text-primary-light">
                ${product ? product.price.toFixed(2) : "28.00"}
              </p>
              <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700"></div>
              <div className="flex items-center space-x-1">
                <span className="text-xs uppercase tracking-widest font-bold text-gray-400">Intensity:</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`w-3 h-1 rounded-full ${i <= 3 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.p variants={fadeIn} className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-light">
            {product?.description || (
              <>
                Transform your evening routine with our signature <span className="font-semibold italic">Lavender Drift</span>. Hand-poured with 100% natural soy wax, this candle offers a deep, calming aroma designed to melt away stress and prepare your mind for restful sleep.
              </>
            )}
          </motion.p>

          <motion.div variants={fadeIn} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-display text-xl mb-1 dark:text-gray-100">
                  {product ? product.name : "Signature Candle"}
                </h3>
                <p className="text-xs text-primary font-bold uppercase tracking-widest">Hand-Poured</p>
              </div>
              <span className="text-2xl font-bold dark:text-gray-100">
                ${product ? product.price.toFixed(2) : "28.00"}
              </span>
            </div>
            <h4 className="font-bold uppercase tracking-[0.2em] text-xs text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-3 mb-6">Scent Notes</h4>
            <div className="grid grid-cols-3 gap-8">
              <div className="space-y-1">
                <p className="text-xs text-primary font-bold uppercase tracking-widest">Top</p>
                <p className="font-semibold text-sm dark:text-gray-200">Bergamot</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-primary font-bold uppercase tracking-widest">Heart</p>
                <p className="font-semibold text-sm dark:text-gray-200">French Lavender</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-primary font-bold uppercase tracking-widest">Base</p>
                <p className="font-semibold text-sm dark:text-gray-200">Cedarwood</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeIn} className="pt-4">
            <button
              onClick={handleAddToCart}
              className="w-full lg:w-auto bg-primary text-white px-20 py-6 rounded-full text-xs font-bold tracking-[0.25em] uppercase hover:bg-primary-dark transition-all duration-500 shadow-[0_20px_50px_rgba(96,124,100,0.3)] hover:shadow-primary/40 hover:-translate-y-1.5 active:scale-95 flex items-center justify-center space-x-3 cursor-pointer"
            >
              <span>Add to Collection</span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
