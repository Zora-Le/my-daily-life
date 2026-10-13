import { compressImage } from '@/lib/lifeUtils';
import { Eraser, ImagePlus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
interface Props {
  onSave: (image: string) => void;
  notify: (text: string) => void;
}
export function DrawingEditor({ onSave, notify }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const history = useRef<string[]>([]);
  const drawing = useRef(false);
  const [color, setColor] = useState('#546d73');
  const [width, setWidth] = useState(4);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fffaf1';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    history.current = [canvas.toDataURL()];
  }, []);
  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (event.currentTarget.width / rect.width),
      y:
        (event.clientY - rect.top) * (event.currentTarget.height / rect.height),
    };
  };
  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const p = point(event);
    const ctx = event.currentTarget.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };
  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const p = point(event);
    const ctx = event.currentTarget.getContext('2d');
    if (ctx) {
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const image = canvasRef.current?.toDataURL();
    if (image) history.current.push(image);
  };
  const restore = (image: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = image;
  };
  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#fffaf1';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    history.current.push(canvas.toDataURL());
  };
  return (
    <div className="drawing-editor">
      <div className="draw-tools">
        <div>
          {['#546d73', '#c47f78', '#c39c43'].map(c => (
            <button
              key={c}
              className={color === c ? 'active' : ''}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label="选择笔色"
            />
          ))}
        </div>
        <label>
          笔粗{' '}
          <input
            type="range"
            min="2"
            max="14"
            value={width}
            onChange={e => setWidth(Number(e.target.value))}
          />
        </label>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={760}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      />
      <div className="draw-actions">
        <button
          onClick={() => {
            if (history.current.length > 1) {
              history.current.pop();
              restore(history.current.at(-1) as string);
            }
          }}
        >
          <RotateCcw />
          撤销
        </button>
        <button onClick={clear}>
          <Trash2 />
          清空
        </button>
        <label>
          <ImagePlus />
          从其他 App 导入
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={async e => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const image = await compressImage(file, 900, 0.75);
                restore(image);
                history.current.push(image);
              } catch (err) {
                notify((err as Error).message);
              }
            }}
          />
        </label>
        <button
          className="save-drawing"
          onClick={() => {
            const image = canvasRef.current?.toDataURL('image/jpeg', 0.72);
            if (image) onSave(image);
          }}
        >
          <Save />
          保存为卡面
        </button>
      </div>
      <p>
        <Eraser size={12} />
        可以先在美图、Procreate 或系统相册完成，再从这里导入。
      </p>
    </div>
  );
}
