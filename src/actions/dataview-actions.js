// actions/dataview-actions.js
"use server";

import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import ViewData from "@/models/ViewData";
import Transaction from "@/models/Transaction";

const ANALYTIC_TIMEZONE = "Asia/Jakarta";
const ANALYTIC_UTC_OFFSET_HOURS = 7;

function formatDateKeyInOffset(date, offsetHours = ANALYTIC_UTC_OFFSET_HOURS) {
  const shifted = new Date(date.getTime() + offsetHours * 60 * 60 * 1000);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLastDaysRangeInOffset(days, offsetHours = ANALYTIC_UTC_OFFSET_HOURS) {
  const offsetMs = offsetHours * 60 * 60 * 1000;
  const now = new Date();
  const offsetNow = new Date(now.getTime() + offsetMs);

  offsetNow.setHours(23, 59, 59, 999);
  const offsetStart = new Date(offsetNow);
  offsetStart.setDate(offsetNow.getDate() - (days - 1));
  offsetStart.setHours(0, 0, 0, 0);

  return {
    startDate: new Date(offsetStart.getTime() - offsetMs),
    endDate: new Date(offsetNow.getTime() - offsetMs),
  };
}

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

    const itemId = new mongoose.Types.ObjectId(courseId);

    // =========================
    // Core metrics
    // =========================
    const totalViews = await ViewData.countDocuments({ itemId });

    const uniqueVisitors = await ViewData.distinct("ipAddress", {
      itemId,
      ipAddress: { $nin: [null, ""] },
    });

    const revenueAgg = await Transaction.aggregate([
      { $match: { itemId, status: "completed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$price" },
          totalSales: { $sum: 1 },
          avgOrderValue: { $avg: "$price" },
        },
      },
    ]);

    const refundAgg = await Transaction.aggregate([
      { $match: { itemId, refundAmount: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          refundAmount: { $sum: "$refundAmount" },
          refundCount: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const totalSales = revenueAgg[0]?.totalSales || 0;
    const avgOrderValue = revenueAgg[0]?.avgOrderValue || 0;
    const refundAmount = refundAgg[0]?.refundAmount || 0;
    const refundCount = refundAgg[0]?.refundCount || 0;
    const netRevenue = totalRevenue - refundAmount;

    const conversionRate =
      totalViews > 0 ? Number(((totalSales / totalViews) * 100).toFixed(2)) : 0;

    // =========================
    // Date range (last 14 days)
    // =========================
    const { startDate, endDate } = getLastDaysRangeInOffset(14);

    const viewTrends = await ViewData.aggregate([
      { $match: { itemId, createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: ANALYTIC_TIMEZONE,
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const salesTrends = await Transaction.aggregate([
      {
        $match: {
          itemId,
          status: "completed",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: ANALYTIC_TIMEZONE,
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // =========================
    // Traffic sources (UTM)
    // =========================
    const sourceStats = await ViewData.aggregate([
      { $match: { itemId } },
      {
        $group: {
          _id: { $ifNull: ["$utmSource", "direct"] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const mediumStats = await ViewData.aggregate([
      { $match: { itemId } },
      {
        $group: {
          _id: { $ifNull: ["$utmMedium", "unknown"] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const campaignStats = await ViewData.aggregate([
      { $match: { itemId } },
      {
        $group: {
          _id: { $ifNull: ["$utmCampaign", "unknown"] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // =========================
    // Transaction breakdowns
    // =========================
    const paymentMethodStats = await Transaction.aggregate([
      { $match: { itemId, status: "completed" } },
      {
        $group: {
          _id: { $ifNull: ["$paymentMethod", "unknown"] },
          count: { $sum: 1 },
          revenue: { $sum: "$price" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const statusStats = await Transaction.aggregate([
      { $match: { itemId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const trendByDate = (days, list) => {
      const map = new Map(list.map((d) => [d._id, d.count]));
      const result = [];
      for (let i = 0; i < days; i += 1) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const key = formatDateKeyInOffset(date);
        result.push({ date: key, count: map.get(key) || 0 });
      }
      return result;
    };

    return {
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      totalRevenue,
      netRevenue,
      totalSales,
      avgOrderValue,
      refundAmount,
      refundCount,
      conversionRate,
      sourceStats: sourceStats.map((s) => ({ source: s._id, count: s.count })),
      mediumStats: mediumStats.map((s) => ({ medium: s._id, count: s.count })),
      campaignStats: campaignStats.map((s) => ({
        campaign: s._id,
        count: s.count,
      })),
      paymentMethodStats: paymentMethodStats.map((s) => ({
        method: s._id,
        count: s.count,
        revenue: s.revenue,
      })),
      statusStats: statusStats.map((s) => ({ status: s._id, count: s.count })),
      dailyViews: trendByDate(14, viewTrends),
      dailySales: trendByDate(14, salesTrends),
    };
  } catch (error) {
    throw new Error("Gagal mengambil data analitik");
  }
}
