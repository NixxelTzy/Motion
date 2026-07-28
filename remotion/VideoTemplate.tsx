import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate, registerRoot, Composition } from "remotion";

export type VideoProps = {
  userCode: string;
  theme: string;
  visualStyle: string;
  scenes: number;
};

// Komponen Utama Render
export const VideoTemplate = ({ userCode, theme, visualStyle, scenes }: VideoProps) => {
  const { fps, durationInFrames, width, height } = useVideoConfig();
  
  // Kalkulasi Scene
  const framesPerScene = Math.floor(durationInFrames / scenes);

  // Styling Dinamis berdasarkan Parameter
  const getThemeColors = () => {
    switch (theme) {
      case "Business": return { bg: "#0f172a", text: "#f8fafc", accent: "#3b82f6" };
      case "Education": return { bg: "#fdf8f6", text: "#1c1917", accent: "#f97316" };
      case "Technology": return { bg: "#000000", text: "#22c55e", accent: "#16a34a" };
      default: return { bg: "#ffffff", text: "#000000", accent: "#cccccc" };
    }
  };

  const colors = getThemeColors();

  // Pola Latar Belakang (Visual Style)
  const getBackgroundPattern = () => {
    if (visualStyle === "Flat Vector") return "none";
    if (visualStyle === "Grid Minimalist") return `linear-gradient(to right, ${colors.accent}22 1px, transparent 1px), linear-gradient(to bottom, ${colors.accent}22 1px, transparent 1px)`;
    return "none";
  };

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      {/* Background Pattern */}
      <AbsoluteFill style={{
        backgroundImage: getBackgroundPattern(),
        backgroundSize: "40px 40px",
        opacity: 0.5
      }} />

      {/* Looping Scenes */}
      {Array.from({ length: scenes }).map((_, i) => {
        const startFrame = i * framesPerScene;
        return (
          <Sequence key={i} from={startFrame} durationInFrames={framesPerScene}>
            <SceneContent 
              userCode={userCode} 
              colors={colors} 
              sceneIndex={i} 
              totalScenes={scenes}
              width={width}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// Komponen Anak untuk Animasi per Scene
const SceneContent = ({ userCode, colors, sceneIndex, totalScenes, width }: any) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animasi masuk (Fade In + Slide Up)
  const entryProgress = spring({ frame, fps, config: { damping: 12 } });
  const translateY = interpolate(entryProgress, [0, 1], [50, 0]);
  const opacity = interpolate(entryProgress, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", color: colors.text }}>
      {/* Header Scene Info */}
      <div style={{
        position: "absolute", top: "5%", left: "5%", 
        padding: "10px 20px", backgroundColor: colors.accent,
        color: "#fff", borderRadius: "8px", fontWeight: "bold",
        fontSize: width * 0.02, opacity: opacity
      }}>
        Scene {sceneIndex + 1} of {totalScenes}
      </div>

      {/* Konten User (Rendered HTML) */}
      <div
        style={{
          transform: `translateY(${translateY}px) scale(${entryProgress})`,
          opacity: opacity,
          width: "80%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        dangerouslySetInnerHTML={{ __html: userCode }}
      />
    </AbsoluteFill>
  );
};

// WAJIB UNTUK BACKEND: Mendaftarkan Root Composition
export const RemotionRoot = () => {
  return (
    <Composition
      id="MainVideo"
      component={VideoTemplate}
      durationInFrames={300} // Akan di-override oleh API Backend
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        userCode: "<h1>Hello</h1>",
        theme: "Business",
        visualStyle: "Flat Vector",
        scenes: 1,
      }}
    />
  );
};

registerRoot(RemotionRoot);
