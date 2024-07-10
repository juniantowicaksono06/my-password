import dynamic from 'next/dynamic'
import { cookies } from "next/headers";
import NextCrypto from 'next-crypto'
import "../assets/css/globals.css";
import '../assets/css/satoshi.css';
import { headers } from 'next/headers';
import type { Metadata } from "next";
import jwt from 'jsonwebtoken';
async function getProfile() {
  const cookieStore = cookies();
  const encryptAccessToken = cookieStore.get("accessToken");
  if(encryptAccessToken === undefined) {
      return null;
  }
  const accessTCrypto = new NextCrypto(process.env.SECRET_KEY as string);
  const accessToken = await accessTCrypto.decrypt(encryptAccessToken.value);
  const token = jwt.verify(accessToken as string, process.env.JWT_SECRET_KEY as string);
  const {data} = token as {
    exp: number,
    data: Forms.IUserData
  };
  return data;
}

export const metadata: Metadata = {
  title: "My Password",
  description: "Secure Your Password",
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
    )
    const headerList = headers()
    const pathname = headerList.get('x-current-path')
    return <>
      <html>
        <body className="">
          <MainLayout profile={profile}>
            {children}
          </MainLayout>
        </body>
      </html>
    </>
}