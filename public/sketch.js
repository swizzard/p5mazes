const NORTH = Symbol("north");
const SOUTH = Symbol("south");
const EAST = Symbol("east");
const WEST = Symbol("west");
const ROW_LENGTH_QUERY_PARAM = "rowLength";
const SEEN_THRESHOLD_QUERY_PARAM = "seenThreshold";
// const CELL_COUNT = 30;
// const CELL_TOTAL = CELL_COUNT * CELL_COUNT;
// const SEEN_THRESHOLD = 0.75;
// const SEEN_LIMIT = Math.floor(CELL_TOTAL * SEEN_THRESHOLD);

let CELL_COUNT;
let CELL_TOTAL;
let SEEN_THRESHOLD;
let SEEN_LIMIT;
let cellDim;
let dim;
let m;

// biome-ignore lint/correctness/noUnusedVariables: p5
function setup() {
  getDimensions();
  dim = 0.9 * (windowWidth >= windowHeight ? windowHeight : windowWidth);
  // round down
  dim = dim - (dim % CELL_COUNT);
  cellDim = dim / CELL_COUNT;
  console.log(`cellDim ${cellDim}`);
  const _canvas = createCanvas(dim, dim);
  m = new Maze3();
  window.maze = m;
}

// biome-ignore lint/correctness/noUnusedVariables: p5
function draw() {
  m.draw();
  if (m.seen.size <= SEEN_LIMIT) {
    m.openCell();
  }
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
    for (let i = 1; i <= CELL_TOTAL; i++) {
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
    background(51);
    strokeWeight(4);
    stroke("white");
    this.cells.forEach((c) => {
      c.draw();
    });
  }
}

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
  stringify() {
    return `{ startX: ${this.startX}, startY: ${this.startY}, north: ${this[NORTH]}, south: ${this[SOUTH]}, east: ${this[EAST]}, west: ${this[WEST]} }`;
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
  openCell() {
    const possibilities = this.neighborSidesOf(this.pathIx);
    if (possibilities.length === 0) {
      this.pathIx = Math.floor(random(0, CELL_TOTAL));
      return this.openCell();
    }
    const chosen = random(possibilities);
    const opp = this.opposite(chosen);
    this.cells[this.pathIx][chosen] = false;
    const newIx = this.move(this.pathIx, chosen);
    this.cells[newIx][opp] = false;
    this.pathIx = newIx;
    return true;
  }
  opposite(dir) {
    switch (dir) {
      case NORTH:
        return SOUTH;
      case SOUTH:
        return NORTH;
      case EAST:
        return WEST;
      case WEST:
        return EAST;
    }
  }
  onNorth(ix) {
    return ix < CELL_COUNT;
  }
  onSouth(ix) {
    return ix >= CELL_COUNT * (CELL_COUNT - 1);
  }
  onEast(ix) {
    return ix % CELL_COUNT === CELL_COUNT - 1;
  }
  onWest(ix) {
    return ix % CELL_COUNT === 0;
  }
  move(ix, dir) {
    switch (dir) {
      case NORTH:
        return this.north(ix);
      case SOUTH:
        return this.south(ix);
      case EAST:
        return this.east(ix);
      case WEST:
        return this.west(ix);
    }
  }
  east(ix) {
    return ix + 1;
  }
  west(ix) {
    return ix - 1;
  }
  north(ix) {
    return ix - CELL_COUNT;
  }
  south(ix) {
    return ix + CELL_COUNT;
  }
  cellOpened(ix) {
    const c = this.cells[ix];
    return !(c[NORTH] && c[SOUTH] && c[EAST] && c[WEST]);
  }
  neighborSidesOf(ix) {
    const opts = [];
    const c = this.cells[ix];
    if (c[EAST] && !this.onEast(ix)) {
      opts.push(EAST);
    }
    if (c[WEST] && !this.onWest(ix)) {
      opts.push(WEST);
    }
    if (c[NORTH] && !this.onNorth(ix)) {
      opts.push(NORTH);
    }
    if (c[SOUTH] && !this.onSouth(ix)) {
      opts.push(SOUTH);
    }
    return opts;
  }
  onSide(ix, side) {
    switch (side) {
      case NORTH:
        return this.onNorth(ix);
      case SOUTH:
        return this.onSouth(ix);
      case EAST:
        return this.onEast(ix);
      case WEST:
        return this.onWest(ix);
    }
  }
}

class Maze3 extends Maze2 {
  seen = new Set();
  constructor() {
    super();
    this.seen.add(0);
  }
  openCell() {
    super.openCell();
    this.seen.add(this.pathIx);
  }
}

function pPrintDir(dir) {
  return dir.toString().replace(/Symbol\((\w+)\)/, "$1");
}

function getDimensions() {
  const params = new URLSearchParams(window.location.search);
  CELL_COUNT = parseInt(params.get(ROW_LENGTH_QUERY_PARAM) || 20, 10);
  CELL_TOTAL = CELL_COUNT * CELL_COUNT;
  SEEN_THRESHOLD =
    parseInt(params.get(SEEN_THRESHOLD_QUERY_PARAM) || 75, 10) / 100;
  SEEN_LIMIT = Math.floor(CELL_TOTAL * SEEN_THRESHOLD);
}
