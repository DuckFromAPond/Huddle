import { NextResponse, type NextRequest } from "next/server";

const APP_ORIGIN = process.env.APP_ORIGIN ?? "http://app.localhost:3000";
const LANDING_ENABLED = false;

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const { pathname, search } = req.nextUrl;

  const isAppHost = host.startsWith("app.");

  if (isAppHost) {
    // the landing page must not be reachable on the app domain
    if (pathname === "/" || pathname.startsWith("/welcome")) {
      return NextResponse.redirect(new URL("/projects", req.url));
    }
    return NextResponse.next();
  }

  // main domain: "/" shows the landing page, everything else goes to the app domain
  if (LANDING_ENABLED && pathname === "/") {
    return NextResponse.rewrite(new URL("/welcome", req.url));
  }
  return NextResponse.redirect(new URL(pathname + search, APP_ORIGIN));
}

export const config = {
  // skip Next internals and static files
  matcher: ["/((?!_next/|favicon.ico|.*\\..*).*)"],
};
