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
    default:
      MAZE_CLS = NegMaze3;
      document.querySelector('input.maze-picker[value="3"]').checked = true;
      break;
  }
}
