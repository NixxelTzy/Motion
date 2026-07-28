"use client";

import { useState, useEffect } from "react";
import { Player } from "@remotion/player";
import { VideoTemplate } from "../remotion/VideoTemplate";
import { Settings, Play, Download, Code, LayoutTemplate } from "lucide-react";

export default function Home() {
  const [code, setCode] = useState(
    `<div style="padding:40px; background:rgba(255,255,255,0.1); border-radius:20px; backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.2);">\n  <h1 style="font-size: 80px; margin:0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">RenderCraft Engine</h1>\n  <p style="font-size: 30px; margin-top:20px; opacity:0.8;">Inject code, get MP4.</p>\n</div>`
  );
  
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  // Advanced Params
  const [params, setParams] = useState({
    theme: "Business",
    duration: 10,
    scenes: 3,
    visualStyle: "Grid Minimalist",
    resolution: "1080",
  });

  const resolutions = {
    "1080": { w: 1920, h: 1080, label: "1K FHD" },
    "1440": { w: 2560, h: 1440, label: "2K QHD" },
    "2160": { w: 3840, h: 2160, label: "4K UHD" },
  };
  const currentRes = resolutions[params.resolution as keyof typeof resolutions];

  // Efek simulasi progress bar saat fetch API
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRendering) {
      setRenderProgress(0);
      interval = setInterval(() => {
        setRenderProgress((prev) => {
          // Lambatkan progress saat mencapai 90% sambil menunggu response
          if (prev >= 90) return prev; 
          return prev + Math.random() * 5;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isRendering]);

  const handleRender = async () => {
    setIsRendering(true);
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, params }),
      });

      if (!res.ok) throw new Error(await res.text());

      setRenderProgress(100);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `RenderCraft_${params.theme}_${params.duration}s_${params.resolution}p.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(`Render Failed: ${error.message}`);
    } finally {
      setTimeout(() => {
        setIsRendering(false);
        setRenderProgress(0);
      }, 1000);
    }
  };

  return (
    <main className="flex h-screen bg-background text-sm font-medium overflow-hidden">
      {/* SIDEBAR PARAMETERS */}
      <aside className="w-80 bg-surface border-r border-border p-6 flex flex-col gap-6 overflow-y-auto">
        <div className="flex items-center gap-2 text-primary">
          <Play fill="currentColor" size={24} />
          <h1 className="text-xl font-bold tracking-wider text-white">RENDER<span className="text-primary">CRAFT</span></h1>
        </div>

        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-2 text-gray-400 mb-2 border-b border-border pb-2">
            <Settings size={16} /> <span>Prompt Parameters</span>
          </div>

          {/* Theme */}
          <div className="space-y-1">
            <label className="text-gray-400 text-xs">TEMA (Adobe Stock Sync)</label>
            <select value={params.theme} onChange={e => setParams({...params, theme: e.target.value})} className="w-full bg-background border border-border p-2.5 rounded-md text-white focus:border-primary outline-none transition">
              <option>Business</option><option>Education</option><option>Technology</option>
            </select>
          </div>

          {/* Duration */}
          <div className="space-y-1">
            <label className="text-gray-400 text-xs">DURASI VIDEO</label>
            <select value={params.duration} onChange={e => setParams({...params, duration: Number(e.target.value)})} className="w-full bg-background border border-border p-2.5 rounded-md text-white focus:border-primary outline-none transition">
              {[5, 10, 15, 20, 25, 30].map(d => <option key={d} value={d}>{d} Detik</option>)}
            </select>
          </div>

          {/* Scenes Range */}
          <div className="space-y-1">
            <label className="text-gray-400 text-xs flex justify-between">
              <span>JUMLAH SCENE</span> <span className="text-primary">{params.scenes}</span>
            </label>
            <input type="range" min="1" max="10" value={params.scenes} onChange={e => setParams({...params, scenes: Number(e.target.value)})} className="w-full accent-primary h-2 bg-background rounded-lg appearance-none cursor-pointer" />
          </div>

          {/* Visual Style */}
          <div className="space-y-1">
            <label className="text-gray-400 text-xs">GAYA VISUAL</label>
            <select value={params.visualStyle} onChange={e => setParams({...params, visualStyle: e.target.value})} className="w-full bg-background border border-border p-2.5 rounded-md text-white focus:border-primary outline-none transition">
              <option>Flat Vector</option><option>Grid Minimalist</option><option>Dark Cinematic</option>
            </select>
          </div>

          {/* Resolution */}
          <div className="space-y-1">
            <label className="text-gray-400 text-xs">RESOLUSI (16:9)</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(resolutions).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setParams({...params, resolution: key})}
                  className={`p-2 rounded border text-xs text-center transition ${params.resolution === key ? 'bg-primary/20 border-primary text-primary' : 'bg-background border-border text-gray-500 hover:border-gray-600'}`}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-border">
          <button 
            onClick={handleRender} disabled={isRendering}
            className="w-full bg-primary hover:bg-primaryHover text-white p-3 rounded-lg flex items-center justify-center gap-2 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          >
            {isRendering ? (
              <span className="relative z-10 flex items-center gap-2 animate-pulse">Rendering {Math.round(renderProgress)}%</span>
            ) : (
              <><Download size={18}/> RENDER TO MP4</>
            )}
            {/* Progress bar background */}
            {isRendering && (
              <div className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-300" style={{ width: `${renderProgress}%` }} />
            )}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
        
        {/* PREVIEW PANEL */}
        <div className="flex-1 bg-surface border border-border rounded-xl flex flex-col overflow-hidden shadow-2xl">
          <div className="bg-background/50 border-b border-border p-3 flex items-center gap-2 text-gray-400">
            <LayoutTemplate size={16}/> <span>Live Render Preview</span>
            <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-1 rounded">30 FPS</span>
          </div>
          <div className="flex-1 p-6 flex items-center justify-center bg-[#050505]">
            <div className="w-full max-w-4xl aspect-video rounded overflow-hidden ring-1 ring-border shadow-2xl">
              <Player
                component={VideoTemplate}
                inputProps={{
                  userCode: code,
                  theme: params.theme,
                  visualStyle: params.visualStyle,
                  scenes: params.scenes,
                }}
                durationInFrames={params.duration * 30}
                fps={30}
                compositionWidth={currentRes.w}
                compositionHeight={currentRes.h}
                style={{ width: "100%", height: "100%" }}
                controls
                autoPlay
                loop
              />
            </div>
          </div>
        </div>

        {/* CODE EDITOR PANEL */}
        <div className="h-64 bg-surface border border-border rounded-xl flex flex-col overflow-hidden shrink-0">
          <div className="bg-background/50 border-b border-border p-3 flex items-center gap-2 text-gray-400">
            <Code size={16}/> <span>Inject Element (HTML/CSS)</span>
          </div>
          <textarea
            className="flex-1 w-full bg-transparent p-4 font-mono text-sm text-green-400 outline-none resize-none leading-relaxed"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
          />
        </div>

      </div>
    </main>
  );
}
