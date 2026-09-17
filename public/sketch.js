const ROW_LENGTH_QUERY_PARAM = "rowLength";
const SEEN_THRESHOLD_QUERY_PARAM = "seenThreshold";
const DEFAULT_ROW_LENGTH = 30;
const DEFAULT_SEEN_THRESHOLD = 65;
const MAZE_VERSION_QUERY_PARAM = "mazeVersion";
const CELL_VERSION_QUERY_PARAM = "cellVersion";

let CELL_COUNT;
let CELL_TOTAL;
let SEEN_THRESHOLD;
let SEEN_LIMIT;
let MAZE_CLS;
let CELL_CLS;
let cellDim;
let dim;
let m;
let stop = false;

// biome-ignore lint/correctness/noUnusedVariables: p5
function setup() {
  getParams();
  dim = getDim(CELL_COUNT);
  cellDim = dim / CELL_COUNT;
  const _canvas = createCanvas(dim, dim);
  if (CELL_CLS) {
    m = new MAZE_CLS(CELL_CLS);
  } else {
    m = new MAZE_CLS();
  }
  window.maze = m;
}

// biome-ignore lint/correctness/noUnusedVariables: p5
function draw() {
  m.draw();
  if (!stop && m.shouldContinue()) {
    m.openCell();
  }
}

class Maze extends _M {
  stopIx = CELL_COUNT * (CELL_COUNT - 1);
  constructor(cellCls) {
    super(cellCls, CELL_COUNT, cellDim);
  }
  shouldContinue() {
    return this.pathIx < this.stopIx;
  }
}

class Cell extends _C {
  constructor(startX, startY, cellDim, ix) {
    super(startX, startY, cellDim, ix);
    this[NORTH] = true;
    this[SOUTH] = true;
    this[EAST] = true;
    this[WEST] = true;
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
  constructor(cellCls) {
    super(cellCls ?? Cell);
  }
  openCell() {
    if (this.possibilities.length === 0) {
      const _oIx = this.pathIx;
      this.jumpToRandom();
      if (this.pathIx === _oIx) {
        stop = true;
        return false;
      } else {
        return this.openCell();
      }
    }
    const chosen = this.chooseMove(this.possibilities);
    const opp = opposite(chosen);
    this.cells[this.pathIx][chosen] = false;
    const newIx = this.direction(this.pathIx, chosen);
    this.cells[newIx][opp] = false;
    this.pathIx = newIx;
    return true;
  }
  get possibilities() {
    return this.neighborSidesOf(this.pathIx);
  }
  chooseMove(possibilities) {
    return random(possibilities);
  }
  jumpToRandom() {
    this.pathIx = Math.floor(random(0, CELL_TOTAL));
  }
  cellOpened(ix) {
    const c = this.cells[ix];
    return !(c[NORTH] && c[SOUTH] && c[EAST] && c[WEST]);
  }
}

class Maze3 extends Maze2 {
  seen = new Set();
  constructor(cellCls) {
    super(cellCls);
    this.seen.add(0);
  }
  openCell() {
    this.seen.add(this.pathIx);
    super.openCell();
  }
  shouldContinue() {
    return this.seen.size <= SEEN_LIMIT;
  }
}

class Maze4 extends Maze3 {
  get orderedSeen() {
    return Array.from(this.seen.values()).toSorted((a, b) => b - a);
  }
  jumpToRandom() {
    for (const val of this.orderedSeen) {
      const candidateVal = val + 1;
      if (
        candidateVal !== CELL_TOTAL &&
        candidateVal !== this.pathIx &&
        !this.seen.has(candidateVal)
      ) {
        this.pathIx = candidateVal;
        return;
      }
    }
    super.jumpToRandom();
  }
}

class Maze5 extends Maze4 {
  nOpen(ix) {
    const c = this.cells[ix];
    return [NORTH, SOUTH, EAST, WEST].reduce((n, d) => (c[d] ? n : n + 1), 0);
  }
  chooseMove(possibilities) {
    return noisePick(
      possibilities,
      this.pathIx,
      this.nOpen(this.pathIx),
      SEEN_LIMIT,
    );
  }
}

class Maze6 extends Maze5 {
  get orderedSeen() {
    return super.orderedSeen.toReversed();
  }
}

class Maze7 extends Maze2 {
  seen = new UniQ();

  constructor(cellCls) {
    super(cellCls);
    this.seen.push(0);
  }
  openCell() {
    this.seen.push(this.pathIx);
    super.openCell();
  }
  shouldContinue() {
    return this.seen.length <= SEEN_LIMIT;
  }
  jumpToRandom() {
    console.log("Maze7.jumpToRandom");
    for (const ix of this.seen) {
      if (this.neighborSidesOf(ix).length > 0 && ix !== this.pathIx) {
        this.pathIx = ix;
        return;
      }
    }
    this.pathIx = randInt(this.cellCount);
  }
}

class Maze8 extends Maze7 {
  jumpToRandom() {
    for (const ix of this.seen.rev()) {
      if (this.neighborSidesOf(ix).length > 0 && ix !== this.pathIx) {
        this.pathIx = ix;
        return;
      }
    }
    super.jumpToRandom();
  }
}

class Maze9 extends Maze7 {
  static MIN_LOCAL_WALLS = 8;

