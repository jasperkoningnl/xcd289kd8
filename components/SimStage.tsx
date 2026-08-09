"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AudioBus } from "@/lib/audio";
import { dict, type Locale } from "@/lib/i18n";
import {
  makeRandom,
  type Params,
  type Pointer,
  type Sim,
  type SimSpec,
  type Stage,
} from "@/lib/sim";
import { leesParams, schrijfParams } from "@/lib/deelbaar";
import { Controls } from "./Controls";

type Props = {
  spec: SimSpec;
  /** Verhouding breedte : hoogte van het canvas. */
  aspect?: number;
  title: string;
  locale: Locale;
};

/**
 * Het canvas met bediening: regelt resolutie, de animatielus, pauzeren
 * buiten beeld, het geluid en de deelbare adresbalk. De simulaties zelf
 * weten hier niets van.
 */
export function SimStage({ spec, aspect = 16 / 9, title, locale }: Props) {
  const t = dict(locale);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const simRef = useRef<Sim | null>(null);
  const stageRef = useRef<Stage | null>(null);
  const paramsRef = useRef<Params>(spec.defaults);
  const pointerRef = useRef<Pointer | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const seedRef = useRef<number>(1);
  const busRef = useRef<AudioBus | null>(null);

  const [params, setParams] = useState<Params>(spec.defaults);
  const [running, setRunning] = useState(true);
  const [visible, setVisible] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [copied, setCopied] = useState(false);

  paramsRef.current = params;

  /** Zet het canvas op de juiste resolutie en start de simulatie opnieuw. */
  const build = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const width = Math.max(1, Math.round(wrap.clientWidth));
    const height = Math.max(1, Math.round(width / aspect));

    // Boven 2 levert extra scherpte nauwelijks nog iets op, maar kost wel
    // vier keer zoveel pixels.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = spec.background ?? "#0b0c0e";
    ctx.fillRect(0, 0, width, height);

    const stage: Stage = {
      ctx,
      width,
      height,
      dpr,
      random: makeRandom(seedRef.current),
      audio: busRef.current,
    };
    stageRef.current = stage;

    const sim = spec.create();
    sim.init(stage, paramsRef.current);
    simRef.current = sim;
  }, [aspect, spec]);

  /** Nieuwe zaadwaarde: dezelfde regels, een andere uitkomst. */
  const reseed = useCallback(() => {
    seedRef.current = (Math.random() * 2 ** 32) >>> 0;
    build();
  }, [build]);

  const reset = useCallback(() => {
    build();
  }, [build]);

  // Parameters uit de adresbalk overnemen voordat er iets gebouwd wordt.
  const startParams = useRef<Params | null>(null);
  if (startParams.current === null && typeof window !== "undefined") {
    const uitUrl = leesParams(spec, window.location.search);
    startParams.current = { ...spec.defaults, ...uitUrl };
  }

  useEffect(() => {
    const start = startParams.current;
    if (start && Object.keys(start).length > 0) {
      paramsRef.current = start;
      setParams(start);
    }
    build();

    const wrap = wrapRef.current;
    if (!wrap) return;

    let last = wrap.clientWidth;
    const observer = new ResizeObserver(() => {
      const width = wrap.clientWidth;
      // Op mobiel verandert de hoogte van de adresbalk voortdurend; alleen
      // op een echte breedtewijziging opnieuw opbouwen.
      if (Math.abs(width - last) < 2) return;
      last = width;
      build();
    });
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [build]);

  // Wie minder beweging heeft ingesteld, krijgt het eerste beeld stilstaand
  // te zien en start de simulatie desgewenst zelf.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (query.matches) setRunning(false);
  }, []);

  // Buiten beeld hoeft er niets te draaien.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  // De animatielus.
  useEffect(() => {
    if (!visible || !running) return;

    lastRef.current = performance.now();

    const loop = (now: number) => {
      const stage = stageRef.current;
      const sim = simRef.current;
      if (stage && sim) {
        // Bij terugkeer uit een ander tabblad is het verschil enorm; afkappen
        // voorkomt dat de simulatie een sprong maakt.
        const dt = Math.min((now - lastRef.current) / 1000, 1 / 20);
        lastRef.current = now;
        sim.step(stage, paramsRef.current, dt, pointerRef.current);
        if (pointerRef.current) pointerRef.current.started = false;
      }
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [visible, running]);

  /* ---------------------------------------------------------------- *
   * Geluid
   * ---------------------------------------------------------------- */

  const toggleSound = useCallback(async () => {
    if (!spec.audio) return;

    if (soundOn) {
      await busRef.current?.suspend();
      setSoundOn(false);
      return;
    }

    // De AudioContext mag pas na een klik ontstaan; browsers weigeren het
    // anders. Daarom wordt hij hier gemaakt en niet bij het opbouwen.
    if (!busRef.current) {
      busRef.current = new AudioBus();
      if (stageRef.current) stageRef.current.audio = busRef.current;
    }
    await busRef.current.resume();
    setSoundOn(true);
  }, [soundOn, spec.audio]);

  // Zwijgen zodra het stuk gepauzeerd of uit beeld is.
  useEffect(() => {
    const bus = busRef.current;
    if (!bus || !soundOn) return;
    if (running && visible) void bus.resume();
    else void bus.suspend();
  }, [running, visible, soundOn]);

  useEffect(() => {
    return () => {
      busRef.current?.close();
      busRef.current = null;
    };
  }, []);

  /* ---------------------------------------------------------------- *
   * Bediening
   * ---------------------------------------------------------------- */

  /** Zet een parameter; structurele wijzigingen starten opnieuw. */
  const onChange = useCallback(
    (patch: Params, resets: boolean) => {
      setParams((prev) => {
        const next = { ...prev, ...patch };
        paramsRef.current = next;
        schrijfParams(spec, next);
        return next;
      });
      if (resets) {
        // Na de statuswijziging, zodat init de nieuwe waarden ziet.
        requestAnimationFrame(() => build());
      }
    },
    [build, spec],
  );

  const pointerFromEvent = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } => {
      const rect = event.currentTarget.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * (stageRef.current?.width ?? 0),
        y: ((event.clientY - rect.top) / rect.height) * (stageRef.current?.height ?? 0),
      };
    },
    [],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!spec.pointerHint) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      const { x, y } = pointerFromEvent(event);
      pointerRef.current = { x, y, down: true, started: true };
    },
    [pointerFromEvent, spec.pointerHint],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const current = pointerRef.current;
      if (!current || !current.down) return;
      const { x, y } = pointerFromEvent(event);
      current.x = x;
      current.y = y;
    },
    [pointerFromEvent],
  );

  const handlePointerUp = useCallback(() => {
    pointerRef.current = null;
  }, []);

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [title]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Zonder toestemming voor het klembord valt er weinig te doen; het
      // adres staat al in de balk.
    }
  }, []);

  const style = useMemo(
    () => ({ background: spec.background ?? "#0b0c0e" }),
    [spec.background],
  );

  return (
    <div className="stage">
      <div className="stage-canvas" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className="stage-surface"
          style={style}
          role="img"
          aria-label={t.simulatieVan(title)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          data-interactive={spec.pointerHint ? "true" : undefined}
        />
      </div>

      <div className="stage-bar">
        <div className="stage-buttons">
          <button
            type="button"
            className="btn"
            onClick={() => setRunning((r) => !r)}
            aria-pressed={!running}
          >
            {running ? t.pauze : t.doorgaan}
          </button>
          {spec.audio ? (
            <button
              type="button"
              className={soundOn ? "btn btn-actief" : "btn"}
              onClick={() => void toggleSound()}
              aria-pressed={soundOn}
            >
              {soundOn ? t.geluidUit : t.geluidAan}
            </button>
          ) : null}
          <button type="button" className="btn" onClick={reset}>
            {t.opnieuw}
          </button>
          <button type="button" className="btn" onClick={reseed}>
            {t.anderToeval}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => void copyLink()}>
            {copied ? t.linkGekopieerd : t.kopieerLink}
          </button>
          <button type="button" className="btn btn-ghost" onClick={download}>
            {t.bewaarPng}
          </button>
        </div>
        {spec.pointerHint ? (
          <p className="stage-hint">{spec.pointerHint[locale]}</p>
        ) : null}
      </div>

      {spec.audio && !soundOn ? (
        <p className="stage-klank">{t.klankUitleg}</p>
      ) : null}

      <Controls
        controls={spec.controls}
        params={params}
        locale={locale}
        onChange={onChange}
      />
    </div>
  );
}
