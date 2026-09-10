const NORTH = Symbol("north");
const SOUTH = Symbol("south");
const EAST = Symbol("east");
const WEST = Symbol("west");
const CELL_COUNT = 10;

let cellDim;
let dim;

// biome-ignore lint/correctness/noUnusedVariables: p5
function setup() {
  dim = 0.9 * (windowWidth >= windowHeight ? windowHeight : windowWidth);
  // round down to nearest 100
  dim = dim - (dim % 100);
  cellDim = dim / CELL_COUNT;
  const _canvas = createCanvas(dim, dim);
  background(51);
  strokeWeight(4);
  stroke("white");
  const m = new Maze(Cell5);
  m.draw();
  window.maze = m;
}

class Maze {
  cellCls;
  cells;
  constructor(cellCls) {
    console.log(
      `creating ${CELL_COUNT} x ${CELL_COUNT} maze using ${cellCls.name}`,
    );
    this.cellCls = cellCls;
    this.cells = [];
    let x = 0;
    let y = 0;
    for (let i = 1; i < 101; i++) {
      const cell = new cellCls(x, y);
      this.cells.push(cell);
      if (i % CELL_COUNT === 0) {
        x = 0;
        y += cellDim;
      } else {
        x += cellDim;
      }
    }
  }
  draw() {
    this.cells.forEach((c) => {
      c.draw();
    });
  }
}

// biome-ignore lint/correctness/noUnusedVariables: p5
function draw() {}

class Cell {
  startX;
  startY;
  [NORTH] = true;
  [SOUTH] = true;
  [EAST] = true;
  [WEST] = true;
  constructor(startX, startY) {
    this.startX = startX;
    this.startY = startY;
    this.setSides();
  }
  setSides() {}
  get eastX() {
    return this.startX + cellDim;
  }
  get southY() {
    return this.startY + cellDim;
  }
  get sides() {
    return [this.north, this.south, this.east, this.west];
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
}

class Cell1 extends Cell {
  setSides() {
    this[this.rand4] = false;
  }
  get rand4() {
    return random([NORTH, EAST, SOUTH, WEST]);
  }
}

class Cell2 extends Cell1 {
  setSides() {
    const n = this.nSidesToOpen;
    if (n === 4) {
      this[NORTH] = false;
      this[SOUTH] = false;
      this[EAST] = false;
      this[WEST] = false;
    } else {
      for (let i = 0; i < n; i++) {
        this.openRandSide();
      }
    }
  }
  get nSidesToOpen() {
    return random([1, 2, 3, 4]);
  }
  openRandSide() {
    this[this.rand4] = false;
  }
}

class Cell3 extends Cell2 {
  setSides() {
    const n = this.nSidesToOpen;
    if (n === 4) {
      this[NORTH] = this[SOUTH] = this[EAST] = this[WEST] = false;
    } else if (n === 1) {
      this.openRandSide();
    } else {
      while (this.nOpen < n) {
        this.openRandSide();
      }
    }
  }
  get nOpen() {
    let count = 0;
    if (!this[NORTH]) {
      count += 1;
    }
    if (!this[SOUTH]) {
      count += 1;
    }
    if (!this[EAST]) {
      count += 1;
    }
    if (!this[WEST]) {
      count += 1;
    }
    return count;
  }
}

class Cell4 extends Cell3 {
  draw() {
    if (this[NORTH] || this.onNorthernEdge) {
      line(this.startX, this.startY, this.eastX, this.startY);
    }
    if (this[SOUTH] || this.onSouthernEdge) {
      line(this.startX, this.southY, this.eastX, this.southY);
    }
    if (this[EAST] || this.onEasternEdge) {
      line(this.eastX, this.startY, this.eastX, this.southY);
    }
    if (this[WEST] || this.onWesternEdge) {
      line(this.startX, this.startY, this.startX, this.southY);
    }
  }

  get onWesternEdge() {
    return this.startX === 0;
  }
  get onEasternEdge() {
    return this.startX + cellDim >= dim;
  }
  get onNorthernEdge() {
    return this.startY === 0;
  }
  get onSouthernEdge() {
    return this.startY + cellDim >= dim;
  }
}

class Cell5 extends Cell4 {
  get nSidesToOpen() {
    return random([2, 3]);
  }
}

class Maze2 extends Maze {
  pathIx = 0;
  constructor() {
    super(Cell);
  }
  get east() {
    if (this.pathIx % 10 === 0) {
      return undefined;
    } else {
      return this.pathIx - 1;
    }
  }
  get west() {
    if (this.pathIx % 10 === 9) {
      return undefined;
    } else {
      return this.pathIx + 1;
    }
  }
  get north() {
    if (this.pathIx < 10) {
      return undefined;
    } else {
      return this.pathIx - 10;
    }
  }
  get south() {
    if (this.pathIx >= 90) {
      return undefined;
    } else {
      return this.pathIx + 10;
    }
  }
  cellOpened(ix) {
    this.cells[ix].some((v) => v);
  }
}
