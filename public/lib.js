// biome-ignore-start lint/correctness/noUnusedVariables: lib
const NORTH = Symbol("north");
const SOUTH = Symbol("south");
const EAST = Symbol("east");
const WEST = Symbol("west");

class _M {
  cellCount;
  cellCls;
  cells;

  constructor(cellCls, cellCount) {
    console.log(
      `creating ${cellCount} x ${cellCount} ${this.constructor.name} using ${cellCls.name}`,
    );
    this.cellCount = cellCount;
    this.cellCls = cellCls;
    this.cells = [];
    const tot = cellCount * cellCount;
    let x = 0;
    let y = 0;
    for (let i = 1; i <= tot; i++) {
      const cell = new cellCls(x, y, this.cellDim, i - 1);
      this.cells.push(cell);
      if (i % this.cellCount === 0) {
        x = 0;
        y += this.cellDim;
      } else {
        x += this.cellDim;
      }
    }
  }
  get cellDim() {
    return getDim(this.cellCount) / this.cellCount;
  }
  onNorth(ix) {
    return ix < this.cellCount;
  }
  onSouth(ix) {
    return ix >= this.cellCount * (this.cellCount - 1);
  }
  onEast(ix) {
    return ix % this.cellCount === this.cellCount - 1;
  }
  onWest(ix) {
    return ix % this.cellCount === 0;
  }
  east(ix) {
    return ix + 1;
  }
  west(ix) {
    return ix - 1;
  }
  north(ix) {
    return ix - this.cellCount;
  }
  south(ix) {
    return ix + this.cellCount;
  }
  neighborSidesOf(ix) {
    const opts = [];
    const c = this.cells[ix];
    if (!this.onEast(ix)) {
      opts.push(EAST);
    }
    if (!this.onWest(ix)) {
      opts.push(WEST);
    }
    if (!this.onNorth(ix)) {
      opts.push(NORTH);
    }
    if (!this.onSouth(ix)) {
      opts.push(SOUTH);
    }
    return opts;
  }
  direction(ix, dir) {
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
  draw() {
    background(51);
    strokeWeight(4);
    stroke("white");
    this.cells.forEach((c) => {
      c.draw();
    });
  }
}

class _C {
  startX;
  startY;
  ix;
  cellDim;
  [NORTH];
  [SOUTH];
  [EAST];
  [WEST];
  constructor(startX, startY, cellDim, ix) {
    this.startX = startX;
    this.startY = startY;
    this.ix = ix;
    this.cellDim = cellDim;
  }
  get eastX() {
    return this.startX + this.cellDim;
  }
  get southY() {
    return this.startY + this.cellDim;
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

function getDim(cellCount) {
  let dim = 0.8 * (windowWidth >= windowHeight ? windowHeight : windowWidth);
  dim = dim - (dim % cellCount);
  return dim;
}

function opposite(dir) {
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

function perpendiculars(dir) {
  switch (dir) {
    case NORTH:
    case SOUTH:
      return [EAST, WEST];
    case EAST:
    case WEST:
      return [NORTH, SOUTH];
  }
}

function randInt(min, max) {
  if (max === undefined) {
    return Math.floor(random(n + 1));
  } else {
    return Math.floor(random(min, max + 1));
  }
}

function ixs(cellCount) {
  return Iterator.from({
    _ix: 0,
    next() {
      if (this._ix >= cellCount * cellCount) {
        return { done: true, value: undefined };
      } else {
        const res = { done: false, value: this._ix };
        this._ix++;
        return res;
      }
    },
  });
}

class UniQ {
  vals;

  constructor() {
    this.vals = [];
  }
  static from(arr) {
    const q = new UniQ();
    q.vals = arr;
  }
  [Symbol.iterator]() {
    return this.vals.toReversed()[Symbol.iterator]();
  }
  push(val) {
    const prevIx = this.vals.indexOf(val);
    if (prevIx > -1) {
      this.vals.splice(prevIx, 1);
    }
    this.vals.push(val);
  }
  get length() {
    return this.vals.length;
  }
  rev() {
    const vi = this.vals[Symbol.iterator]();
    return {
      [Symbol.iterator]() {
        return vi;
      },
    };
  }
}
// biome-ignore-end lint/correctness/noUnusedVariables: lib
