import * as fabric from 'fabric';

export class GridManager {
  private canvas: fabric.Canvas;
  private gridSize: number = 20;
  private gridLines: fabric.Line[] = [];
  public isSnapEnabled: boolean = false;
  public isVisible: boolean = false;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.setupSnapping();
  }

  public setGridSize(size: number) {
    this.gridSize = size;
    if (this.isVisible) {
      this.drawGrid();
    }
  }

  public toggleGrid() {
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      this.drawGrid();
    } else {
      this.clearGrid();
    }
  }

  public toggleSnap() {
    this.isSnapEnabled = !this.isSnapEnabled;
  }

  private drawGrid() {
    this.clearGrid();
    const width = 5000; // Large virtual width
    const height = 5000;

    for (let i = 0; i < width / this.gridSize; i++) {
        const x = i * this.gridSize;
        const line = new fabric.Line([x, -height, x, height], {
          stroke: '#e0e0e0',
          selectable: false,
          evented: false,
        });
        this.gridLines.push(line);
        this.canvas.add(line);
        this.canvas.sendObjectToBack(line);
    }
    
    for (let j = 0; j < height / this.gridSize; j++) {
        const y = j * this.gridSize;
        const line = new fabric.Line([-width, y, width, y], {
            stroke: '#e0e0e0',
            selectable: false,
            evented: false,
        });
        this.gridLines.push(line);
        this.canvas.add(line);
        this.canvas.sendObjectToBack(line);
    }
    this.canvas.renderAll();
  }

  private clearGrid() {
    this.gridLines.forEach(line => this.canvas.remove(line));
    this.gridLines = [];
    this.canvas.renderAll();
  }

  private setupSnapping() {
    this.canvas.on('object:moving', (options) => {
      if (!this.isSnapEnabled || !options.target) return;
      
      const obj = options.target;
      obj.set({
        left: Math.round((obj.left || 0) / this.gridSize) * this.gridSize,
        top: Math.round((obj.top || 0) / this.gridSize) * this.gridSize
      });
    });
  }
}
