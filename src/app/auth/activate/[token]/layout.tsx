import "@/src/assets/css/globals.css";
import '@/src/assets/css/satoshi.css';
import { pathname } from 'next-extra/pathname';
import { headers } from 'next/headers';
// import  { ConnectDB, userCollection } from '@/src/database/index';
import Database from "@/src/database/database";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
    title: "Activate User",
    description: "Activate User Page",
  };

async function activate() {
  const base = `${headers().get('x-forwarded-proto')}://${headers().get('host')}`
  const fullUrl = new URL(pathname(), base);
  const urlPath = fullUrl.pathname;
  let splitUrl = urlPath.split('/activate/');
  let token = splitUrl[1];
  var currentDate = new Date();
  const dbMain = new Database('main');
  dbMain.initModel();
  const {userCollection} = dbMain.getModels();
  console.log(token)
  const query = await userCollection!.findOne({
    userStatus: {
      $ne: 1,
    },
    // $or: [
    //   {
    //     userStatus: {
    //       $gt: 1
    //     }
    //   },
    //   {
    //     userStatus: {
    //       $lt: 1
    //     }
    //   }
    // ],
    userActivationToken: token,
    userActivationTokenValidDate: {
      $gt: currentDate
    }
  })
  if(query) {
    await userCollection!.updateOne({
      _id: query['_id']
    }, {
      $set: {
        userStatus: 1
      }
    })
  }
}

export default async function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    await activate();
    return <>
      <html lang="en">
        <body className={inter.className}>
            {children}
        </body>
      </html>
    </>
}