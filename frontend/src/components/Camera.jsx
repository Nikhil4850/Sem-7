import React, { useEffect, useRef } from 'react';

const FRAME_W = 480;
const FRAME_H = 360;

// Cross-browser rounded rect helper (ctx.roundRect missing in Firefox/Safari)
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x,     y + r);
  ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
}

export default function Camera({ videoRef, isSuspicious, phoneBoxes = [] }) {
  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: FRAME_W, height: FRAME_H }
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Camera error:', err);
      }
    }
    startCamera();
  }, [videoRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d');

    // Sync canvas resolution to actual rendered size
    const rect   = wrap.getBoundingClientRect();
    const dispW  = Math.round(rect.width)  || FRAME_W;
    const dispH  = Math.round(rect.height) || FRAME_H;
    canvas.width  = dispW;
    canvas.height = dispH;

    ctx.clearRect(0, 0, dispW, dispH);
    if (!phoneBoxes || phoneBoxes.length === 0) return;

    // Scale backend coords → display size
    const sx = dispW / FRAME_W;
    const sy = dispH / FRAME_H;

    phoneBoxes.forEach(box => {
      // Webcam video is mirrored (CSS scaleX(-1)), so mirror X axis
      const x1 = dispW - box.x2 * sx;
      const y1 = box.y1 * sy;
      const bw = (box.x2 - box.x1) * sx;
      const bh = (box.y2 - box.y1) * sy;

      // Red bounding box
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth   = 3;
      ctx.strokeRect(x1, y1, bw, bh);

      // Label
      const label = `PHONE ${Math.round(box.conf * 100)}%`;
      ctx.font = 'bold 13px Inter, sans-serif';
      const tw  = ctx.measureText(label).width;
      const lh  = 22;
      const ly  = y1 > lh + 4 ? y1 - lh - 2 : y1 + bh + 2;

      ctx.fillStyle = 'rgba(239,68,68,0.93)';
      roundRect(ctx, x1, ly, tw + 12, lh, 4);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.fillText(label, x1 + 6, ly + 15);
    });
  }, [phoneBoxes]);

  return (
    <div ref={wrapRef} className="camera-wrap" style={{ position: 'relative' }}>
      <video
        ref={videoRef}
        autoPlay muted playsInline
        style={{ display: 'block', width: '100%', transform: 'scaleX(-1)' }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none',
        }}
      />
      {isSuspicious && <div className="camera-alert" />}
      <div className="live-badge">
        <div className="live-dot" />
        <span className="live-text">LIVE</span>
      </div>
    </div>
  );
}
