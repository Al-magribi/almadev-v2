import { NextResponse } from "next/server";
import { proxy } from "./src/proxy";

const getStatusLockKey = (id) =>
  `status_locked_${String(id).replace(/[^A-Za-z0-9_-]/g, "_")}`;

export async function middleware(req) {
  const { pathname, searchParams } = req.nextUrl;
  const authResponse = await proxy(req);

  if (authResponse) {
    return authResponse;
  }

  if (pathname.startsWith("/checkout")) {
    if (req.cookies.get("checkout_locked")?.value === "1") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/status") {
    const orderId = searchParams.get("order_id");
    if (orderId) {
      const lockKey = getStatusLockKey(orderId);
      if (req.cookies.get(lockKey)?.value === "1") {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)"],
};
