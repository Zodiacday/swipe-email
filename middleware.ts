import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: ({ token }) => !!token,
    },
});

export const config = {
    matcher: [
        "/swipe/:path*",
        "/dashboard/:path*",
        "/mode-select/:path*",
        "/profile/:path*",
        "/automation/:path*",
        "/providers/:path*",
    ],
};

