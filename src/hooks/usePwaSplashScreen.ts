import { useEffect, useState } from "react";

export function usePwaSplashScreen() {
  const [isGenerated, setIsGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    // Check if device is iOS or standalone
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;

    // Ensure essential iOS PWA head tags are present
    const ensureMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    ensureMetaTag("apple-mobile-web-app-capable", "yes");
    ensureMetaTag("apple-mobile-web-app-status-bar-style", "black-translucent");
    ensureMetaTag("apple-mobile-web-app-title", "Grade Master Africa");

    const generateAndInjectSplash = async () => {
      try {
        const dataUrl = await drawSplashScreen("/icon-512.png");
        
        // Remove existing dynamic splash startup link tag to avoid duplicates
        const existingLink = document.querySelector("link[data-dynamic-splash='true']");
        if (existingLink) {
          existingLink.remove();
        }

        const link = document.createElement("link");
        link.rel = "apple-touch-startup-image";
        link.href = dataUrl;
        link.setAttribute("data-dynamic-splash", "true");
        document.head.appendChild(link);

        setIsGenerated(true);
        console.log("[PWASplash] Dynamically generated and injected iOS startup image successfully.");
      } catch (err: any) {
        console.error("[PWASplash] Error generating dynamic PWA splash screen:", err);
        setError(err.message || "Failed to generate PWA splash screen");
      }
    };

    generateAndInjectSplash();
  }, []);

  return { isGenerated, error };
}

