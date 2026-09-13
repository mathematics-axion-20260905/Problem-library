import type { Metadata } from "next";
import { noIndexRobots } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Research projects",
    description: "Private project workspace for connected calculations, notes, scientific objects and documents.",
    alternates: { canonical: "/projects" },
    robots: noIndexRobots,
};

export default function ProjectsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return children;
}
