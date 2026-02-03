import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-gray-400">
          Memuat halaman reset...
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
