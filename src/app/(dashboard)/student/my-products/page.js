import ProductList from "@/components/student/myProducts/ProductList";
import { getCurrentUser } from "@/lib/auth-service";
import React from "react";

export default async function myProductPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <ProductList userId={user?.userId} />
    </div>
  );
}
