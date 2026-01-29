// actions/dataview-actions.js
"use server";

import dbConnect from "@/lib/db";
import ViewData from "@/models/ViewData";
import Transaction from "@/models/Transaction";

export async function trackPageView(data) {
  try {
    await dbConnect();
    await ViewData.create({
      landingId: data.landingId,
      itemId: data.itemId,
      utmSource: data.utmSource || "direct",
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      pageUrl: data.pageUrl,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to track view:", error);
    return { success: false };
  }
}

export async function getAnalyticData(courseId) {
  try {
    await dbConnect();

    // 1. Ambil total views
    const totalViews = await ViewData.countDocuments({ itemId: courseId });

    // 2. Ambil data transaksi (Revenue & Conversion)
    const transactions = await Transaction.find({
      itemId: courseId,
      status: "completed",
    });
    const totalRevenue = transactions.reduce(
      (acc, curr) => acc + curr.price,
      0,
    );
    const totalSales = transactions.length;

    // 3. Hitung Conversion Rate
    const conversionRate =
      totalViews > 0 ? ((totalSales / totalViews) * 100).toFixed(2) : 0;

    // 4. Data Chart Sederhana (Grouping by Source)
    const sourceStats = await ViewData.aggregate([
      { $match: { itemId: new Object(courseId) } },
      { $group: { _id: "$utmSource", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return {
      totalViews,
      totalRevenue,
      totalSales,
      conversionRate,
      sourceStats: sourceStats.map((s) => ({ source: s._id, count: s.count })),
    };
  } catch (error) {
    throw new Error("Gagal mengambil data analitik");
  }
}