  localWallsOf(ix) {
    const ss = this.neighborSidesOf(ix);
    let ws = ss.length;
    for (const s of ss) {
      ws += this.neighborSidesOf(this.direction(ix, s)).length;
    }
    return ws;
  }
  jumpToRandom() {
    for (const ix of this.seen) {
      if (this.localWallsOf(ix) >= Maze9.MIN_LOCAL_WALLS) {
        this.pathIx = ix;
        return;
      }
    }
    super.jumpToRandom();
  }
}

class Maze10 extends Maze8 {
  static MIN_NEIGHBOR_WALLS = 3;

  getPossibilities() {
    return super.possibilities.filter((s) =>
      this.validIx(this.direction(this.pathIx, s)),
    );
  }
  get possibleIxs() {
    const ixs = [];
    for (let ix = 0; ix < this.cellCount; ix++) {
      if (this.validIx(ix)) {
        ixs.push(ix);
      }
    }
    return ixs;
  }
  jumpToRandom() {
    const highestSeen = this.seen.vals.reduce((a, v) => (v > a ? v : a), 0);
    this.pathIx = randInt(highestSeen, this.cellCount);
  }
  validIx(ix) {
    return this.neighborSidesOf(ix).length >= Maze10.MIN_NEIGHBOR_WALLS;
  }
  openCell() {
    let possibilities = this.getPossibilities();
    while (possibilities.length === 0) {
      this.jumpToRandom();
      // this.pathIx = randInt(this.cellCount);
      possibilities = this.getPossibilities();
    }
    this.seen.push(this.pathIx);
    const chosen = this.chooseMove(possibilities);
    const opp = opposite(chosen);
    this.cells[this.pathIx][chosen] = false;
    const newIx = this.direction(this.pathIx, chosen);
    this.cells[newIx][opp] = false;
    this.pathIx = newIx;
    return true;
  }
}

function getParams() {
  const params = new URLSearchParams(window.location.search);
  CELL_COUNT = parseInt(
    params.get(ROW_LENGTH_QUERY_PARAM) || DEFAULT_ROW_LENGTH,
    10,
  );
  document.getElementById("rowLength").value = CELL_COUNT;
  CELL_TOTAL = CELL_COUNT * CELL_COUNT;
  const st = parseInt(
    params.get(SEEN_THRESHOLD_QUERY_PARAM) || DEFAULT_SEEN_THRESHOLD,
    10,
  );
  document.getElementById("seenThreshold").value = st;
  SEEN_THRESHOLD = st / 100;
  SEEN_LIMIT = Math.floor(CELL_TOTAL * SEEN_THRESHOLD);
  switch (params.get(MAZE_VERSION_QUERY_PARAM)) {
    case "1":
      MAZE_CLS = Maze;
      document.querySelector('input.maze-picker[value="1"]').checked = true;
      break;
    case "2":
      MAZE_CLS = Maze2;
      document.querySelector('input.maze-picker[value="2"]').checked = true;
      break;
    case "3":
      MAZE_CLS = Maze3;
      document.querySelector('input.maze-picker[value="3"]').checked = true;
      break;
    case "4":
      MAZE_CLS = Maze4;
      document.querySelector('input.maze-picker[value="4"]').checked = true;
      break;
    case "5":
      MAZE_CLS = Maze5;
      document.querySelector('input.maze-picker[value="5"]').checked = true;
      break;
    case "6":
      MAZE_CLS = Maze6;
      document.querySelector('input.maze-picker[value="6"]').checked = true;
      break;
    case "7":
      MAZE_CLS = Maze7;
      document.querySelector('input.maze-picker[value="7"]').checked = true;
      break;
    case "8":
      MAZE_CLS = Maze8;
      document.querySelector('input.maze-picker[value="8"]').checked = true;
      break;
    case "9":
      MAZE_CLS = Maze9;
      document.querySelector('input.maze-picker[value="9"]').checked = true;
      break;
    case "10":
      MAZE_CLS = Maze10;
      document.querySelector('input.maze-picker[value="10"]').checked = true;
      break;
    default:
      MAZE_CLS = Maze5;
      document.querySelector('input.maze-picker[value="5"]').checked = true;
  }
  switch (params.get(CELL_VERSION_QUERY_PARAM)) {
    case "1":
      CELL_CLS = Cell1;
      document.querySelector('input.cell-picker[value="1"]').checked = true;
      break;
    case "2":
      CELL_CLS = Cell2;
      document.querySelector('input.cell-picker[value="2"]').checked = true;
      break;
    case "3":
      CELL_CLS = Cell3;
      document.querySelector('input.cell-picker[value="3"]').checked = true;
      break;
    case "4":
      CELL_CLS = Cell4;
      document.querySelector('input.cell-picker[value="4"]').checked = true;
      break;
    case "5":
      CELL_CLS = Cell5;
      document.querySelector('input.cell-picker[value="5"]').checked = true;
      break;
    default:
      CELL_CLS = Cell;
      document.querySelector('input.cell-picker[value="0"]').checked = true;
  }
}

function noisePick(arr, ...noiseArgs) {
  const t = 1 / arr.length;
  const n = noise(...noiseArgs);
  for (let ix = 1; ix <= arr.length; ix++) {
    const th = t * ix;
    if (n < th) {
      return arr[ix - 1];
    }
  }
  return arr[arr.length - 1];
}
