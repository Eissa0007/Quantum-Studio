import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import * as fabric from "fabric";

export interface ExportOptions {
  format: 'PNG' | 'JPG' | 'SVG' | 'PDF' | 'MP4' | 'GIF';
  filename: string;
  quality?: number;
  multiplier?: number;
  transparentBg?: boolean;
  watermark?: boolean;
  backgroundColor?: string;
}

const applyWatermark = (canvas: fabric.Canvas) => {
  const watermarkText = new fabric.FabricText("Quantum AI Studio", {
    left: canvas.getWidth() / 2,
    top: canvas.getHeight() / 2,
    originX: 'center',
    originY: 'center',
    fontSize: 48,
    fill: 'rgba(200, 200, 200, 0.4)',
    fontWeight: 'bold',
    selectable: false,
    evented: false,
  });
  canvas.add(watermarkText);
  canvas.renderAll();
  return watermarkText;
};

export const exportCanvas = async (canvas: fabric.Canvas, options: ExportOptions) => {
  let watermarkObj = null;
  if (options.watermark) {
    watermarkObj = applyWatermark(canvas);
  }

  const originalBg = canvas.backgroundColor;
  if (options.format === 'JPG' && !options.backgroundColor) {
    canvas.backgroundColor = '#FFFFFF';
  } else if (options.backgroundColor) {
    canvas.backgroundColor = options.backgroundColor;
  }
  
  if (options.format === 'PNG' && options.transparentBg) {
    canvas.backgroundColor = '';
  }
  canvas.renderAll();

  try {
    if (options.format === 'PNG' || options.format === 'JPG') {
      const dataURL = canvas.toDataURL({
        format: options.format.toLowerCase() as 'png' | 'jpeg',
        quality: options.quality || 1,
        multiplier: options.multiplier || 1,
      });
      saveAs(dataURL, `${options.filename}.${options.format.toLowerCase()}`);
      
    } else if (options.format === 'SVG') {
      const svg = canvas.toSVG();
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      saveAs(blob, `${options.filename}.svg`);
      
    } else if (options.format === 'PDF') {
      const dataURL = canvas.toDataURL({
        format: "jpeg",
        quality: options.quality || 1,
        multiplier: options.multiplier || 2,
      });
      const width = canvas.getWidth();
      const height = canvas.getHeight();
      const orientation = width > height ? "l" : "p";
      const pdf = new jsPDF({
        orientation,
        unit: "px",
        format: [width, height],
      });
      // Optionally add metadata
      pdf.setProperties({
        title: options.filename,
        creator: 'Quantum AI Studio',
        author: 'Quantum Designer'
      });
      pdf.addImage(dataURL, "JPEG", 0, 0, width, height);
      pdf.save(`${options.filename}.pdf`);
      
    } else if (options.format === 'MP4' || options.format === 'GIF') {
      // Stub for video export
      alert(`تصدير ${options.format} يتطلب خوادم معالجة قوية، سيتم تفعيل هذه الميزة في التحديث القادم.`);
    }
  } finally {
    // Restore
    if (watermarkObj) {
      canvas.remove(watermarkObj);
    }
    canvas.backgroundColor = originalBg;
    canvas.renderAll();
  }
};

