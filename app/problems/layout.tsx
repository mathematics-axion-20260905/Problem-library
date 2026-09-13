import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Scientific problem library",
    description: "Browse structured engineering and science cases with constraints, formulas, calculations, graphs, code and provenance.",
    alternates: { canonical: "/problems" },
};

export default function ProblemsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return children;
}
