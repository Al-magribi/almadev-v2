import { activateUser } from "@/actions/auth-action";
import ActivateClient from "./ActivateClient";

export default async function ActivatePage({ searchParams }) {
  const resolvedParams = await searchParams;
  const token = resolvedParams?.token;

  if (!token) {
    return (
      <ActivateClient
        status="warning"
        message="Token aktivasi tidak ditemukan atau URL yang Anda akses salah."
        helper="Pastikan Anda membuka link yang dikirimkan ke email."
      />
    );
  }

  const result = await activateUser(token);

  return (
    <ActivateClient
      status={result.success ? "success" : "error"}
      message={result.message}
      helper={
        result.success
          ? "Anda bisa langsung masuk dan mulai belajar."
          : "Silakan coba daftar ulang atau minta bantuan support."
      }
    />
  );
}
