"use client"

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "../Header";
import Sidebar from "../Sidebar";
import {useLoading } from "./LoadingProvider";
import Loader from "../Loader/Loader";

export default function MainLayout({
    children,
    profile
  }: Readonly<{
    children: React.ReactNode;
    profile: undefined | Forms.IUserData;
  }>) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const {state, dispatch} = useLoading();
    const pathname = usePathname();
    const authenticatePath = ["/auth/login", "/auth/register", "/auth/login-otp"];
    // const Header = React.lazy(() => import("../Header"));
    // const Sidebar = React.lazy(() => import("../Sidebar"));
    return (
        authenticatePath.includes(pathname.toLowerCase()) || pathname.toLowerCase().startsWith("/auth/activate") ?
            <div className="w-full h-full overflow-auto py-10">
                {children}
            </div>
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
                            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
            {/* <Suspense fallback={<Loader />}>
            </Suspense> */}
        </>
    )
} 