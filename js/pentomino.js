import {getColumnRow} from "./restrictions";
import {Dlx} from "dlxlib";
import {on} from "@svgdotjs/svg.js";


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
pentominoNumbers.set("Z", 2);


const disallowedPentominoIndexes = new Set();
disallowedPentominoIndexes.add(40);


export class Pentomino {
  constructor({type = "F", x = 0, y = 0, variation = 0, indexes = null}) {
    if (!pentominoOffsets.has(type)) {
      throw Error("Invalid type: " + type);
    }

    this.type = type;

    if (indexes !== null) {
      this.indexes = indexes;
      return;
    }

    const originalOffsets = pentominoOffsets.get(type);
    const offsets = [];
    const maxX = Math.max(...originalOffsets.map(offset => offset[0]));
    const maxY = Math.max(...originalOffsets.map(offset => offset[1]));

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

      const index = new_y + new_x*9;
      if (disallowedPentominoIndexes.has(index)) {
        throw Error("Disallowed position");
      }

      this.indexes.push(index);
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


export class NumberedPentomino {
  constructor(pentomino, number, indexes) {
    this.pentomino = pentomino;
    this.number = number;
    this.indexes = indexes;

    const [a1, a2] = indexes;
    const [x1, y1] = getColumnRow(a1);
    const box1 = getBox(x1, y1);
    const [x2, y2] = getColumnRow(a2);
    const box2 = getBox(x2, y2);

    if (y1 === y2 || x1 === x2 || box1 === box2) {
      throw Error("Invalid numbered pentomino");
    }

    this.s = new Set(pentomino.indexes.map(x => "s" + x));
    this.s.add("c" + x1 + "_" + number);
    this.s.add("c" + x2 + "_" + number);
    this.s.add("r" + y1 + "_" + number);
    this.s.add("r" + y2 + "_" + number);
    this.s.add("b" + box1 + "_" + number);
    this.s.add("b" + box2 + "_" + number);
    this.s.add("i" + a1);
    this.s.add("i" + a2);
  }

  draw(svg, locations, rects) {
    this.pentomino.draw(svg, locations, rects);
    for (const i of this.indexes) {
      if (rects[i].text.text()) {
        throw Error("Existing text")
      }

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
      const pentomino = new Pentomino({type: type, x: 0, y: 0, variation: variation});
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


export class SudokuNumber {
  constructor(x, y, number) {
    this.index = x + y*9;
    this.number = number;

    const box = getBox(x, y);

    this.s = new Set();
    this.s.add("c" + x + "_" + number);
    this.s.add("r" + y + "_" + number);
    this.s.add("b" + box + "_" + number);
    this.s.add("i" + this.index);
  }

  draw(svg, locations, rects) {
      if (rects[this.index].text.text()) {
        throw Error("Existing text");
      }

    rects[this.index].text.text(this.number.toString());
  }

}



export class PentominoManager {
  constructor(sudoku, pentominos) {
    this.sudoku = sudoku;
    this.pentominos = pentominos;
    this.starredIndexes = new Set();
  }

  draw() {
    this.sudoku.draw();
    for (let pentomino of this.pentominos) {
      this.sudoku.drawRestriction(pentomino);
    }
    const stars = new Stars(this.starredIndexes);
    this.sudoku.drawRestriction(stars);
  }
}


export class Stars {
  constructor(starIndexes) {
    this.starIndexes = starIndexes;
  }

  draw(svg, locations, rects) {
    for (const i of this.starIndexes) {
      const rect = rects[i];
      rect.square.polygon("50,5 20,90 95,30 5,30 80,90").attr({fill: "grey"});
    }
  }
}


// https://stackoverflow.com/a/12646864
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


export class PentominoSolver {
  constructor(starredIndexes, onUpdate) {
    if (!starredIndexes) {
      throw Error("No starred indexes");
    }
    this.starredIndexes = starredIndexes;
    this.allNumberedPentominos = this.getAllNumberedPentominos();
    shuffleArray(this.allNumberedPentominos);
    this.allSudokuNumbers = this.getAllNumbers();
    this.allItems = this.allNumberedPentominos;
    // this.allItems = allNumberedPentominos.concat(allSudokuNumbers);
    this.keys = new Map();
    this.matrix = this.getMatrix();
    this.onUpdate = onUpdate;
  }

  getAllNumberedPentominos() {
    console.log("Getting all numbered", this.starredIndexes);
    const allNumbered = [];
    for (let i=0; i<9; ++i) {
      for (let j=0; j<9; ++j) {
        for (const [type, variations] of pentominoVariations.entries()) {
          for (const variation of variations) {
            try {
              const pentomino = new Pentomino({type: type, x: i, y: j, variation: variation})
              const newNumbered = getNumberedPentominos(pentomino);

              // Star means that any pentomino that has that index has to be numbered
              for (const numberedPentomino of newNumbered) {
                if (this.isAllowed(numberedPentomino)) {
                  allNumbered.push(numberedPentomino);
                }
              }

            } catch (e) {

            }
          }
        }
      }
    }
    console.log("All numbered", allNumbered.length);
    return allNumbered;
  }

  isAllowed(numberedPentomino) {
    const numberedIndexes = new Set(numberedPentomino.indexes);
    const unNumberedIndexes = numberedPentomino.pentomino.indexes.filter(i => !numberedIndexes.has(i));
    return !unNumberedIndexes.some(i => this.starredIndexes.has(i));
  }

  getAllNumbers() {
    const numbers = [];
    for (let x=0; x<9; ++x) {
      for (let y=0; y<9; ++y) {
        for (let i=1; i<=9; ++i) {
          const number = new SudokuNumber(x, y, i);
          numbers.push(number);
        }
      }
    }
    return numbers;
  }

  getMatrix() {
    let index=0;

    for (const k of ["s", "i"]) {
      for (let i=0; i<81; ++i) {
        if (k === "s" && disallowedPentominoIndexes.has(i)) {
          continue;
        }

        this.keys.set(k + i, index);
        ++index;
      }
    }
    for (const k of ["c", "r", "b"]) {
      for (let i=0; i<9; ++i) {
        for (let j=1; j<=9; ++j) {
          this.keys.set(k + i + "_" + j, index);
          ++index;
        }
      }
    }

    console.log("Keys", this.keys);
    const rows = [];
    for (const item of this.allItems) {
      const row = new Array(this.keys.size).fill(0);
      for (const i of item.s) {
        if (!this.keys.has(i)) {
          throw Error("Missing " + i);
        }

        row[this.keys.get(i)] = 1;
      }
      rows.push(row);
    }

    return rows;
  }

  search() {
    // TODO: Find one solution, or give up after n steps. Then randomize the order and try again.
    //       Find pentominos that don't change between solutions
    console.log("Matrix", this.matrix);
    // const onSolution = e =>
    //   console.log(`solution[${e.solutionIndex}]: ${e.solution}`);
    // const onStep = e =>
    //   console.log(`step[${e.stepIndex}]: ${e.partialSolution}`);
    const dlx = new Dlx();
    dlx.on('step', (e) => {
      const pentominos = e.partialSolution.map(i => this.allItems[i]);
      this.onUpdate(pentominos);
    });
    // dlx.on('solution', onSolution);
    const result = dlx.solve(this.matrix, {numPrimaryColumns: this.keys.get("s80")});
    console.log("Result", result);
  }
}

