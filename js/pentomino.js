import {off} from "@svgdotjs/svg.js";
import {getColumnRow} from "./restrictions";


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
pentominoOffsets.set("Z", [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]]);

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
pentominoColours.set("Z", "#44932e");

const pentominoNumbers = new Map();
pentominoNumbers.set("F", 6);
pentominoNumbers.set("L", 2);
pentominoNumbers.set("N", 3);
pentominoNumbers.set("P", 4);
pentominoNumbers.set("T", 5);
pentominoNumbers.set("U", 1);
pentominoNumbers.set("V", 7);
pentominoNumbers.set("W", 8);
pentominoNumbers.set("X", 9);
pentominoNumbers.set("Y", 1);
pentominoNumbers.set("Z", 9);


export class Pentomino {
  constructor(type = "F", x = 0, y = 0, variation = 0) {
    if (!pentominoOffsets.has(type)) {
      throw Error("Invalid type: " + type);
    }

    this.type = type;

    const originalOffsets = pentominoOffsets.get(type);
    const offsets = [];
    const maxX = Math.max(...originalOffsets.map(x => x[0]));
    const maxY = Math.max(...originalOffsets.map(x => x[1]));

    // Rotate and flip the original
    for (const [ox, oy] of originalOffsets) {
      let newX = ox;
      let newY = oy;
      if (variation % 2 === 1) {
        newY = maxY - newY;
      }
      if (variation % 4 >= 2) {
        newX = maxX - newX;
      }

      if (variation >= 4) {
        const s = newX;
        newX = newY;
        newY = s;
      }
      offsets.push([newX, newY]);
    }

    this.indexes = [];
    for (const [ox, oy] of offsets) {
      const new_x = x + ox;
      const new_y = y + oy;

      if (new_x >= 9 || new_y >= 9 || new_x < 0 || new_y < 0) {
        throw Error("Position no good:" + new_x + " " + new_y);
      }

      if (new_x === 4 && new_y === 4) {
        throw Error("Disallowed position");
      }

      this.indexes.push(new_y + new_x*9);
    }
    this.indexes.sort();
  }

  draw(svg, locations, rects) {
    const colour = pentominoColours.get(this.type);
    for (const i of this.indexes) {
      rects[i].rect.attr({fill: colour,});
    }
  }

  toString() {
    return this.indexes.toString();
  }
}


function getBox(x, y) {
  return ((x - x % 3) / 3) + ((y - y % 3) / 3) * 3;
}


class NumberedPentomino {
  constructor(pentomino, number, indexes) {
    this.pentomino = pentomino;
    this.number = number;
    this.indexes = indexes;

    const [a1, a2] = indexes;
    const [y1, x1] = getColumnRow(a1);
    const box1 = getBox(x1, y1);
    const [y2, x2] = getColumnRow(a2);
    const box2 = getBox(x2, y2);

    if (y1 === y2 || x1 === x2 || box1 === box2) {
      throw Error("Invalid numbered pentomino");
    }

    this.s = new Set(pentomino.indexes);
    this.s.add("c" + x1);
    this.s.add("c" + x2);
    this.s.add("r" + y1);
    this.s.add("r" + y2);
    this.s.add("b" + box1);
    this.s.add("b" + box2);
  }

  draw(svg, locations, rects) {
    this.pentomino.draw(svg, locations, rects);
    for (const i of this.indexes) {
      rects[i].text.text(this.number.toString());
    }
  }

  toString() {
    return this.pentomino.toString + " - " + this.indexes.toString();
  }
}

function getNumberedPentominos(pentomino) {
  const number = pentominoNumbers.get(pentomino.type);

  const numberedPentominos = [];
  for (let i=0; i<4; ++i) {
    for (let j=i+1; j<5; ++j) {
      const i1 = pentomino.indexes[i];
      const i2 = pentomino.indexes[j];

      try {
        const newPentomino = new NumberedPentomino(pentomino, number, [i1, i2]);
        numberedPentominos.push(newPentomino);
      } catch (e) {
      }
    }
  }

  return numberedPentominos;
}


function getVariations() {
  const pentominoVariations = new Map();
  for (const type of pentominoOffsets.keys()) {
    const seen = new Set();
    const variations = [];
    for (let variation=0; variation<8; ++variation) {
      const pentomino = new Pentomino(type, 0, 0, variation);
      const pentominoStr = pentomino.toString();
      if (seen.has(pentominoStr)) {
        continue;
      }
      seen.add(pentominoStr);
      variations.push(variation);
    }
    pentominoVariations.set(type, variations);
  }
  console.log("Variations", pentominoVariations);
  return pentominoVariations;
}


const pentominoVariations = getVariations();



function getAllNumberedPentominos() {
  const allNumbered = [];
  for (let i=0; i<9; ++i) {
    for (let j=0; j<9; ++j) {
      for (const [type, variations] of pentominoVariations.entries()) {
        for (const variation of variations) {
          try {
            const pentomino = new Pentomino(type, i, j, variation)
            const newNumbered = getNumberedPentominos(pentomino);
            allNumbered.push(...newNumbered);
          } catch (e) {

          }
        }
      }
    }
  }
  console.log("All numbered", allNumbered.length);
  return allNumbered;
}


export const allNumberedPentominos = getAllNumberedPentominos();


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

  search(maxDepth = 1) {
    this.pentominos = [];

    // Choose the set item that has the lowest options for pentominos to cover it
    for (let depth=0; depth < maxDepth; ++depth) {
      const itemCounts = new Map();
      for (const pentomino of allNumberedPentominos) {
        for (const i of pentomino.s) {
          if (itemCounts.has(i)) {
            itemCounts.set(i, itemCounts.get(i) + 1);
          } else {
            itemCounts.set(i, 0);
          }
        }
      }
      console.log("Item counts", itemCounts);

    }
  }
}

