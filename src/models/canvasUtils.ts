// Shared canvas drawing helpers for model renderers.

export interface Palette {
  bg: string;
  panel: string;
  grid: string;
  axis: string;
  text: string;
  subtle: string;
}

export function palette(isDark: boolean): Palette {
  return isDark
    ? {
        bg: '#0e1426',
        panel: '#151c33',
        grid: 'rgba(148,163,184,0.15)',
        axis: 'rgba(203,213,225,0.55)',
        text: '#e2e8f0',
        subtle: '#94a3b8',
      }
    : {
        bg: '#f8fafc',
        panel: '#ffffff',
        grid: 'rgba(100,116,139,0.15)',
        axis: 'rgba(51,65,85,0.55)',
        text: '#0f172a',
        subtle: '#475569',
      };
}

export function clear(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
}

/** Draw a light grid across the area. */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  step: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= w; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y <= h; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
  ctx.restore();
}

export function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  font = '12px system-ui, sans-serif',
  align: CanvasTextAlign = 'left'
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  ctx.restore();
}
