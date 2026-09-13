import type { Metadata } from "next";

export const SITE_URL = "https://dirac.space";
export const SITE_NAME = "Axion Science";
export const SITE_DESCRIPTION =
    "A connected scientific workspace where computation, reasoning, visualization and publication share one research context.";

export const siteMetadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: { default: `${SITE_NAME} | Connected scientific workspace`, template: "%s | Axion Science" },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    keywords: ["scientific workspace", "scientific objects", "research project", "problem library", "Axion Science"],
    authors: [{ name: "Axion Science" }],
    creator: "Axion Science",
    publisher: "Axion Science",
    alternates: { canonical: "/" },
    openGraph: {
        type: "website",
        url: SITE_URL,
        siteName: SITE_NAME,
        title: `${SITE_NAME} | Connected scientific workspace`,
        description: SITE_DESCRIPTION,
        locale: "en_US",
    },
    twitter: { card: "summary", title: `${SITE_NAME} | Connected scientific workspace`, description: SITE_DESCRIPTION },
    robots: { index: true, follow: true },
    icons: { icon: "/favicon.ico" },
};

export const noIndexRobots: Metadata["robots"] = {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
};

export const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
};
