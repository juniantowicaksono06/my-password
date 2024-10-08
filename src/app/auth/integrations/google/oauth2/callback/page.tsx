'use client'
import { useSearchParams  } from 'next/navigation'
import { useEffect, useState } from 'react';
import Loading from '@/src/components/Loading/Loading';
import Swal from 'sweetalert2';
import { json } from 'stream/consumers';

const CallbackPage = () => {
    const urlParams = useSearchParams();
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const [isLoading, setIsLoading] = useState(true);
    const redirectToHome = async() => {
        if(state === localStorage.getItem('latestCSRFToken')) {
            setIsLoading(true);
            let response = await fetch(`${window.location.origin}/api/google-oauth2/auth`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: code
                }),
                credentials: 'include',
                redirect: 'follow'
            });
            if(response.ok) {
                localStorage.removeItem('latestCSRFToken');
                window.location.href = '/auth/login-otp';
            }
            else {
                Swal.fire({
                    title: "Error",
                    text: "Token is invalid",
                    didClose: () => {
                        window.location.href = '/auth/login';
                    },
                    icon: "error",
                    toast: false,
                    showConfirmButton: true,
                })
            }
        }
    }
    useEffect(() => {
        redirectToHome();
    }, [])
    return <>
        <Loading isLoading={isLoading} />
    </>
}

export default CallbackPage;