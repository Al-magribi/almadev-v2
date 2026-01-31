import { NextResponse } from "next/server";
import crypto from "crypto";

import dbConnect from "@/lib/db";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import Setting from "@/models/Setting";
import { sendPaymentEmail } from "@/lib/emailService";

export async function POST(req) {
  await dbConnect();

  try {
    const body = await req.json();
    const settings = await Setting.findOne().lean();

    if (!settings?.midtransServerKey) {
      return NextResponse.json(
        { message: "Midtrans belum dikonfigurasi" },
        { status: 500 },
      );
    }

    // =========================
    // 1) Verify signature (Midtrans standard)
    // =========================
    const signatureStr = `${body.order_id}${body.status_code}${body.gross_amount}${settings.midtransServerKey}`;
    const mySignature = crypto
      .createHash("sha512")
      .update(signatureStr)
      .digest("hex");

    if (mySignature !== body.signature_key) {
      return NextResponse.json(
        { message: "Invalid Signature" },
        { status: 403 },
      );
    }

    const orderId = body.order_id; // biasanya = transactionCode
    const trxStatus = body.transaction_status; // settlement|capture|pending|deny|cancel|expire|...

    // =========================
    // 2) Find transaction (idempotent)
    // =========================
    const trx = await Transaction.findOne({
      transactionCode: orderId,
    }).populate({ path: "item", select: "name title" });

    if (!trx) {
      // transaksi mungkin sudah dihapus (cancel/expire), jangan error
      return NextResponse.json({ message: "OK" });
    }

    const itemName =
      trx?.item?.name || trx?.item?.title || trx.itemName || "Pesanan Anda";

    // ambil user untuk email/nama (karena trx tidak menyimpan customerEmail/customerName)
    const user = await User.findById(trx.userId)
      .select("name fullName email")
      .lean();
    const customerName = user?.name || user?.fullName || "Pelanggan";
    const customerEmail = user?.email;

    // Helper: update midtrans fields (debug/audit)
    const midtransUpdate = {
      midtransOrderId: body.order_id,
      midtransStatusCode: body.status_code,
      midtransTransactionStatus: trxStatus,
      paymentMethod: body.payment_type || trx.paymentMethod || "unknown",
      fraudStatus: body.fraud_status || trx.fraudStatus || null,
      midtransPayload: body,
    };

    // =========================
    // 3) Handle statuses
    // =========================
    if (trxStatus === "settlement" || trxStatus === "capture") {
      // mark completed
      await Transaction.updateOne(
        { _id: trx._id },
        {
          $set: {
            status: "completed",
            ...midtransUpdate,
          },
        },
      );

      // aktifkan user (kalau kamu memang pakai isActive/isVerified)
      await User.updateOne(
        { _id: trx.userId },
        { $set: { isActive: true, isVerified: true } },
      );

      // kirim email sukses
      if (customerEmail) {
        await sendPaymentEmail({
          to: customerEmail,
          name: customerName,
          status: "completed",
          transactionId: trx.transactionCode,
          itemName,
          amount: trx.price,
        });
      }
    } else if (trxStatus === "pending") {
      // tetap pending + simpan payload
      await Transaction.updateOne(
        { _id: trx._id },
        {
          $set: {
            status: "pending",
            ...midtransUpdate,
          },
        },
      );

      // (opsional) kirim email pending (biasanya cukup saat create transaksi)
      // if (customerEmail) { ... }
    } else if (["deny", "cancel", "expire"].includes(trxStatus)) {
      // normalize status internal
      const normalized =
        trxStatus === "deny"
          ? "failed"
          : trxStatus === "expire"
            ? "expired"
            : "cancelled";

      // email gagal/cancel/expired
      if (customerEmail) {
        await sendPaymentEmail({
          to: customerEmail,
          name: customerName,
          status: normalized,
          transactionId: trx.transactionCode,
          itemName,
          amount: trx.price,
        });
      }

      // hapus transaksi
      await Transaction.deleteOne({ _id: trx._id });

      // jika user auto-created & tidak ada transaksi lain, hapus user juga
      if (trx.autoCreatedUser) {
        const remaining = await Transaction.countDocuments({
          userId: trx.userId,
        });
        if (remaining === 0) {
          await User.deleteOne({ _id: trx.userId, isAutoCreated: true });
        }
      }
    } else {
      // status lain dari Midtrans: challenge, authorize, etc
      // simpan payload saja biar bisa ditrace
      await Transaction.updateOne(
        { _id: trx._id },
        { $set: { ...midtransUpdate } },
      );
    }

    return NextResponse.json({ message: "OK" });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
