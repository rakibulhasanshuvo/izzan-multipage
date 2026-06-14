export interface ProductMetadata {
  scentProfile: {
    top: string;
    heart: string;
    base: string;
  } | null;
  volumeOptions: string[];
  burnTime?: string;
  ingredients: string;
  ritual: string;
  sourcing: string;
}

const defaultCandleMetadata: ProductMetadata = {
  scentProfile: {
    top: "Citrus Peel, Bergamot",
    heart: "Wild Lavender, Rosemary",
    base: "Sandalwood, Warm Amber"
  },
  volumeOptions: ["8 oz (220g) - Single Wick", "12 oz (340g) - Double Wick"],
  burnTime: "45 - 60 hours",
  ingredients: "100% natural biodegradable soy wax, custom-blended phthalate-free premium fragrance and essential oils, lead-free natural cotton wicks.",
  ritual: "Allow the wax melt pool to reach the edge of the glass container on the first burn to prevent tunneling. Trim the cotton wick to 1/4 inch before every lighting. Do not burn for more than 4 hours at a time.",
  sourcing: "Hand-poured in small batches in our New York studio. All jars and containers are fully reusable and recyclable."
};

const defaultOilMetadata: ProductMetadata = {
  scentProfile: {
    top: "Fresh Eucalyptus, Lemon",
    heart: "Mint Sprigs, Herbaceous Tea",
    base: "Cedar Needle, Clean Musk"
  },
  volumeOptions: ["10 ml (0.33 fl oz)", "30 ml (1.0 fl oz)"],
  ingredients: "100% pure steam-distilled essential oils. Sourced sustainably from local botanical growers. Free from synthetic diluent and additives.",
  ritual: "Add 5-8 drops to an ultrasonic diffuser filled with fresh water. Adjust quantity to suit your room size and desired scent intensity. Store in a cool, dark place away from direct sunlight.",
  sourcing: "Ethically harvested and cold-pressed or steam-distilled at source. Bottled in amber glass containers with drop-restrictors to preserve chemical integrity."
};

const defaultDiffuserMetadata: ProductMetadata = {
  scentProfile: null,
  volumeOptions: ["One Size (Fits 100ml - 500ml)"],
  ingredients: "Natural wood and porcelain structure. USB-rechargeable battery module with multiple ultrasonic frequency settings.",
  ritual: "Fill the interior porcelain tank with distilled water to the maximum fill line. Add essential oils as desired. Wipe clean weekly with a soft, damp cloth.",
  sourcing: "Handcrafted ceramics sourced from local artisanal pottery studios. Assembled and quality tested in-house."
};

const productsMetadata: Record<string, Partial<ProductMetadata>> = {
  "Lavender Drift Candle": {
    scentProfile: {
      top: "French Lavender, Fresh Sage",
      heart: "Chamomile Petals, White Tea",
      base: "Warm Vanilla, Sheer Musk"
    },
    volumeOptions: ["8 oz (220g) - Single Wick", "12 oz (340g) - Double Wick"],
    burnTime: "45 - 60 hours",
    ritual: "Light in the evening or during meditation. Ensure the wick is trimmed to 1/4 inch. Let the melt pool expand fully to prevent tunneling."
  },
  "Eucalyptus Essential Oil": {
    scentProfile: {
      top: "Eucalyptus Globulus, Wild Mint",
      heart: "Tea Tree, Crushed Pine",
      base: "Camphor, Cedarwood"
    },
    volumeOptions: ["10 ml (0.33 fl oz)", "30 ml (1.0 fl oz)"],
    ritual: "Perfect for morning focus. Diffuse 5-10 drops in an ultrasonic mist diffuser, or add a few drops to your shower floor for an invigorating steam ritual."
  },
  "Amber Bloom Candle": {
    scentProfile: {
      top: "Spiced Plum, Citrus Zest",
      heart: "Red Rose, Jasmine Bloom",
      base: "Golden Amber, Patchouli, Dark Oud"
    },
    volumeOptions: ["8 oz (220g) - Single Wick", "12 oz (340g) - Double Wick"],
    burnTime: "45 - 60 hours"
  },
  "Sandalwood Mist Diffuser": {
    scentProfile: {
      top: "Cardamom, Violet Leaves",
      heart: "Iris, Papyrus, Leather Accord",
      base: "Australian Sandalwood, Cedarwood, Amber"
    },
    volumeOptions: ["Porcelain Diffuser Unit", "Diffuser + 10ml Sandalwood Oil Blend"],
    ingredients: "Sleek matte porcelain top cover, BPA-free internal water reservoir. Ultrasonic plate runs at 2.4MHz.",
    ritual: "Fill reservoir with clean water, add 10-12 drops of oil, and select your mist interval (continuous or 30-sec cycles). Auto-shuts off when water runs dry."
  },
  "Izzan Signature Collection": {
    scentProfile: {
      top: "Bergamot, Cardamom, Oolong Tea",
      heart: "Jasmine Sambac, White Rose, Fig",
      base: "Sandalwood, Vetiver, Cashmere Wood"
    },
    volumeOptions: ["Exclusive Set (3 x 4 oz Candles + 10ml Oil)"],
    burnTime: "25 hours per candle",
    ingredients: "Crafted exclusively with our signature scent blends. 100% natural coconut-soy wax and botanical oils.",
    ritual: "Our flagship scent experience. Burn candles sequentially to experience the evolving aromatherapic journey, or layer the oil in your diffuser."
  }
};

export function getProductMetadata(name: string): ProductMetadata {
  const custom = productsMetadata[name] || {};
  const isOil = name.toLowerCase().includes("oil") || name.toLowerCase().includes("essence");
  const isDiffuser = name.toLowerCase().includes("diffuser") || name.toLowerCase().includes("salt");
  
  const defaults = isOil 
    ? defaultOilMetadata 
    : isDiffuser 
      ? defaultDiffuserMetadata 
      : defaultCandleMetadata;

  return {
    ...defaults,
    ...custom,
    scentProfile: custom.scentProfile !== undefined 
      ? custom.scentProfile 
      : defaults.scentProfile
  };
}
