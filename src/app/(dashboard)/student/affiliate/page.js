import { getUserProfile } from "@/actions/user-actions";
import { getCourses } from "@/actions/course-actions";
import { getProducts } from "@/actions/product-actions";
import { getSettings } from "@/actions/setting-actions";
import AffiliateDashboardSection from "@/components/student/affiliate/AffiliateDashboardSection";
import AffiliateVisit from "@/models/AffiliateVisit";
import ViewData from "@/models/ViewData";
import dbConnect from "@/lib/db";
import Transaction from "@/models/Transaction";
import mongoose from "mongoose";
import { headers } from "next/headers";

const getBaseUrl = async (settingsDomain) => {
  const normalizedDomain = String(settingsDomain || "").trim();
  if (normalizedDomain) {
    if (/^https?:\/\//i.test(normalizedDomain)) {
      return normalizedDomain.replace(/\/+$/, "");
    }
    return `https://${normalizedDomain.replace(/\/+$/, "")}`;
  }

  const headerStore = await headers();
  const host = headerStore.get("host") || "localhost:3000";
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const protocol =
    forwardedProto || (host.includes("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
};

const buildCatalog = ({ user, courses, products, baseUrl }) => {
  const referralCode = user?.referralCode || "";
  const buildLink = (path) =>
    `${baseUrl}${path}?ref=${referralCode}&utm_source=affiliate&utm_medium=referral&utm_campaign=${referralCode}`;
  const slugifyProductName = (name = "") =>
    String(name || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const courseItems = (courses || [])
    .filter((course) => course?.isActive)
    .map((course) => {
      const destinationPath = `/courses/${course.slug}`;
      return {
        id: String(course._id),
        type: "Course",
        name: course.name || "Untitled Course",
        rewardAmount: Number(course.affiliateRewardAmount || 0),
        destinationPath,
        referralLink: buildLink(destinationPath),
      };
    });

  const productItems = (products || []).map((product) => {
    const destinationPath = `/products/${product.slug || slugifyProductName(product.name) || product._id}`;
    return {
      id: String(product._id),
      type: "Product",
      name: product.name || "Untitled Product",
      rewardAmount: Number(product.affiliateRewardAmount || 0),
      destinationPath,
      referralLink: buildLink(destinationPath),
    };
  });

  return [...courseItems, ...productItems].sort(
    (a, b) => b.rewardAmount - a.rewardAmount,
  );
};

const getNextPayoutDate = () => {
  const now = new Date();
  const year =
    now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
  const month = now.getMonth() === 11 ? 0 : now.getMonth() + 1;
  return new Date(year, month, 10).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const maskName = (value = "") => {
  const parts = String(value || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "User";
  if (parts.length === 1) {
    const base = parts[0];
    return `${base.slice(0, 1)}${base.length > 1 ? "***" : ""}`;
  }
  return `${parts[0]} ${parts[1].slice(0, 1)}.`;
};

const maskEmail = (value = "") => {
  const [local, domain] = String(value || "").split("@");
  if (!local || !domain) return "-";
  const visible = local.slice(0, 2);
  return `${visible}${local.length > 2 ? "***" : ""}@${domain}`;
};

export default async function StudentAffiliatePage() {
  const { success, data: user } = await getUserProfile();

  if (!success || !user) {
    return (
      <div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6'>
        <p className='text-gray-500 dark:text-gray-400 text-sm'>
          Anda harus login untuk melihat dashboard affiliate.
        </p>
      </div>
    );
  }

  const [courses, products, settings] = await Promise.all([
    getCourses(),
    getProducts({ status: "published" }),
    getSettings(),
  ]);

  let metrics = {
    visitors: 0,
    conversions: 0,
    transactions: 0,
    rewardTotal: 0,
    rewardReady: 0,
    refunds: 0,
    nextPayoutDate: getNextPayoutDate(),
  };
  let visitors = [];
  let transactions = [];
  const validItemTypes = ["Course", "Product"];

  if (user?.referralCode) {
    await dbConnect();
    const userObjectId = mongoose.Types.ObjectId.isValid(user._id)
      ? new mongoose.Types.ObjectId(user._id)
      : null;
    const affiliateTransactionQuery = {
      $or: [
        ...(userObjectId ? [{ "affiliate.referrerId": userObjectId }] : []),
        { "affiliate.referralCode": user.referralCode },
        {
          utmMedium: "referral",
          utmCampaign: user.referralCode,
        },
      ],
    };
    const [transactionAgg, refundCount, visitDocs, fallbackViewDocs, transactionDocs] =
      await Promise.all([
        Transaction.aggregate([
          {
            $match: affiliateTransactionQuery,
          },
          {
            $group: {
              _id: null,
              transactions: { $sum: 1 },
              rewardTotal: {
                $sum: {
                  $cond: [
                    { $eq: ["$status", "completed"] },
                    "$affiliate.rewardAmount",
                    0,
                  ],
                },
              },
              rewardReady: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$status", "completed"] },
                        { $ne: ["$affiliateRefund.refundStatus", "full"] },
                        { $ne: ["$affiliateRefund.commissionEffect", "void"] },
                      ],
                    },
                    "$affiliate.rewardAmount",
                    0,
                  ],
                },
              },
            },
          },
        ]),
        Transaction.countDocuments({
          ...affiliateTransactionQuery,
          "affiliateRefund.refundStatus": { $ne: "none" },
        }),
        AffiliateVisit.find({
          ...(userObjectId ? { referrerId: userObjectId } : {}),
          itemType: { $in: validItemTypes },
        })
          .sort({ createdAt: -1 })
          .limit(200)
          .lean(),
        ViewData.find({
          itemType: { $in: validItemTypes },
          affiliateVisitId: null,
          $or: [
            { referrerId: user._id },
            { referralCode: user.referralCode },
            { utmCampaign: user.referralCode },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(200)
          .lean(),
        Transaction.find(affiliateTransactionQuery)
          .populate({ path: "userId", select: "name email" })
          .sort({ createdAt: -1 })
          .limit(100)
          .lean(),
      ]);

    const primaryVisitors = visitDocs
      .filter((visit) => validItemTypes.includes(visit.itemType))
      .map((visit) => ({
        id: String(visit._id),
        itemType: visit.itemType,
        landingPath: visit.landingPath || "-",
        utmSource: visit.utmSource || "affiliate",
        utmMedium: visit.utmMedium || "referral",
        utmCampaign: visit.utmCampaign || user.referralCode,
        visitedAt: visit.createdAt
          ? new Date(visit.createdAt).toISOString()
          : null,
        converted: Boolean(visit.convertedTransactionId),
        convertedAt: visit.convertedAt
          ? new Date(visit.convertedAt).toISOString()
          : null,
        referralCode: visit.referralCode || user.referralCode,
      }));

    const fallbackVisitors = fallbackViewDocs
      .filter((view) => validItemTypes.includes(view.itemType))
      .map((view) => ({
        id: `view-${String(view._id)}`,
        itemType: view.itemType,
        landingPath: view.pageUrl || "-",
        utmSource: view.utmSource || "affiliate",
        utmMedium: view.utmMedium || "referral",
        utmCampaign: view.utmCampaign || user.referralCode,
        visitedAt: view.createdAt
          ? new Date(view.createdAt).toISOString()
          : null,
        converted: false,
        convertedAt: null,
        referralCode: view.referralCode || user.referralCode,
      }));

    const visitorEventMap = new Map();
    [...primaryVisitors, ...fallbackVisitors].forEach((visitor) => {
      const visitMinute = visitor?.visitedAt
        ? Math.floor(new Date(visitor.visitedAt).getTime() / 60000)
        : "na";
      const eventKey = [
        String(visitor.itemType || ""),
        String(visitor.referralCode || ""),
        String(visitor.landingPath || ""),
        String(visitor.utmCampaign || ""),
        String(visitMinute),
      ].join("|");

      if (!visitorEventMap.has(eventKey)) {
        visitorEventMap.set(eventKey, visitor);
      }
    });

    const visitorEvents = Array.from(visitorEventMap.values());
    const groupedVisitorMap = new Map();

    visitorEvents.forEach((visitor) => {
      const groupKey = [
        String(visitor.itemType || ""),
        String(visitor.referralCode || ""),
        String(visitor.landingPath || ""),
        String(visitor.utmCampaign || ""),
      ].join("|");
      const existing = groupedVisitorMap.get(groupKey);

      if (!existing) {
        groupedVisitorMap.set(groupKey, {
          ...visitor,
          visitCount: 1,
        });
        return;
      }

      const currentVisitedAt = existing?.visitedAt
        ? new Date(existing.visitedAt).getTime()
        : 0;
      const nextVisitedAt = visitor?.visitedAt
        ? new Date(visitor.visitedAt).getTime()
        : 0;

      existing.visitCount += 1;
      existing.converted = existing.converted || visitor.converted;
      if (!existing.convertedAt && visitor.convertedAt) {
        existing.convertedAt = visitor.convertedAt;
      }
      if (nextVisitedAt >= currentVisitedAt) {
        existing.visitedAt = visitor.visitedAt;
      }
    });

    visitors = Array.from(groupedVisitorMap.values()).sort((a, b) => {
      const left = a?.visitedAt ? new Date(a.visitedAt).getTime() : 0;
      const right = b?.visitedAt ? new Date(b.visitedAt).getTime() : 0;
      return right - left;
    });

    transactions = transactionDocs.map((trx) => {
      const buyerName = trx?.userId?.name || "User";
      const buyerEmail = trx?.userId?.email || "";
      const refundStatus = trx?.affiliateRefund?.refundStatus || "none";
      const payoutStatus =
        refundStatus === "full"
          ? "Tidak diproses"
          : trx.status === "completed"
            ? "Menunggu payout"
            : "Belum valid";

      return {
        id: String(trx._id),
        transactionCode: trx.transactionCode,
        buyerName: maskName(buyerName),
        buyerEmail: maskEmail(buyerEmail),
        itemName: trx.itemName || "Item",
        itemType: trx.itemType,
        price: Number(trx.price || 0),
        rewardAmount: Number(trx?.affiliate?.rewardAmount || 0),
        payoutAmount:
          refundStatus === "full"
            ? 0
            : Number(trx?.affiliate?.rewardAmount || 0),
        status: trx.status,
        payoutStatus,
        refundStatus,
        createdAt: trx.createdAt ? new Date(trx.createdAt).toISOString() : null,
        completedAt: trx.completedAt
          ? new Date(trx.completedAt).toISOString()
          : null,
      };
    });

    metrics = {
      ...metrics,
      visitors: visitorEvents.length,
      conversions: visitorEvents.filter((item) => item.converted).length,
      transactions: transactionAgg[0]?.transactions || 0,
      rewardTotal: transactionAgg[0]?.rewardTotal || 0,
      rewardReady: transactionAgg[0]?.rewardReady || 0,
      refunds: refundCount || 0,
    };
  }

  const baseUrl = await getBaseUrl(settings?.data?.domain);
  const catalog = buildCatalog({ user, courses, products, baseUrl });

  return (
    <AffiliateDashboardSection
      user={user}
      metrics={metrics}
      catalog={catalog}
      visitors={visitors}
      transactions={transactions}
    />
  );
}
