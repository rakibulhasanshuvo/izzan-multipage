import pkg from '../src/generated/client/index.js';
const { PrismaClient } = pkg;
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcrypt';

import path from 'path';

const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD8oz6-Sg586xPq5mJx1g1FLgZ5HcTKJliYsmN46wDI_VUNFS6cC-ocsffImJho4F8OKRpexTgbDv8mLcCDnnNh9BlUZawueRnl9SYPcKMT-bml6_BE5sIoOYyfc7wmmBkxCjDh7gE0id9zfDRErApzvuBNuP4AntNOOgbuvCQGmeEIkK3ZmT7ujCYFxXCupsPBj1V_BCkDMOxI2_rl41q-amM7V7DgXe5p1b5m2iKpn_VUxE94gQyHUb8PBTsd9mzHRZixaQgnlyGn",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCVmDWzO3fIsa6g8efDclw6fOt6K0ZJuceIbbrDTaD2Lyup9gS9lNFkMxB73LazQVYHFhBmALDWnYbd2v6w8WuErf5e4Vz82GS_Od72Mf1OlAuTukU5Oeyby1hGQXAfQIpYZEUBI2hBHRZc5UpwYghogk-pJsppAQBNHIE3XH0kxgQIlcj_x9NVei5WeFiaD1w-KxTTY7ik-KnMJ7DgH9tJg4l8Hgk1q1QLCjurasFTKxaAIXCfeA3lHICD8n2ZVZJux9A1t-KQ2TOZ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCkoWNHxQhWVZD8vdrMHx3oi_Z7pcWg3xW1DjVLZyubJsonYHVVKHYyJzU-RHVa0B9aCKHoSo1-eMkClG6acIp-yXTGHxeOs94QcleyxbKKi5d3HW_2eE_lexI_vcjS4_vNNAlvEkKc5Dj28M8gdqzgh6JUrM4aZkaSbfBMsyJyBuOAPyoCYZoz_OQVwSyqpUllsRsMlZocSOljjJB6pXmgXmrQNSVnf1HHJlFWMQhmTxMccOON6C7w2GaKKPzAU5flzR66nA2_Axbc",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC5TyuEM-QecODGheVYbKwjShH-s76sTGmXLfRXo4T-OwBbil1ATF4Ep3ypplDu_KayzP_cSOJRgv0Lnc_nItl70AIwF8WFjcSvAr5MxR4DNDVvrQNdGdy5ykdHiUq1wlCUxJnpX8wWyg5uqcle6LWFWttbF4G3eoGsGEULp-hFErOvB6slCPwADC5eW9ZQ16-GSsqAaGCXpodPBrsvlVdQK8UI8UMHrPCKG4CsCDiWuyykehepLt-YUOnDX4XYYEi8DLoMEmKOraiH",
];

const productsData = [
  { name: "Lavender Drift Candle", price: 28, img: IMAGES[0], hoverImg: IMAGES[1], categories: "Best Sellers", badge: "Best Seller" },
  { name: "Eucalyptus Essential Oil", price: 35, img: IMAGES[1], hoverImg: IMAGES[2], categories: "Best Sellers, New Arrivals", badge: "New" },
  { name: "Amber Bloom Candle", price: 28, img: IMAGES[2], hoverImg: IMAGES[3], categories: "Best Sellers", badge: "" },
  { name: "Sandalwood Mist Diffuser", price: 38, originalPrice: 45, img: IMAGES[3], hoverImg: IMAGES[0], categories: "Sale", badge: "Sale" },
  { name: "Vanilla Bean & Oak", price: 30, img: IMAGES[0], hoverImg: IMAGES[1], categories: "New Arrivals", badge: "New" },
  { name: "Citrus Grove Oil", price: 25, originalPrice: 32, img: IMAGES[1], hoverImg: IMAGES[2], categories: "Sale", badge: "Sale" },
  { name: "Midnight Jasmine", price: 28, img: IMAGES[2], hoverImg: IMAGES[3], categories: "Best Sellers", badge: "" },
  { name: "Rosemary Mint Candle", price: 26, img: IMAGES[3], hoverImg: IMAGES[0], categories: "New Arrivals", badge: "" },
  { name: "Bergamot & Clove", price: 32, img: IMAGES[0], hoverImg: IMAGES[1], categories: "Best Sellers, New Arrivals", badge: "" },
  { name: "Peppermint Oil", price: 22, originalPrice: 28, img: IMAGES[1], hoverImg: IMAGES[2], categories: "Sale", badge: "Sale" },
  { name: "Wild Fig & Cedar", price: 30, img: IMAGES[2], hoverImg: IMAGES[3], categories: "Best Sellers", badge: "" },
  { name: "White Tea Diffuser", price: 40, img: IMAGES[3], hoverImg: IMAGES[0], categories: "New Arrivals", badge: "New" },
  { name: "Ocean Breeze Candle", price: 26, img: IMAGES[0], hoverImg: IMAGES[1], categories: "Sale", originalPrice: 34, badge: "Sale" },
  { name: "Lemongrass Oil", price: 24, img: IMAGES[1], hoverImg: IMAGES[2], categories: "Best Sellers", badge: "" },
  { name: "Patchouli Noir", price: 29, img: IMAGES[2], hoverImg: IMAGES[3], categories: "New Arrivals", badge: "New" },
  { name: "Sage & Sweetgrass", price: 27, img: IMAGES[3], hoverImg: IMAGES[0], categories: "Best Sellers", badge: "" },
  { name: "Warm Cinnamon", price: 25, img: IMAGES[0], hoverImg: IMAGES[1], categories: "Sale", originalPrice: 30, badge: "Sale" },
  { name: "Tea Tree Oil", price: 21, img: IMAGES[1], hoverImg: IMAGES[2], categories: "New Arrivals", badge: "" },
  { name: "Golden Amber", price: 31, img: IMAGES[2], hoverImg: IMAGES[3], categories: "Best Sellers", badge: "" },
  { name: "Forest Pine Candle", price: 28, img: IMAGES[3], hoverImg: IMAGES[0], categories: "Best Sellers, Sale", originalPrice: 35, badge: "Sale" },
  { name: "Himalayan Salt Diffuser", price: 45, img: IMAGES[0], hoverImg: IMAGES[1], categories: "New Arrivals", badge: "New" },
  { name: "Frankincense Oil", price: 38, img: IMAGES[1], hoverImg: IMAGES[2], categories: "Best Sellers", badge: "" },
  { name: "Neroli Blossom", price: 34, img: IMAGES[2], hoverImg: IMAGES[3], categories: "Sale", originalPrice: 42, badge: "Sale" },
  { name: "Aura Signature Collection", price: 85, img: IMAGES[3], hoverImg: IMAGES[0], categories: "Best Sellers, New Arrivals", badge: "Best Seller" },
];

