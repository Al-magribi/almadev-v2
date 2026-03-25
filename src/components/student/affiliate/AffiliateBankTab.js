import { Building2 } from "lucide-react";
import {
  BankFormCard,
  QuickInfo,
} from "@/components/student/affiliate/AffiliateShared";
import { formatRupiah } from "@/lib/client-utils";

export default function AffiliateBankTab({
  user,
  formAction,
  isPending,
  affiliateCode,
  nextPayoutDate,
  metrics,
}) {
  return (
    <div className='grid gap-6 lg:grid-cols-[0.95fr,1.05fr]'>
      <BankFormCard
        user={user}
        formAction={formAction}
        isPending={isPending}
        mode='edit'
      />
    </div>
  );
}
