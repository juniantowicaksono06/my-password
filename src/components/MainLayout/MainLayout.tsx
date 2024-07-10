"use client"

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "../Sidebar";
import Header from "../Header";

export default function MainLayout({
    children,
    profile
  }: Readonly<{
    children: React.ReactNode;
    profile: null | Forms.IUserData;
  }>) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname()
    const authenticatePath = ["/auth/login", "/auth/register"]
    return (
        authenticatePath.includes(pathname.toLowerCase()) ?
            <div className="w-full h-full overflow-auto py-10">
                {children}
            </div>
        :
        <>
            <div className="dark:bg-boxdark-2 dark:text-bodydark">
                <div className="flex h-screen overflow-hidden">
                    {/* SIDEBAR */}
                    <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                        {/* HEADER */}
                        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} profile={profile} />  
                        <main>
                            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </>
    )
} 