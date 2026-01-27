import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const getCurrentUser = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Kembalikan data user dari token
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      // Anda bisa fetch detail lengkap dari DB di sini jika perlu,
      // tapi untuk performa, data di token biasanya cukup untuk UI dasar.
    };
  } catch (error) {
    return null;
  }
};