async function main() {
  console.log('Start seeding...');
  
  try {
    // Clear existing data
    await prisma.product.deleteMany();
    
    for (const p of productsData) {
      const product = await prisma.product.create({
        data: p,
      });
      console.log(`Created product with id: ${product.id}`);
    }

    const cmsData = [
      { key: "hero_title", value: "Discover Your Moment of Calm", section: "hero" },
      { key: "hero_subtitle", value: "Handcrafted, Natural Candles & Essential Oils. Elevate Your Space.", section: "hero" },
      { key: "story_title", value: "Our Story", section: "story" },
      { key: "story_content", value: "At Aura, we believe that your home should be a sanctuary. Our journey began with a simple goal: to create scents that inspire peace and mindfulness.", section: "story" },

      { key: "hero_video_url", value: "", section: "hero" },
      { key: "hero_video_poster", value: "https://lh3.googleusercontent.com/aida-public/AB6AXuAA-cKA0BI5PyiKmmlJ1V4jP1syMuPAzOAXIg7d-HjGJcIi-wOO_raH4mHQISILYP2dCAe3YP8niL9GpCqDGx6U8kAhAJPf1IJEPHryVq-UTqasBOwMnjEhr_6pcPLPG38UbgVhyUd0EDmxBB7oZqinh86xlSSHIGNXBltOus4NhdIR7NMUktxgeJh409TEpLaA5a_g0YFX-JUoUK6mH0gN5DaWIOvpOULZDRFWAnDvBNuh8UppFkbV0cNJjEgGinBO3d1T8xaM-Vu8", section: "hero" },
      { key: "pillar_1_img", value: "/images/pillar-wax.png", section: "pillars" },
      { key: "pillar_2_img", value: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVmDWzO3fIsa6g8efDclw6fOt6K0ZJuceIbbrDTaD2Lyup9gS9lNFkMxB73LazQVYHFhBmALDWnYbd2v6w8WuErf5e4Vz82GS_Od72Mf1OlAuTukU5Oeyby1hGQXAfQIpYZEUBI2hBHRZc5UpwYghogk-pJsppAQBNHIE3XH0kxgQIlcj_x9NVei5WeFiaD1w-KxTTY7ik-KnMJ7DgH9tJg4l8Hgk1q1QLCjurasFTKxaAIXCfeA3lHICD8n2ZVZJux9A1t-KQ2TOZ", section: "pillars" },
      { key: "pillar_3_img", value: "https://lh3.googleusercontent.com/aida-public/AB6AXuDIDE2F4Nv-A22bv0inayjUaRJLcS0bkQlr2QPziWSLLwHEOuiHmCgQRawZ1vUFoXCkDcOQDnc89CjhmuiyWpopVGUtTb5tPxmAZRLBk3fQqix7CCwY2MMxDHKmNPfvbrdXtkQh2NBnB1oP-fOFU3up8ZoMga4eBv1H9X7JXK99tV7p8SFlaImUb8tXfUyiulb3DW9vMLtOr56ol2GoWjkYXGvCMxvMXBOlTBTd81fX0JP82WIY9Bi99-aMl3WSmKI8LefUY2_7fdll", section: "pillars" },
      { key: "spotlight_img", value: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8oz6-Sg586xPq5mJx1g1FLgZ5HcTKJliYsmN46wDI_VUNFS6cC-ocsffImJho4F8OKRpexTgbDv8mLcCDnnNh9BlUZawueRnl9SYPcKMT-bml6_BE5sIoOYyfc7wmmBkxCjDh7gE0id9zfDRErApzvuBNuP4AntNOOgbuvCQGmeEIkK3ZmT7ujCYFxXCupsPBj1V_BCkDMOxI2_rl41q-amM7V7DgXe5p1b5m2iKpn_VUxE94gQyHUb8PBTsd9mzHRZixaQgnlyGn", section: "spotlight" },
      { key: "story_img", value: "/images/story-workshop.png", section: "story" },
      { key: "testimonial_1_img", value: "https://lh3.googleusercontent.com/aida-public/AB6AXuDC0gX_v-BP3YuN_0rTn-FbcluHhhZpqexXR45VaTMmDHWKw5rlBOxpHeVvQJByBF9NUNzWQXa_U0rxD0Z5xXAUvDlqErBVkMeq1CUPAD8r0zGSCxSdkE4sDDIQ9P33nNu73IHLFbZ33uTIqDvSwrwecvoRrHWjTm2V6J4rgRr1m6caMl6Pt1N5idobOAYDvpbCEeL5HQs0uiDfpRBCsKKKpz-0uO95P2AQGIAO2_NcvAriFi26a-Lc0hzzs92Nczg63qktDkBNEkyx", section: "testimonials" },
      { key: "testimonial_2_img", value: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWQkLe8ngyzHV3JPrC9jePY4CSW3yDg0fXr-DV8aKmJzj38Xc3OpJ_q1MrzILnS55ocCqE1cILs_AxZHk0knKxqmvPNSSPQZmhatTp33gMFhrHIp28lAp0v45_uKEslJo5ZAWzP1XenV3wkfPdqIA8crAAGQz8i8kpap7jhFda0yLt68__6eEw0E-bpCA5HGhVdwSD8qkxJYnJEnyb8hmDj3XhUyJzQqznGmvK_tU1Ta7HdFqf0YFN3722hHmYWTtaLwlK-j-E9Kc-", section: "testimonials" },
      { key: "testimonial_3_img", value: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQPXsP1CgPPqF1xvSW7f9T05SRu64pwlRphx1tvALx0wpiBDi2fgpib7qsoJifdDwj9STHpNkOfur_hVi80OURr2ZnaKqK-Nz6E-IgJLnMEh-1HY5dnv7svIMD77DfhYPVm5w4H5q1ene73Vep6u5np-0ossnRSb2VRN4WPD57GdFcKhq6BgWEOyaUNUTxhccO4kJkwbS5Bi9IaFJj0uoOV9yzOSCY9_BIDH3kWRxwbrbpfBI8cYLHguowm5nOZLdKWWlN1BtMj_er", section: "testimonials" },
      { key: "community_1_img", value: "/images/community-1.png", section: "community" },
      { key: "community_2_img", value: "/images/community-2.png", section: "community" },
      { key: "community_3_img", value: "/images/community-3.png", section: "community" },
      { key: "community_4_img", value: "https://lh3.googleusercontent.com/aida-public/AB6AXuDIDE2F4Nv-A22bv0inayjUaRJLcS0bkQlr2QPziWSLLwHEOuiHmCgQRawZ1vUFoXCkDcOQDnc89CjhmuiyWpopVGUtTb5tPxmAZRLBk3fQqix7CCwY2MMxDHKmNPfvbrdXtkQh2NBnB1oP-fOFU3up8ZoMga4eBv1H9X7JXK99tV7p8SFlaImUb8tXfUyiulb3DW9vMLtOr56ol2GoWjkYXGvCMxvMXBOlTBTd81fX0JP82WIY9Bi99-aMl3WSmKI8LefUY2_7fdll", section: "community" },
      { key: "community_5_img", value: "https://lh3.googleusercontent.com/aida-public/AB6AXuBVRS56JXxhvBOmwAnxPzsdkGHOqJHT9et-LYEFwMxGmVIUECqiH7lcXVXuu-XJUSkc_VvJ36f2FJrJpH6NJFuOU1rrbe04rY3A6japGe2FAiBaOPuHUiAdBW2Y0m-Sjn4bGbRH45ABHwEOkEZxncal_hrvss02p1Q9KMWAevVACZXBkuO2AeDa7gtFDqGrgYZjdK7ziqC_Kp5PzZ8sInDxWBI27-ylTsrd35nkix0xvOlTwz5sGteSeaH4upAk5_pBeZ1xJA0r7Z58", section: "community" },
    ];

    for (const content of cmsData) {
      await prisma.cMSContent.upsert({
        where: { key: content.key },
        update: {},
        create: content,
      });
    }


    // Create 4 Admins
    console.log('Seeding Admins...');
    const hashedPass = await bcrypt.hash('admin123', 10);
    const admins = ['admin1', 'admin2', 'admin3', 'admin4'];

    for (const username of admins) {
      await prisma.admin.upsert({
        where: { username },
        update: {},
        create: {
          username,
          password: hashedPass,
        },
      });
    }
    console.log('Admins seeded successfully.');

    
    console.log('Seeding finished.');
  } catch (err) {
    console.error('Error during seeding:', err);
    throw err;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
