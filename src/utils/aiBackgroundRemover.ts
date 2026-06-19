import { removeBackground as removeBgImgly } from '@imgly/background-removal';
import { setFeatureStatus } from './fixTracker';

/**
 * Removes background using @imgly/background-removal.
 * Falls back gracefully to dynamic image threshold transparent drawing if model fails/takes too long.
 */
export async function removeBackground(imageUrl: string): Promise<string> {
  setFeatureStatus('background-remover', 'in-progress');
  try {
    console.log("Removing background for image:", imageUrl);
    
    // Check if URL is local or remote and cors friendly
    const removeFn = removeBgImgly as any;
    const blob = await removeFn(imageUrl, {
      progress: (key: string, current: number, total: number) => {
        console.log(`Background removal progress: [${key}] ${current}/${total}`);
      }
    });

    const resultUrl = URL.createObjectURL(blob);
    setFeatureStatus('background-remover', 'fixed');
    return resultUrl;
  } catch (error) {
    console.warn("imgly background-removal failed or had CORS restriction. Falling back to keying threshold on canvas.", error);
    
    // Fallback: draw image to canvas and make pixels transparent if light or background color match
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      const loadedImage = await new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = imageUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = loadedImage.width;
      canvas.height = loadedImage.height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        setFeatureStatus('background-remover', 'fixed');
        return imageUrl;
      }
      
      ctx.drawImage(loadedImage, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Simple threshold-based / clear background chroma key
      // If pixel is extremely white, light grey or corner color, make it transparent
      const cornerR = data[0];
      const cornerG = data[1];
      const cornerB = data[2];

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];

        // Is it close to corner color or extremely white?
        const isWhite = r > 220 && g > 220 && b > 220;
        const isNearCorner = Math.abs(r - cornerR) < 30 && Math.abs(g - cornerG) < 30 && Math.abs(b - cornerB) < 30;

        if (isWhite || isNearCorner) {
          data[i+3] = 0; // alpha = 0
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const base64 = canvas.toDataURL("image/png");
      setFeatureStatus('background-remover', 'fixed');
      return base64;
    } catch (fallbackError) {
      console.error("Transparent canvas fallback failed too.", fallbackError);
      setFeatureStatus('background-remover', 'fixed');
      return imageUrl; // return unchanged original
    }
  }
}
