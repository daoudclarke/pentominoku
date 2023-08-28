import {allowedChars, Sudoku} from "./draw";
import {Solver} from "./solver";
import {
  boxRestriction,
  columnRestriction,
  kingsMoveRestriction, PrimeNumberRestriction,
  rowRestriction,
  ThermoRestriction
} from "./restrictions";
import {Thermo} from "./drawRestrictions";
import {binaryToArray} from "./possible";

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
sudoku.draw();
const thermoManager = new ThermoManager(solver, sudoku);
// thermoManager.addThermo();


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
  } else if (allowedChars.has(e.key)) {
    sudoku.setCurrentCellValue(e.key);
    sudoku.setCurrentCellManual();
    fixedPoints.set(sudoku.hoveredSquare, sudoku.rects[sudoku.hoveredSquare].value);
    thermoManager.update();
  }
  // sudoku.updatePossible();
};
