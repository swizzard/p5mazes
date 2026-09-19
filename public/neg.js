const ROW_LENGTH_QUERY_PARAM = "rowLength";
const SEEN_THRESHOLD_QUERY_PARAM = "seenThreshold";
const DEFAULT_ROW_LENGTH = 50;
const DEFAULT_SEEN_THRESHOLD = 65;
const MAZE_VERSION_QUERY_PARAM = "mazeVersion";
let CELL_COUNT;
let SEEN_LIMIT;
let MAZE_CLS;
let maze;

class NegCell extends _C {
  constructor(startX, startY, cellDim, ix) {
    const _cm = CELL_COUNT - 1;
    super(startX, startY, cellDim, ix);
    const w = ix % CELL_COUNT === 0;
    const e = ix % CELL_COUNT === _cm;
    const n = ix < CELL_COUNT;
    const s = ix >= CELL_COUNT * _cm;
    this[WEST] = w;
    this[EAST] = e;
    this[NORTH] = n;
    this[SOUTH] = s;
  }
  get openSides() {
    const ss = [];
    if (!this[NORTH]) {
      ss.push(NORTH);
    }
    if (!this[SOUTH]) {
      ss.push(SOUTH);
    }
    if (!this[EAST]) {
      ss.push(EAST);
    }
    if (!this[WEST]) {
      ss.push(WEST);
    }
    return ss;
  }
}

class NegCell2 extends NegCell {
  getPossibleMoves(whence) {
    const opts = [];
    if (!this[opposite(whence)]) {
      opts.push(whence);
    }
    for (const d of perpendiculars(whence)) {
      if (!this[d]) {
        opts.push(d);
        opts.push(d);
      }
    }
    return opts;
  }
}

class NegMaze extends _M {
  ix;
  seen = new Set();
  constructor(cCls) {
    super(cCls ?? NegCell, CELL_COUNT);
    this.ix = this.randIx;
  }
  get randIx() {
    return randInt(0, CELL_COUNT * CELL_COUNT);
  }
  get shouldContinue() {
    return this.seen.size <= SEEN_LIMIT;
  }
  openCell() {
    let opts = this.cells[this.ix].openSides;
    while (opts.length === 0) {
      this.ix = this.randIx;
      opts = this.cells[this.ix].openSides;
    }
    const chosenDir = random(opts);
    const nextIx = this.direction(this.ix, chosenDir);
    this.cells[this.ix][chosenDir] = true;
    this.cells[nextIx][opposite(chosenDir)] = true;
    this.seen.add(this.ix);
    this.ix = nextIx;
  }
}

class NegMaze2 extends NegMaze {
  get randIx() {
    const unseenIxs = Array.from(
      ixs(CELL_COUNT).filter((ix) => !this.seen.has(ix)),
    );
    return random(unseenIxs);
  }
}

class NegMaze3 extends NegMaze2 {
  prevDir;
  constructor() {
    super(NegCell2);
    this.prevDir = random([NORTH, EAST, SOUTH, WEST]);
  }
  openCell() {
    let opts = this.cells[this.ix].getPossibleMoves(this.prevDir);
    while (opts.length === 0) {
      this.ix = this.randIx;
      opts = this.cells[this.ix].openSides;
    }
    const chosenDir = random(opts);
    const nextIx = this.direction(this.ix, chosenDir);
    this.cells[this.ix][chosenDir] = true;
    this.cells[nextIx][opposite(chosenDir)] = true;
    this.seen.add(this.ix);
    this.prevDir = chosenDir;
    this.ix = nextIx;
  }
}

