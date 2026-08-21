import type { Metadata } from "next";
import {
  Anton,
  Gloock,
  Italiana,
  Bricolage_Grotesque,
  Hanken_Grotesk,
  Shantell_Sans,
  Space_Mono,
} from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-hanken",
  display: "swap",
});
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});
const shantell = Shantell_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-shantell",
  display: "swap",
});
// section headings — the high-contrast display serif
const gloock = Gloock({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-gloock",
  display: "swap",
});
// the drag box — high-contrast deco display
const italiana = Italiana({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-italiana",
  display: "swap",
});
// Anton is sampled inside a canvas, so the Hero needs its resolved family name.
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Swapnanil Manna — Full-stack & AI product engineer",
  description:
    "Freelance full-stack and AI product engineer. I take products from an empty repo to something real users log into — database, API, AI pipeline and interface.",
  openGraph: {
    title: "Swapnanil Manna — Full-stack & AI product engineer",
    description:
      "Freelance full-stack and AI product engineer. Design, code and AI from one person.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      // browser extensions routinely stamp attributes onto <html> before React
      // hydrates; that's the only mismatch this page can produce
      suppressHydrationWarning
      className={`${bricolage.variable} ${hanken.variable} ${spaceMono.variable} ${shantell.variable} ${gloock.variable} ${italiana.variable} ${anton.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
