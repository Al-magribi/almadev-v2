import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // --- 1. DEFINISI ROUTES ---
  // Route Auth (Login/Register/Aktivasi)
  const authRoutes = ["/signin", "/signup", "/activate"];

  // Helper Checkers
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  // Karena "selalu dimulai dengan", kita cukup cek prefix-nya saja:
  const isAdminRoute = pathname.startsWith("/admin");
  const isStudentRoute = pathname.startsWith("/student");

  // --- 2. VALIDASI TOKEN ---
  let user = null; // Menyimpan data user jika token valid

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      user = payload; // isinya: { userId, email, role, ... }
    } catch (error) {
      // Jika token error/expired, biarkan user null
    }
  }

  // --- 3. LOGIKA REDIRECT ---

  // KASUS A: User SUDAH LOGIN, tapi mencoba akses halaman AUTH
  // (Misal: sudah login admin, tapi buka /signin lagi) -> Redirect ke Dashboard Role-nya
  if (isAuthRoute && user) {
    if (user.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    } else {
      return NextResponse.redirect(new URL("/student", request.url));
    }
  }

  // KASUS B: User BELUM LOGIN, tapi mencoba akses halaman PROTECTED
  // (Buka /admin atau /student tanpa token) -> Redirect ke Signin
  if ((isAdminRoute || isStudentRoute) && !user) {
    const loginUrl = new URL("/signin", request.url);
    // (Opsional) Simpan URL tujuan agar nanti bisa redirect balik
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // KASUS C: User SUDAH LOGIN, tapi SALAH KAMAR (Cross-Role Protection)
  if (user) {
    // 1. Student mencoba akses Admin -> Tendang ke /student
    if (isAdminRoute && user.role !== "admin") {
      return NextResponse.redirect(new URL("/student", request.url));
    }

    // 2. Admin mencoba akses Student -> Tendang ke /admin
    if (isStudentRoute && user.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // Jika lolos semua pengecekan, lanjut ke halaman tujuan
  return NextResponse.next();
}

export const config = {
  // Middleware berjalan di semua route KECUALI api, _next (static assets), dan file public tertentu
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)"],
};
