import { MetadataRoute } from "next";

// Regenerated per-request (runtime env) so the sitemap URL follows
// NEXT_PUBLIC_SITE_URL instead of being baked at build time.
export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
