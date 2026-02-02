import StatusPageClient from "@/components/marketing/checkout/StatusPageClient";
import { getSettings } from "@/actions/setting-actions";
import { getTransactionByCode } from "@/actions/transaction-actions";

export default async function StatusPage({ searchParams }) {
  const params = searchParams || {};
  const orderId = params.order_id;

  const settings = await getSettings();
  const metaPixelId = settings?.data?.metaPixelId || "";

  const trxResult = orderId ? await getTransactionByCode(orderId) : null;
  const transaction = trxResult?.success ? trxResult.data : null;

  return (
    <StatusPageClient
      searchParams={params}
      metaPixelId={metaPixelId}
      transaction={transaction}
    />
  );
}
