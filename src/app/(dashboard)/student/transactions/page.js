import React from "react";
import TransactionList from "@/components/student/transactions/TransactionList";
import { getCurrentUser } from "@/lib/auth-service";

export default async function myTransaction() {
  const user = await getCurrentUser();

  return (
    <div>
      <TransactionList userId={user?.userId} />
    </div>
  );
}
