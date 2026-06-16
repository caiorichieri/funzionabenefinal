import { useEffect, useRef } from "react";

/**
 * MagicCursor — discrete "magic wand" effect that follows the mouse.
 *
 * Behaviour:
 *  - A small sparkle dot follows the cursor with subtle easing (no replacement of native cursor).
 *  - When the mouse moves fast enough, tiny coloured sparkles trail behind and fade out.
 *  - Brand colours: orange #F58A1F, coral #E89B9F, lavender #C8B5E0, sage #C8E0A8, sky #8FC8D8.
 *  - Auto-disabled on touch devices, reduced-motion users, and small viewports.
 *  - All rendered on a single absolutely-positioned <canvas> for performance (no DOM churn).
 */
export default function MagicCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Feature gates
    const isTouch = matchMedia("(hover: none)").matches || "ontouchstart" in window;
    const isReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmall = window.innerWidth < 768;
    if (isTouch || isReduced || isSmall) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    const COLORS = ["#F58A1F", "#E89B9F", "#C8B5E0", "#C8E0A8", "#8FC8D8"];

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    // Cursor follower state
    let mouseX = -100, mouseY = -100;
    let dotX = -100, dotY = -100;
    let lastEmit = 0;
    let lastMoveMs = 0;
    const particles = []; // {x, y, vx, vy, life, max, color, size}

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const now = performance.now();
      const speed = now - lastMoveMs > 0 ? 1 : 0;
      lastMoveMs = now;

      // Emit a sparkle if enough time has passed and there is motion
      if (now - lastEmit > 45 && speed > 0) {
        lastEmit = now;
        const angle = Math.random() * Math.PI * 2;
        const spd = 0.4 + Math.random() * 0.7;
        particles.push({
          x: mouseX + (Math.random() - 0.5) * 6,
          y: mouseY + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 0.2, // drift up gently
          life: 0,
          max: 700 + Math.random() * 500,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 1.5 + Math.random() * 1.8,
        });
        if (particles.length > 80) particles.shift();
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    // Hide effect when leaving window
    const onLeave = () => { mouseX = -200; mouseY = -200; };
    window.addEventListener("mouseout", onLeave);

    let rafId;
    let prev = performance.now();
    const tick = (t) => {
      const dt = t - prev;
      prev = t;

      // Ease the dot toward the cursor
      dotX += (mouseX - dotX) * 0.18;
      dotY += (mouseY - dotY) * 0.18;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update + draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        if (p.life >= p.max) { particles.splice(i, 1); continue; }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.005; // slight gravity-down
        const t01 = p.life / p.max;
        const alpha = Math.sin((1 - t01) * Math.PI) * 0.9; // ease-in-out fade
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.arc(p.x, p.y, p.size * (1 - t01 * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Draw the follower dot (subtle glow halo + bright core)
      if (dotX > -50) {
        // Outer warm halo
        const grad = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 22);
        grad.addColorStop(0, "rgba(245, 138, 31, 0.55)");
        grad.addColorStop(0.5, "rgba(245, 138, 31, 0.18)");
        grad.addColorStop(1, "rgba(245, 138, 31, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 22, 0, Math.PI * 2);
        ctx.fill();

        // Bright sparkle core (white center)
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.beginPath();
        ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Dark pinpoint to keep it crisp over white cards too
        ctx.fillStyle = "rgba(10, 10, 10, 0.55)";
        ctx.beginPath();
        ctx.arc(dotX, dotY, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="magic-cursor"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
