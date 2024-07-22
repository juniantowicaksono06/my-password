import "../../../assets/css/globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import '../../../assets/css/satoshi.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false; /* eslint-disable import/first */


export const metadata: Metadata = {
  title: "Login OTP Page",
  description: "Login OTP Page",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["nextjs", "nextjs13", "next13", "pwa", "next-pwa"],
  // themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#fff" }],
  authors: [
    { name: "Junianto Ichwan Dwi Wicaksono" },
    {
      name: "Junianto Ichwan Dwi Wicasono",
      url: "https://www.linkedin.com/in/junianto-wicaksono-1655a415b/",
    },
  ],
  icons: [
    { rel: "apple-touch-icon", url: "/icons/icon-128x128.png" },
    { rel: "icon", url: "/icons/icon-128x128.png" },
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
