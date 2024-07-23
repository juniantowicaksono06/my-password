import dynamic from 'next/dynamic'
import { cookies } from "next/headers";
import NextCrypto from 'next-crypto'
import "../assets/css/globals.css";
import '../assets/css/satoshi.css';
import { headers } from 'next/headers';
import type { Metadata } from "next";
import TokenHandler from '../shared/TokenHandler';
async function getProfile() {
  const headerList = headers();
  const cookieStore = cookies();
  const encryptAccessToken = cookieStore.get("accessToken");
  if(encryptAccessToken === undefined) {
      return undefined;
  }
  try {
    const verifyToken = new TokenHandler();
    verifyToken.init();
    await verifyToken.validate();
    let accessToken = verifyToken.getAccessPayload() as Forms.IUserData;
    return accessToken;
  } catch (error) {
    return undefined;
  }
}

export const metadata: Metadata = {
  title: "My Password",
  description: "Secure Your Password",
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
}

export default async function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const profile = await getProfile();
    const MainLayout = dynamic(() => 
      import('@/src/components/MainLayout/MainLayout'), {
        ssr: true
      }
    );
    const LoadingProvider = dynamic(() => 
      import('@/src/components/MainLayout/LoadingProvider'), {
        ssr: true
      }
    );
    const headerList = headers();
    const pathname = headerList.get('x-current-path');
    return <>
      <html>
        <body className="">
          <LoadingProvider>
            <MainLayout profile={profile}>
              {children}
            </MainLayout>
          </LoadingProvider>
        </body>
      </html>
    </>
}