function drawSplashScreen(logoUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.src = logoUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to secure 2D canvas rendering context."));
          return;
        }

        // Scale by device pixel ratio to keep visuals crystal clear on High-DPI screens
        const dpr = window.devicePixelRatio || 1;
        const screenW = window.screen.width;
        const screenH = window.screen.height;

        // Account for potential landscape rotations if needed, but default to absolute screen size
        const width = screenW * dpr;
        const height = screenH * dpr;

        canvas.width = width;
        canvas.height = height;

        // Draw base brand background: beautiful deep twilight indigo-950
        ctx.fillStyle = "#1e1b4b";
        ctx.fillRect(0, 0, width, height);

        // Render an ambient concentric glow in the center to build professional visual depth
        const glowRadius = Math.min(width, height) * 0.65;
        const radialGrad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          10,
          width / 2,
          height / 2,
          glowRadius
        );
        radialGrad.addColorStop(0, "rgba(67, 56, 202, 0.22)"); // Indigo glow center
        radialGrad.addColorStop(1, "rgba(30, 27, 75, 0)");      // Fade out
        ctx.fillStyle = radialGrad;
        ctx.fillRect(0, 0, width, height);

        // Logo sizing: Scale responsive to screen width
        const minDimension = Math.min(width, height);
        const logoSize = Math.round(minDimension * 0.35); // Balanced proportional ratio
        
        const logoX = (width - logoSize) / 2;
        const logoY = (height - logoSize) / 2 - Math.round(height * 0.04); // Shifted slightly above center for visual balance

        // Draw a delicate illuminated outer ring
        ctx.strokeStyle = "rgba(129, 140, 248, 0.4)"; // Indigo-400 with opacity
        ctx.lineWidth = Math.max(3, Math.round(dpr * 2.5));
        const ringPadding = Math.round(dpr * 8);
        const ringRadius = Math.round(logoSize / 2) + ringPadding;

        ctx.beginPath();
        ctx.arc(width / 2, logoY + logoSize / 2, ringRadius, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw logo with crisp rounded corners matching the Grade Master UI card style (rounded-[2.5rem])
        ctx.save();
        const cornerRadius = Math.round(logoSize * 0.28); // Standard beautiful squircle curve
        
        ctx.beginPath();
        ctx.moveTo(logoX + cornerRadius, logoY);
        ctx.lineTo(logoX + logoSize - cornerRadius, logoY);
        ctx.quadraticCurveTo(logoX + logoSize, logoY, logoX + logoSize, logoY + cornerRadius);
        ctx.lineTo(logoX + logoSize, logoY + logoSize - cornerRadius);
        ctx.quadraticCurveTo(logoX + logoSize, logoY + logoSize, logoX + logoSize - cornerRadius, logoY + logoSize);
        ctx.lineTo(logoX + cornerRadius, logoY + logoSize);
        ctx.quadraticCurveTo(logoX, logoY + logoSize, logoX, logoY + logoSize - cornerRadius);
        ctx.lineTo(logoX, logoY + cornerRadius);
        ctx.quadraticCurveTo(logoX, logoY, logoX + cornerRadius, logoY);
        ctx.closePath();
        
        ctx.clip();
        ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
        ctx.restore();

        // Render "Grade Master Africa" Brand Typography
        ctx.fillStyle = "#ffffff";
        const titleSize = Math.round(minDimension * 0.055);
        ctx.font = `bold ${titleSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const titleY = logoY + logoSize + Math.round(height * 0.07);
        ctx.fillText("Grade Master Africa", width / 2, titleY);

        // Render "AI-Powered Learning" subtitle with letter tracking
        ctx.fillStyle = "#a5b4fc"; // soft indigo accent
        const subSize = Math.round(minDimension * 0.034);
        ctx.font = `500 ${subSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        const subY = titleY + Math.round(height * 0.038);
        ctx.fillText("AI-Powered Learning Ecosystem", width / 2, subY);

        // Attribution tag in lower footer
        ctx.fillStyle = "rgba(165, 180, 252, 0.35)";
        const footerSize = Math.round(minDimension * 0.024);
        ctx.font = `600 ${footerSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        const footerY = height - Math.round(height * 0.08);
        ctx.fillText("IGNITE AFRICA PLATFORM", width / 2, footerY);

        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => {
      console.warn("[PWASplash] Unable to load image file, using vector monogram fallback.");
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to secure 2D canvas rendering context."));
          return;
        }

        const dpr = window.devicePixelRatio || 1;
        const screenW = window.screen.width;
        const screenH = window.screen.height;

        const width = screenW * dpr;
        const height = screenH * dpr;

        canvas.width = width;
        canvas.height = height;

        // Draw background
        ctx.fillStyle = "#1e1b4b";
        ctx.fillRect(0, 0, width, height);

        // Radial glow
        const glowRadius = Math.min(width, height) * 0.65;
        const radialGrad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          10,
          width / 2,
          height / 2,
          glowRadius
        );
        radialGrad.addColorStop(0, "rgba(67, 56, 202, 0.22)");
        radialGrad.addColorStop(1, "rgba(30, 27, 75, 0)");
        ctx.fillStyle = radialGrad;
        ctx.fillRect(0, 0, width, height);

        const minDimension = Math.min(width, height);
        const logoSize = Math.round(minDimension * 0.35);
        const logoX = (width - logoSize) / 2;
        const logoY = (height - logoSize) / 2 - Math.round(height * 0.04);

        // Outer ring
        ctx.strokeStyle = "rgba(129, 140, 248, 0.4)";
        ctx.lineWidth = Math.max(3, Math.round(dpr * 2.5));
        const ringPadding = Math.round(dpr * 8);
        const ringRadius = Math.round(logoSize / 2) + ringPadding;

        ctx.beginPath();
        ctx.arc(width / 2, logoY + logoSize / 2, ringRadius, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw squircle logo backdrop
        ctx.fillStyle = "#4338ca";
        const cornerRadius = Math.round(logoSize * 0.28);
        
        ctx.beginPath();
        ctx.moveTo(logoX + cornerRadius, logoY);
        ctx.lineTo(logoX + logoSize - cornerRadius, logoY);
        ctx.quadraticCurveTo(logoX + logoSize, logoY, logoX + logoSize, logoY + cornerRadius);
        ctx.lineTo(logoX + logoSize, logoY + logoSize - cornerRadius);
        ctx.quadraticCurveTo(logoX + logoSize, logoY + logoSize, logoX + logoSize - cornerRadius, logoY + logoSize);
        ctx.lineTo(logoX + cornerRadius, logoY + logoSize);
        ctx.quadraticCurveTo(logoX, logoY + logoSize, logoX, logoY + logoSize - cornerRadius);
        ctx.lineTo(logoX, logoY + cornerRadius);
        ctx.quadraticCurveTo(logoX, logoY, logoX + cornerRadius, logoY);
        ctx.closePath();
        ctx.fill();

        // Monogram
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const monogramSize = Math.round(logoSize * 0.38);
        ctx.font = `bold ${monogramSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillText("GM", width / 2, logoY + logoSize / 2);

        // Render "Grade Master Africa" Brand Typography
        ctx.fillStyle = "#ffffff";
        const titleSize = Math.round(minDimension * 0.055);
        ctx.font = `bold ${titleSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        const titleY = logoY + logoSize + Math.round(height * 0.07);
        ctx.fillText("Grade Master Africa", width / 2, titleY);

        // Render "AI-Powered Learning" subtitle with letter tracking
        ctx.fillStyle = "#a5b4fc";
        const subSize = Math.round(minDimension * 0.034);
        ctx.font = `500 ${subSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        const subY = titleY + Math.round(height * 0.038);
        ctx.fillText("AI-Powered Learning Ecosystem", width / 2, subY);

        // Attribution tag in lower footer
        ctx.fillStyle = "rgba(165, 180, 252, 0.35)";
        const footerSize = Math.round(minDimension * 0.024);
        ctx.font = `600 ${footerSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        const footerY = height - Math.round(height * 0.08);
        ctx.fillText("IGNITE AFRICA PLATFORM", width / 2, footerY);

        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        reject(err);
      }
    };
  });
}
