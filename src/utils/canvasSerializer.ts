import * as fabric from 'fabric';

export const serializeCanvas = (canvas: fabric.Canvas) => {
  if (!canvas) return '{}';
  
  // Convert standard Fabric.js canvas to JSON format
  // We include extra custom properties if needed
  const json = (canvas as any).toJSON(['id', 'name', 'locked', 'layer', 'selectable', 'evented']);
  
  // Add version tracking and validation payload
  const payload = {
    version: '1.0.0',
    timestamp: Date.now(),
    canvasData: json
  };
  
  return JSON.stringify(payload);
};

export const deserializeCanvas = async (canvas: fabric.Canvas, jsonString: string) => {
  if (!canvas || !jsonString) return;
  try {
    const data = JSON.parse(jsonString);
    const canvasData = data.canvasData || data; // Handle both wrapped and unwrapped data for backward compatibility
    
    // We use a promise wrapper for backward config if needed
    canvas.loadFromJSON(canvasData, () => {
      canvas.renderAll();
    });
  } catch (error) {
    console.error('Failed to deserialize canvas:', error);
  }
};

