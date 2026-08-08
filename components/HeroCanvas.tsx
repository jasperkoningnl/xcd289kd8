"use client";

import { useEffect, useRef } from "react";
import { Noise, makeRandom } from "@/lib/sim";

type Deeltje = { x: number; y: number; life: number; warm: boolean };

/**
 * De achtergrond van de voorpagina: hetzelfde principe als het stuk
 * *Stroming*, maar traag, bleek en zonder bediening. Staat stil zodra de
 * bezoeker minder beweging wil of de kop uit beeld is.
 */
export function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const random = makeRandom(20260808);
    const noise = new Noise(random);

    let width = 0;
    let height = 0;
    let particles: Deeltje[] = [];
    let frame: number | null = null;
    let visible = true;
    let ctx: CanvasRenderingContext2D | null = null;

    const setup = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      width = parent.clientWidth;
      height = parent.clientHeight;
      if (width < 2 || height < 2) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#0b0c0e";
      ctx.fillRect(0, 0, width, height);

      // Het aantal schaalt mee met het oppervlak: op een telefoon zijn er
      // een paar honderd nodig, op een breed scherm een paar duizend.
      const count = Math.round(Math.min(2200, (width * height) / 700));
      particles = new Array(count);
      for (let i = 0; i < count; i++) {
        particles[i] = {
          x: random() * width,
          y: random() * height,
          life: random() * 200,
          warm: random() < 0.12,
        };
      }
    };

    const draw = () => {
      if (!ctx) return;

      ctx.lineWidth = 0.85;
      ctx.lineCap = "round";

      for (const p of particles) {
        const angle = noise.fractal(p.x * 0.0021, p.y * 0.0021, 3) * Math.PI * 4;
        const nx = p.x + Math.cos(angle) * 1.15;
        const ny = p.y + Math.sin(angle) * 1.15;

        ctx.strokeStyle = p.warm
          ? "rgba(233, 162, 59, 0.075)"
          : "rgba(206, 212, 208, 0.042)";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        p.x = nx;
        p.y = ny;
        p.life += 1;

        if (p.life > 200 || p.x < 0 || p.x >= width || p.y < 0 || p.y >= height) {
          p.x = random() * width;
          p.y = random() * height;
          p.life = 0;
        }
      }
    };

    const loop = () => {
      draw();
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (frame !== null || reduced.matches || !visible) return;
      frame = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    };

    setup();
    // Bij minder beweging blijft er één stilstaande tekening staan in plaats
    // van een leeg vlak.
    if (reduced.matches) for (let i = 0; i < 320; i++) draw();
    else start();

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { rootMargin: "0px" },
    );
    observer.observe(canvas);

    let lastWidth = width;
    const resize = new ResizeObserver(() => {
      const parent = canvas.parentElement;
      if (!parent || Math.abs(parent.clientWidth - lastWidth) < 2) return;
      lastWidth = parent.clientWidth;
      stop();
      setup();
      start();
    });
    if (canvas.parentElement) resize.observe(canvas.parentElement);

    const onMotionChange = () => {
      if (reduced.matches) stop();
      else start();
    };
    reduced.addEventListener("change", onMotionChange);

    return () => {
      stop();
      observer.disconnect();
      resize.disconnect();
      reduced.removeEventListener("change", onMotionChange);
    };
  }, []);

  return <canvas ref={ref} className="hero-canvas" aria-hidden="true" />;
}
