import { withAuth } from "next-auth/middleware";

// Protect all /dashboard/* routes — redirect to /login if unauthenticated
export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    matcher: ["/dashboard/:path*", "/circles/:path*", "/pitch"],
};
