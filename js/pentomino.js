

const pentominoOffsets = new Map();
pentominoOffsets.set("F", [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]]);
pentominoOffsets.set("L", [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]]);
pentominoOffsets.set("N", [[1, 0], [1, 1], [1, 2], [0, 2], [0, 3]]);
pentominoOffsets.set("P", [[0, 0], [0, 1], [1, 0], [1, 1], [0, 2]]);
pentominoOffsets.set("T", [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]]);
pentominoOffsets.set("U", [[0, 0], [0, 1], [1, 1], [2, 1], [2, 0]]);
pentominoOffsets.set("V", [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]]);
pentominoOffsets.set("W", [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]]);
pentominoOffsets.set("X", [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]]);
pentominoOffsets.set("Y", [[1, 0], [0, 1], [1, 1], [1, 2], [1, 3]]);
pentominoOffsets.set("Z", [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]]);

const pentominoColours = new Map();
pentominoColours.set("F", "#c45dff");
pentominoColours.set("L", "#ff94f0");
pentominoColours.set("N", "#23d1ff");
pentominoColours.set("P", "#523dff");
pentominoColours.set("T", "#396036");
pentominoColours.set("U", "#0830ff");
pentominoColours.set("V", "#ffc300");
pentominoColours.set("W", "#ff3d43");
pentominoColours.set("X", "#79c27e");
pentominoColours.set("Y", "#afa400");

export class Pentomino {
  constructor(type = "F", x = 0, y = 0) {
    if (!pentominoOffsets.has(type)) {
      throw Error("Invalid type: " + type);
    }

    this.type = type;

    const offsets = pentominoOffsets.get(type);
    this.indexes = [];
    for (const [ox, oy] of offsets) {
      const new_x = x + ox;
      const new_y = y + oy;

      if (new_x >= 9 || new_y >= 9) {
        throw Error("Position no good");
      }

      this.indexes.push(new_y + new_x*9);
    }
    console.log("Indexes", this.indexes);
  }

  draw(svg, locations) {
    const colour = pentominoColours.get(this.type);
    for (const i of this.indexes) {
      const square = svg.nested();
      console.log("Index", i, locations[i]);
      square.attr({x: locations[i].x - 45, y: locations[i].y - 45});
      square.addClass('square');

      const rect = square.rect(90, 90).attr({x: 0, y: 0, fill: colour, stroke: null, 'stroke-width': 0});
    }
  }
}


export class PentominoManager {
  constructor(sudoku, pentominos) {
    this.sudoku = sudoku;
    this.pentominos = pentominos;
  }

  draw() {
    this.sudoku.draw();
    for (let pentomino of this.pentominos) {
      this.sudoku.drawRestriction(pentomino);
    }
  }
}
