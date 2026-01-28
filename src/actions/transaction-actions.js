"use server";

import Transaction from "@/models/Transaction";
import Course from "@/models/Course";
import Product from "@/models/Product";
import User from "@/models/User"; // Penting untuk populate
import dbConnect from "@/lib/db";
import { revalidatePath } from "next/cache";

// Helper untuk serialize data MongoDB ke Plain Object
const serializeData = (data) => JSON.parse(JSON.stringify(data));

// 1. GET ALL TRANSACTIONS
export async function getAllTransactions() {
  await dbConnect();

  try {
    const transactions = await Transaction.find()
      .populate({
        path: "userId",
        select: "name email avatar", // Ambil data user yg perlu saja
      })
      // Populate dinamis berdasarkan itemType (Course/Product) via Virtual 'item'
      .populate({
        path: "item",
        select: "name title image price category type", // Field yg umum di Product/Course
      })
      .sort({ createdAt: -1 })
      .lean(); // Konversi ke plain object agar ringan

    return { success: true, data: serializeData(transactions) };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { success: false, error: error.message };
  }
}

// 2. GET TRANSACTION ANALYTICS
export async function getTransactionAnalytics() {
  await dbConnect();

  try {
    // A. Total Revenue (Hanya yang Completed)
    const revenueStats = await Transaction.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
    ]);

    // B. Status Distribution
    const statusStats = await Transaction.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // C. UTM Source Analysis (Top Marketing Channels)
    const utmStats = await Transaction.aggregate([
      {
        $group: {
          _id: "$utmSource",
          count: { $sum: 1 },
          revenue: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$price", 0] },
          },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 }, // Ambil top 5 source
    ]);

    // D. Item Type Distribution (Course vs Product)
    const typeStats = await Transaction.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$itemType",
          count: { $sum: 1 },
          revenue: { $sum: "$price" },
        },
      },
    ]);

    return {
      success: true,
      data: {
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
        statusDistribution: serializeData(statusStats),
        utmSources: serializeData(utmStats),
        typeDistribution: serializeData(typeStats),
      },
    };
  } catch (error) {
    console.error("Error analyzing transactions:", error);
    return { success: false, error: error.message };
  }
}
