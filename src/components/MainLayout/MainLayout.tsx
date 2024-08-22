"use client"

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "../Header";
import Sidebar from "../Sidebar";
import {useLoading } from "./LoadingProvider";
import Loader from "../Loader/Loader";
import { usePageLoading } from "./PageLoadingProvider";

export default function MainLayout({
    children,
    profile
  }: Readonly<{
    children: React.ReactNode;
    profile: undefined | Forms.IUserData;
  }>) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { state } = useLoading();
    const { pageLoadingState } = usePageLoading();
    const pathname = usePathname();
    const authenticatePath = ["/auth/login", "/auth/register", "/auth/login-otp"];
    return (
        authenticatePath.includes(pathname.toLowerCase()) || pathname.toLowerCase().startsWith("/auth/activate") ?
            <>
                <Loader visibility={state.loading ? "block" : "hidden"} />
                <div className="w-full h-full overflow-auto py-10">
                    {children}
                </div>
            </>
        :
        <>
            <Loader visibility={state.loading ? "block" : "hidden"} />
            <div className={state.loading ? "dark:bg-boxdark-2 dark:text-bodydark hidden" : "dark:bg-boxdark-2 dark:text-bodydark"}>
                <div className="flex h-screen overflow-hidden">
                    {/* SIDEBAR */}
                    <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                        {/* HEADER */}
                        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} profile={profile} />  
                        <main>
                            <Loader visibility={pageLoadingState.loading == true ? "block" : "hidden"} />
                            <div className={pageLoadingState.loading == true ? "mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 hidden": "mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 block"}>
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </>
    )
} 