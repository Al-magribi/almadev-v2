"use server";

import dbConnect from "@/lib/db";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";
import Course from "@/models/Course";
import { revalidatePath } from "next/cache";

const serialize = (data) => JSON.parse(JSON.stringify(data));

// 1. GET ALL CONVERSATIONS (SIDEBAR)
export async function getAdminConversations(filter = "all") {
  await dbConnect();
  try {
    const query = {};
    if (filter === "solved") query.isSolved = true;
    if (filter === "unsolved") query.isSolved = false;

    const conversations = await Conversation.find(query)
      .populate("participantId", "name avatar email")
      .populate("courseId", "name")
      .sort({ lastMessageAt: -1 })
      .lean();

    return { success: true, data: serialize(conversations) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 2. GET MESSAGES BY CONVERSATION ID
export async function getMessages(conversationId) {
  await dbConnect();
  try {
    // Reset admin unread count saat dibuka
    await Conversation.findByIdAndUpdate(conversationId, {
      instructorUnreadCount: 0,
    });

    const messages = await Message.find({ conversationId })
      .populate("senderId", "name avatar role")
      .sort({ createdAt: 1 })
      .lean();

    return { success: true, data: serialize(messages) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 3. SEND MESSAGE (REPLY)
export async function sendMessage({
  conversationId,
  senderId,
  messageContent,
}) {
  await dbConnect();
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new Error("Percakapan tidak ditemukan");

    // Tentukan receiver (kebalikan dari sender)
    const receiverId =
      conversation.participantId.toString() === senderId
        ? conversation.instructorId
        : conversation.participantId;

    const newMessage = await Message.create({
      conversationId,
      senderId,
      senderType: "instructor", // Asumsi admin bertindak sbg instructor
      receiverId,
      message: messageContent,
      isRead: false,
    });

    // Update percakapan
    conversation.lastMessage = newMessage._id;
    conversation.lastMessageAt = new Date();
    conversation.participantUnreadCount += 1; // User dapet notif
    await conversation.save();

    revalidatePath("/admin/message");
    return { success: true, data: serialize(newMessage) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 4. TOGGLE SOLVED STATUS
export async function toggleSolved(conversationId, status) {
  await dbConnect();
  try {
    await Conversation.findByIdAndUpdate(conversationId, { isSolved: status });
    revalidatePath("/admin/message");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 5. DELETE MESSAGE (CRUD)
export async function deleteMessage(messageId) {
  await dbConnect();
  try {
    await Message.findByIdAndDelete(messageId);
    revalidatePath("/admin/message");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 6. UPDATE MESSAGE (CRUD)
export async function updateMessage(messageId, newContent) {
  await dbConnect();
  try {
    await Message.findByIdAndUpdate(messageId, { message: newContent });
    revalidatePath("/admin/message");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
