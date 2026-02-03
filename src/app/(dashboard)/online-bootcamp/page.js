import BootcampDashboard from "@/components/bootcamp/BootcampDashboard";
import { getCurrentUser } from "@/lib/auth-service";
import dbConnect from "@/lib/db";
import BootcampParticipant from "@/models/BootcampParticipant";
import Transaction from "@/models/Transaction";

export default async function OnlineBootcampPage() {
  const user = await getCurrentUser();
  await dbConnect();

  if (!user) {
    return (
      <div className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6'>
        <p className='text-sm text-zinc-500 dark:text-zinc-400'>
          Anda harus login untuk melihat dashboard bootcamp.
        </p>
      </div>
    );
  }

  const participantDoc = await BootcampParticipant.findOne({
    userId: user.userId,
  }).lean();

  const participant = participantDoc
    ? {
        ...participantDoc,
        _id: String(participantDoc._id),
        userId: String(participantDoc.userId),
        createdAt: participantDoc.createdAt
          ? participantDoc.createdAt.toISOString()
          : null,
        updatedAt: participantDoc.updatedAt
          ? participantDoc.updatedAt.toISOString()
          : null,
      }
    : null;

  const transactions = participantDoc
    ? await Transaction.find({
        userId: user.userId,
        itemType: "BootcampParticipant",
        itemId: participantDoc._id,
      })
        .select("status bootcampFeeType price createdAt")
        .lean()
    : [];

  const getLatestPaid = (feeType) => {
    const paidItems = transactions
      .filter(
        (trx) => trx.status === "completed" && trx.bootcampFeeType === feeType,
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return paidItems[0] || null;
  };

  const registrationPaid = getLatestPaid("registration");
  const classPaid = getLatestPaid("class");

  const paymentItems = [
    {
      id: "registration",
      title: "Biaya Pendaftaran",
      description: "Pembayaran awal untuk mengamankan kursi bootcamp.",
      amount: participant?.registrationFee ?? 100000,
      paid: Boolean(registrationPaid),
      paidAt: registrationPaid?.createdAt || null,
    },
    {
      id: "class",
      title: "Biaya Kelas",
      description: "Pelunasan biaya kelas sebelum bootcamp dimulai.",
      amount: participant?.classFee ?? 3000000,
      paid: Boolean(classPaid),
      paidAt: classPaid?.createdAt || null,
    },
  ];

  return (
    <BootcampDashboard
      user={user}
      participant={participant}
      paymentItems={paymentItems}
    />
  );
}
