import {allowedChars, Sudoku} from "./draw";
import {Solver} from "./solver";
import {boxRestriction, columnRestriction, PrimeNumberRestriction, rowRestriction} from "./restrictions";
import {Thermo} from "./drawRestrictions";
import {binaryToArray} from "./possible";
import {allItems, allNumberedPentominos, PentominoManager} from "./pentomino";

const fixedPoints = new Map();

class ThermoManager {
  constructor(solver, sudoku) {
    this.solver = solver;
    this.sudoku = sudoku;
    this.restrictionCells = [];
  }

  addCell(i) {
    if (this.restrictionCells.length === 0) {
      this.addThermo();
    }
    this.restrictionCells[this.restrictionCells.length - 1].push(i);

    this.draw();
    this.update();
  }

  update() {
    const thermoRestrictions = this.getRestrictions();
    const restrictions = [rowRestriction, columnRestriction, boxRestriction].concat(thermoRestrictions);
    const possibleBinary = solver.getPossible(fixedPoints, restrictions);
    const possibleDecimal = possibleBinary.map((x) => binaryToArray(x));
    sudoku.updatePossible(possibleDecimal);
  }

  removeThermo() {
    if (this.removeHovered()) {
      this.draw();
      this.update();
    }
  }

  removeHovered() {
    const hovered = this.sudoku.hoveredSquare;
    for (const cells of this.restrictionCells) {
      for (let i=0; i<cells.length; ++i) {
        if (cells[i] === hovered) {
          while (cells.pop() !== hovered) {}
          return true;
        }
      }
    }
    return false;
  }

  addThermo() {
    this.restrictionCells.push([]);
  }

  // getRestrictions() {
  //   const restrictions = [];
  //   for (const cells of this.restrictionCells) {
  //     const thermoRestriction = new ThermoRestriction(cells);
  //     restrictions.push(thermoRestriction.restrict.bind(thermoRestriction));
  //   }
  //   return restrictions;
  // }

  getRestrictions() {
    const pairs = [];
    for (const cells of this.restrictionCells) {
      for (let i=1; i<cells.length; ++i) {
        const pair = [cells[i-1], cells[i]];
        pairs.push(pair);
      }
    }
    const restriction = new PrimeNumberRestriction(pairs);
    return [restriction.restrict.bind(restriction)];
  }

  draw() {
    console.log("Drawing", this.restrictionCells);
    this.sudoku.draw();
    for (const cells of this.restrictionCells) {
      if (cells.length > 0) {
        this.sudoku.drawRestriction(new Thermo(cells));
      }
    }
  }
}

const solver = new Solver();
const sudoku = new Sudoku(onClick);
// sudoku.draw();
// const thermoManager = new ThermoManager(solver, sudoku);
// thermoManager.addThermo();

let p = 0;
const pentominos = [allNumberedPentominos[p]];

// const pentominos = [
//   new Pentomino("F", 0, 0),
//   new Pentomino("L", 3, 0),
//   new Pentomino("N", 5, 0),
//   new Pentomino("P", 4, 0),
//   new Pentomino("T", 0, 3),
//   new Pentomino("U", 7, 0, 5),
//   new Pentomino("V", 4, 4),
//   new Pentomino("W", 0, 6),
//   new Pentomino("X", 2, 6),
//   new Pentomino("Y", 7, 5),
//   new Pentomino("Z", 5, 3, 1),
// ]

// const pentominos = [
//   new Pentomino("F", 0, 0, 0),
//   new Pentomino("F", 3, 0, 1),
//   new Pentomino("F", 6, 0, 2),
//   new Pentomino("F", 0, 3, 3),
//   new Pentomino("F", 3, 3, 4),
//   new Pentomino("F", 6, 3, 5),
//   new Pentomino("F", 0, 6, 6),
//   new Pentomino("F", 3, 6, 7),
// ]

const pentominoManager = new PentominoManager(sudoku, pentominos);
pentominoManager.draw();
// search();


function onClick(i) {
  thermoManager.addCell(i);
}


// function updatePossible() {
//   const solution = [];
//   // for (let i=0; i<this.rects.length; ++i) {
//   //   let value = this.rects[i].value;
//   //   if (value) {
//   //     let valueInt = parseInt(value);
//   //     solution.push([i, valueInt]);
//   //   }
//   // }
//   const possibleBinary = solver.getPossible(solution);
//   const possibleDecimal = possibleBinary.map((x) => binaryToArray(x));
//   sudoku.updatePossible(possibleDecimal);
// }


const myWorker = new Worker("worker.js");

let bestResult = [];
let bestNum = 0;
myWorker.onmessage = (e) => {
  const step = e.data.partialSolution;
  if (step.length > bestResult.length) {
    const numPentominos = step.filter((x) => x < allNumberedPentominos.length).length;
    if (numPentominos > bestNum) {
      bestNum = numPentominos;
      bestResult = step;
      console.log("New best", step);

      pentominoManager.pentominos = bestResult.map(x => allItems[x]);
      pentominoManager.draw();
    }

  }


  // console.log("Message", e);
  // myWorker.terminate();
};


document.onkeydown = function (e) {
  e = e || window.event;
  console.log('Key: ', e.key);
  if (e.key === 'Delete') {
    sudoku.removeCurrentCellValue();
    sudoku.setCurrentCellAuto();
    fixedPoints.delete(sudoku.hoveredSquare);
    thermoManager.update();
  } else if (e.key === 'n') {
    thermoManager.addThermo();
  } else if (e.key === 'd') {
    thermoManager.removeThermo();
  } else if (e.key === 'p') {
    ++p;
    pentominoManager.pentominos = [allNumberedPentominos[p]];
    pentominoManager.draw()
  } else if (allowedChars.has(e.key)) {
    sudoku.setCurrentCellValue(e.key);
    sudoku.setCurrentCellManual();
    fixedPoints.set(sudoku.hoveredSquare, sudoku.rects[sudoku.hoveredSquare].value);
    thermoManager.update();
  }
  // sudoku.updatePossible();
};
