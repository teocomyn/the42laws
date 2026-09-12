"use client";

import { useEffect, useRef, useState } from "react";
import { createRenderer, type Renderer } from "./black-hole-utils/renderer";
import type { Settings } from "./black-hole-utils/model";

/** The supplied canvas wrapper, completed with settings and an accessible fallback. */
export function Example({ settings = {} }: { settings?: Partial<Settings> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = createRenderer({ canvas, onError: setError });
    rendererRef.current = renderer;
    void renderer.ready.catch(() => {}); // The renderer reports the accessible fallback.
    return () => { renderer.dispose(); rendererRef.current = null; };
  }, []);
  useEffect(() => { rendererRef.current?.setOptions(settings); }, [settings]);
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <img aria-hidden={!error} className="bh-fallback" src="/atlas/brand-lab-trou-noir.svg" alt="Illustration d’un trou noir entouré d’un disque lumineux." />
      <canvas ref={canvasRef} className="block h-full w-full touch-none" style={{opacity:error?0:1}} aria-label="Vue illustrative d’un trou noir et de son disque d’accrétion ; réglages sous l’image." role="img" aria-hidden={!!error} />
      {error && <p className="bh-render-error" role="status">{error}</p>}
    </div>
  );
}
export default Example;
