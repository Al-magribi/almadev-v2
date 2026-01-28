import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import archiver from "archiver"; // Wajib: npm install archiver

export async function GET() {
  try {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const publicDir = path.join(process.cwd(), "public");

    // Cek header response untuk download file
    const headers = new Headers();
    headers.append(
      "Content-Disposition",
      'attachment; filename="public-backup.zip"',
    );
    headers.append("Content-Type", "application/zip");

    // Membuat ReadableStream dari archiver
    const stream = new ReadableStream({
      start(controller) {
        archive.on("data", (chunk) => controller.enqueue(chunk));
        archive.on("end", () => controller.close());
        archive.on("error", (err) => controller.error(err));

        // Masukkan folder public ke dalam zip
        archive.directory(publicDir, false);
        archive.finalize();
      },
    });

    return new Response(stream, { headers });
  } catch (error) {
    console.error("Zip Error:", error);
    return NextResponse.json(
      { error: "Gagal membuat backup folder public" },
      { status: 500 },
    );
  }
}
