// biome-ignore-start lint/correctness/noUnusedVariables: lib
const NORTH = Symbol("north");
const SOUTH = Symbol("south");
const EAST = Symbol("east");
const WEST = Symbol("west");

class _M {
  cellCls;
  cells;

  constructor(cellCls, cellCount, cellDim) {
    console.log(
      `creating ${cellCount} x ${cellCount} ${this.constructor.name} using ${cellCls.name}`,
    );
    this.cellCls = cellCls;
    this.cells = [];
    const tot = cellCount * cellCount;
    let x = 0;
    let y = 0;
    for (let i = 1; i <= tot; i++) {
      const cell = new cellCls(x, y);
      this.cells.push(cell);
      if (i % cellCount === 0) {
        x = 0;
        y += cellDim;
      } else {
        x += cellDim;
      }
    }
  }
}

class _C {
  startX;
  startY;
  [NORTH];
  [SOUTH];
  [EAST];
  [WEST];
  constructor(startX, startY) {
    this.startX = startX;
    this.startY = startY;
  }
  get eastX() {
    return this.startX + cellDim;
  }
  get southY() {
    return this.startY + cellDim;
  }
  get sides() {
    return [this[NORTH], this[SOUTH], this[EAST], this[WEST]];
  }
  draw() {
    if (this[NORTH]) {
      line(this.startX, this.startY, this.eastX, this.startY);
    }
    if (this[SOUTH]) {
      line(this.startX, this.southY, this.eastX, this.southY);
    }
    if (this[EAST]) {
      line(this.eastX, this.startY, this.eastX, this.southY);
    }
    if (this[WEST]) {
      line(this.startX, this.startY, this.startX, this.southY);
    }
  }
  stringify() {
    return `{ startX: ${this.startX}, startY: ${this.startY}, north: ${this[NORTH]}, south: ${this[SOUTH]}, east: ${this[EAST]}, west: ${this[WEST]} }`;
  }
}

// biome-ignore-end lint/correctness/noUnusedVariables: lib
