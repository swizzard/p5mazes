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
  north = true;
  south = true;
  east = true;
  west = true;
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
  draw() {
    if (this.north) {
      line(this.startX, this.startY, this.eastX, this.startY);
    }
    if (this.south) {
      line(this.startX, this.southY, this.eastX, this.southY);
    }
    if (this.east) {
      line(this.eastX, this.startY, this.eastX, this.southY);
    }
    if (this.west) {
      line(this.startX, this.startY, this.startX, this.southY);
    }
  }
}

class Cell1 extends Cell {
  setSides() {
    const r = this.rand4;
    if (r === 0) {
      this.north = false;
    } else if (r === 1) {
      this.south = false;
    } else if (r === 2) {
      this.east = false;
    } else if (r === 3) {
      this.west = false;
    }
  }
  get rand4() {
    return random([0, 1, 2, 3]);
  }
}

class Cell2 extends Cell1 {
  setSides() {
    const n = this.rand4;
    if (n === 4) {
      this.north = false;
      this.south = false;
      this.east = false;
      this.west = false;
    } else {
      for (let i = 0; i < n; i++) {
        this.openRandSide();
      }
    }
  }
  openRandSide() {
    const r = this.rand4;
    if (r === 0) {
      this.north = false;
    } else if (r === 1) {
      this.south = false;
    } else if (r === 2) {
      this.east = false;
    } else {
      this.west = false;
    }
  }
}

class Cell3 extends Cell2 {
  setSides() {
    const n = this.nSidesToOpen;
    if (n === 4) {
      this.north = this.south = this.east = this.west = false;
    } else if (n === 1) {
      this.openRandSide();
    } else {
      while (this.nOpen < n) {
        this.openRandSide();
      }
    }
  }
  get nSidesToOpen() {
    return random([1, 2, 3, 4]);
  }
  get nOpen() {
    let count = 0;
    if (!this.north) {
      count += 1;
    }
    if (!this.south) {
      count += 1;
    }
    if (!this.east) {
      count += 1;
    }
    if (!this.west) {
      count += 1;
    }
    return count;
  }
}

class Cell4 extends Cell3 {
  draw() {
    if (this.north || this.onNorthernEdge) {
      line(this.startX, this.startY, this.eastX, this.startY);
    }
    if (this.south || this.onSouthernEdge) {
      line(this.startX, this.southY, this.eastX, this.southY);
    }
    if (this.east || this.onEasternEdge) {
      line(this.eastX, this.startY, this.eastX, this.southY);
    }
    if (this.west || this.onWesternEdge) {
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
