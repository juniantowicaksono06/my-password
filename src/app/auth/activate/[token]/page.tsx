
"use client"

import { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    sessionStorage.setItem('flash_success', 'Your account has been activated');
    window.location.href = '/auth/login';
  }, []);
  return <>
  </>
}

export default Page;