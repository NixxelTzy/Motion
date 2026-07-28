import { NextResponse } from "next/server";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import os from "os";

export async function POST(req: Request) {
  let outputLocation = "";

  try {
    const body = await req.json();
    const { code, params } = body;

    // Validasi parameter
    if (!code || !params) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const fps = 30;
    const durationInFrames = Math.max(150, params.duration * fps); // Min 5 detik

    const resolutions = {
      "1080": { w: 1920, h: 1080 },
      "1440": { w: 2560, h: 1440 },
      "2160": { w: 3840, h: 2160 },
    };
    const res = resolutions[params.resolution as keyof typeof resolutions] || resolutions["1080"];

    console.log(`[Render Engine] Starting process: ${params.duration}s at ${res.w}x${res.h}`);

    // 1. Bundling File Remotion (Mencari file yang memanggil registerRoot)
    const entryPoint = path.resolve(process.cwd(), "remotion/VideoTemplate.tsx");
    const bundleLocation = await bundle({
      entryPoint,
      webpackOverride: (config) => {
        // Optimalisasi webpack jika diperlukan untuk production
        return config;
      },
    });

    console.log(`[Render Engine] Bundle created at: ${bundleLocation}`);

    // 2. Definisi Output unik untuk menghindari tabrakan antar request
    const uniqueId = `render_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    outputLocation = path.join(os.tmpdir(), `${uniqueId}.mp4`);

    // 3. Proses Render menggunakan FFmpeg bawaan Remotion
    await renderMedia({
      composition: {
        id: "MainVideo", // ID yang didaftarkan di registerRoot
        durationInFrames,
        fps,
        width: res.w,
        height: res.h,
      },
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation,
      inputProps: {
        userCode: code,
        theme: params.theme,
        visualStyle: params.visualStyle,
        scenes: params.scenes,
      },
      onProgress: ({ progress }) => {
        // Berguna jika Anda memindahkannya ke sistem WebSockets di masa depan
        console.log(`[Render Engine] Progress: ${(progress * 100).toFixed(2)}%`);
      },
      imageFormat: "jpeg", // Jpeg lebih cepat dirender dibanding png
    });

    console.log(`[Render Engine] Render Complete. Reading buffer...`);

    // 4. Baca hasil video dan kembalikan sebagai Downloadable Response
    const videoBuffer = fs.readFileSync(outputLocation);

    // Hapus file secara sinkron segera setelah dibaca
    fs.unlinkSync(outputLocation);
    outputLocation = ""; // Reset agar block catch tidak menghapus file yang tidak ada

    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": videoBuffer.length.toString(),
        "Content-Disposition": `attachment; filename="RenderCraft_${params.theme}_${params.resolution}p.mp4"`,
        // Cache control agar browser tidak menyimpan request POST ini
        "Cache-Control": "no-store, max-age=0", 
      },
    });

  } catch (error: any) {
    console.error("[Render Engine] Fatal Error:", error);

    // Pembersihan sistem operasi (Garbage Collector) jika terjadi error di tengah proses
    if (outputLocation && fs.existsSync(outputLocation)) {
      try {
        fs.unlinkSync(outputLocation);
        console.log(`[Render Engine] Cleaned up temp file after error.`);
      } catch (cleanupError) {
        console.error(`[Render Engine] Failed to clean up:`, cleanupError);
      }
    }

    return NextResponse.json({ 
      error: "Render Engine Failed", 
      details: error.message 
    }, { status: 500 });
  }
}
