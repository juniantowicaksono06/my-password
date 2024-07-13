/** @type {import('next').NextConfig} */
import NextPWA from 'next-pwa'
const nextConfig = {
    env: {
        GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID,
        GOOGLE_SECRET: process.env.GOOGLE_SECRET,
        RESIZE_IMAGE_WIDTH: process.env.RESIZE_IMAGE_WIDTH,
        RESIZE_IMAGE_HEIGHT: process.env.RESIZE_IMAGE_HEIGHT
    },
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'my-password-theta.vercel.app',
                pathname: '/**',
            },
        ]
    }
};

const withPWA = NextPWA({
    cacheOnFrontEndNav: true,
    reloadOnOnline: true,
    dest: "public",
    disable: false,
    register: true,
    skipWaiting: true,
    fallbacks: {
        //image: "/static/images/fallback.png",
        document: "/offline", // if you want to fallback to a custom page rather than /_offline
        // font: '/static/font/fallback.woff2',
        // audio: ...,
        // video: ...,
    }
    // ... other options you like
});
  

export default withPWA(nextConfig);