class NegMaze4 extends NegMaze2 {
  openCell() {
    let opts = this.getPossibleMoves(this.ix);
    while (opts.length === 0) {
      this.ix = this.randIx;
      opts = this.getPossibleMoves(this.ix);
    }
    const chosenDir = random(opts);
    const nextIx = this.direction(this.ix, chosenDir);
    this.cells[this.ix][chosenDir] = true;
    this.cells[nextIx][opposite(chosenDir)] = true;
    this.seen.add(this.ix);
    const nextOpts = this.getNextOpts(this.ix, chosenDir);
    if (nextOpts.length === 0) {
      this.ix = this.randIx;
    } else {
      this.ix = this.direction(this.ix, random(nextOpts));
    }
  }
  getNextOpts(ix, dir) {
    const nopts = [];
    for (const o of perpendiculars(dir)) {
      if (!this.onSide(ix, o)) {
        nopts.push(o);
        nopts.push(o);
      }
    }
    const op = opposite(dir);
    if (!this.onSide(ix, op)) {
      nopts.push(op);
    }
    return nopts;
  }

  getPossibleMoves(ix) {
    const c = this.cells[ix];
    return this.neighborSidesOf(ix).filter((s) => !c[s]);
  }
}

// class NegMaze5 extends NegMaze {
//   currGoal;

//   constructor() {
//     super(NegCell, CELL_COUNT);
//     this.currGoal = randIx;
//     this.ix = randIx;
//   }

//   openCell() {}

//   getNextMove(ix) {
//     const ps = this.neighborSidesOf(ix);
//     ps.sort((a, b) => {
//       const da = this.distBetween(this.direction(ix, a), this.currGoal);
//       const db = this.distBetween(this.direction(ix, b), this.currGoal);
//       return da - db;
//     });
//     const o = [];
//     for (let i = 0; i < ps.length; i++) {
//       for (let z = 0; z < ps.length - i; z++) {
//         o.push(ps[i]);
//       }
//     }
//     return random(o);
//   }

//   distBetween(a, b) {
//     const rowA = Math.floor(a / this.cellCount);
//     const rowB = b % this.cellCount;
//     const nRows = Math.abs(rowA - rowB);
//     const colA = a - rowA;
//     const colB = b - rowB;
//     const nCols = Math.abs(colA - colB);
//     return nRows + nCols;
//   }
// }

class NegMaze6 extends NegMaze {
  get randTimes() {
    return randInt(1, Math.floor(this.cellCount / 10));
  }
  randDir(ix) {
    return random(this.neighborSidesOf(ix));
  }
  randPerpendicular(ix, side) {
    return random(perpendiculars(side).filter((s) => !this.onSide(ix, s)));
  }
  openCell() {
    const times = this.randTimes;
    const moveDir = this.randDir(this.ix);
    // const wallDir = this.randDir(this.ix);
    const wallDir = this.randPerpendicular(this.ix, moveDir);
    for (let i = 0; i < times; i++) {
      this.cells[this.ix][wallDir] = true;
      this.seen.add(this.ix);
      if (this.onSide(this.ix, moveDir)) {
        return;
      } else {
        this.ix = this.direction(this.ix, moveDir);
      }
    }
  }
}

// biome-ignore lint/correctness/noUnusedVariables: p5
function setup() {
  getParams();
  const dim = getDim(CELL_COUNT);
  const _canvas = createCanvas(dim, dim);
  maze = new MAZE_CLS();
}

// biome-ignore lint/correctness/noUnusedVariables: p5
function draw() {
  maze.draw();
  if (maze.shouldContinue) {
    maze.openCell();
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
      MAZE_CLS = NegMaze;
      document.querySelector('input.maze-picker[value="1"]').checked = true;
      break;
    case "2":
      MAZE_CLS = NegMaze2;
      document.querySelector('input.maze-picker[value="2"]').checked = true;
      break;
    case "4":
      MAZE_CLS = NegMaze4;
      document.querySelector('input.maze-picker[value="4"]').checked = true;
      break;
    case "6":
      MAZE_CLS = NegMaze6;
      document.querySelector('input.maze-picker[value="6"]').checked = true;
      break;
    default:
      MAZE_CLS = NegMaze3;
      document.querySelector('input.maze-picker[value="3"]').checked = true;
      break;
  }
}
