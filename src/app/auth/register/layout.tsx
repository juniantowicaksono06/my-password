import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../../assets/css/globals.css";
import '../../../assets/css/satoshi.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false; /* eslint-disable import/first */


export const metadata: Metadata = {
  title: "Register Page",
  description: "Register Page",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["nextjs", "nextjs13", "next13", "pwa", "next-pwa"],
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#fff" }],
  authors: [
    { name: "Junianto Ichwan Dwi Wicaksono" },
    {
      name: "Junianto Ichwan Dwi Wicasono",
      url: "https://www.linkedin.com/in/junianto-wicaksono-1655a415b/",
    },
  ],
  viewport:
    "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
  icons: [
    { rel: "apple-touch-icon", url: "icons/icon-128x128.png" },
    { rel: "icon", url: "icons/icon-128x128.png" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full h-full overflow-auto py-10">
        {children}
    </div>
  );
}
