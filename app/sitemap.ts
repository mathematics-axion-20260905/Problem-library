import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();
    return [
        { url: "https://dirac.space", lastModified, changeFrequency: "weekly", priority: 1 },
        { url: "https://dirac.space/problems", lastModified, changeFrequency: "weekly", priority: 0.9 },
        { url: "https://dirac.space/problems/led-design", lastModified, changeFrequency: "monthly", priority: 0.8 },
    ];
}
