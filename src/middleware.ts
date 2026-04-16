import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const PROTECTED_ROUTES = ["/sell", "/checkout", "/messages", "/profile", "/favorites"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session;
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const isProtected = PROTECTED_ROUTES.some((r) => nextUrl.pathname.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some((r) => nextUrl.pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => nextUrl.pathname.startsWith(r));

  if (isAdminRoute && !isAdmin) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/auth/login", nextUrl));
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (isProtected && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname);
    return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${callbackUrl}`, nextUrl));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
