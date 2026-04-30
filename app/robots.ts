import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register"],
        disallow: ["/dashboard", "/picker", "/admin", "/api/"],
      },
    ],
    sitemap: "https://drawlot.com/sitemap.xml",
  };
}
