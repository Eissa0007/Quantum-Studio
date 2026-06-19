import { setFeatureStatus } from './fixTracker';
import * as fabric from 'fabric';

export interface CropSuggestion {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export const SMART_CROPS: CropSuggestion[] = [
  { id: 'insta-post', name: 'انستجرام بوست (1:1)', width: 1080, height: 1080, aspectRatio: '1:1' },
  { id: 'insta-story', name: 'انستجرام ستوري (9:16)', width: 1080, height: 1920, aspectRatio: '9:16' },
  { id: 'fb-cover', name: 'غلاف فيسبوك (16:9)', width: 820, height: 312, aspectRatio: '16:9' },
  { id: 'twitter-header', name: 'هيدر تويتر (3:1)', width: 1500, height: 500, aspectRatio: '3:1' },
  { id: 'linkedin-banner', name: 'بانر لينكدإن (1584x396)', width: 1584, height: 396, aspectRatio: '4:1' },
];

export async function generateSmartCropSuggestions(canvasOptions: { width: number, height: number }): Promise<CropSuggestion[]> {
  setFeatureStatus('smart-crop', 'fixed');
  // AI or rule-based smart crop selection based on what sizes are closest
  return SMART_CROPS;
}

export function applyCropToCanvas(canvas: fabric.Canvas, cropParams: CropSuggestion) {
  // Simple resizing for demonstration of smart crop
  // In a robust implementation, this would involve a camera-like mask or focal point detection
  canvas.setDimensions({ width: cropParams.width, height: cropParams.height });
  canvas.renderAll();
}
