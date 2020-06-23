import {Sudoku} from "./draw";
import {Solver} from "./solver";
import {
  boxRestriction,
  columnRestriction,
  kingsMoveRestriction,
  rowRestriction,
  ThermoRestriction
} from "./restrictions";
import {Thermo} from "./drawRestrictions";
import {binaryToArray} from "./possible";

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
    const thermoRestrictions = this.getRestrictions();
    const restrictions = [rowRestriction, columnRestriction, boxRestriction,
      kingsMoveRestriction].concat(thermoRestrictions);
    const possibleBinary = solver.getPossible([], restrictions);
    const possibleDecimal = possibleBinary.map((x) => binaryToArray(x));
    sudoku.updatePossible(possibleDecimal);
    this.draw();
  }

  removeThermo() {
    while (this.restrictionCells[this.restrictionCells.length - 1].length === 0) {
      this.restrictionCells.pop();
    }
    this.restrictionCells.pop();
    this.addThermo();
    this.draw();
  }

  addThermo() {
    this.restrictionCells.push([]);
  }

  getRestrictions() {
    const restrictions = [];
    for (const cells of this.restrictionCells) {
      const thermoRestriction = new ThermoRestriction(cells);
      restrictions.push(thermoRestriction.restrict.bind(thermoRestriction));
    }
    return restrictions;
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

const solver = new Solver()
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


document.onkeypress = function (e) {
  e = e || window.event;
  console.log('Key: ', e.key);
  if (e.key === 'Delete') {
    sudoku.removeCurrentCellValue();
    sudoku.setCurrentCellAuto();
  } else if (e.key === 'n') {
    thermoManager.addThermo();
  } else if (e.key === 'd') {
    thermoManager.removeThermo();
  } else {
    sudoku.setCurrentCellValue(e.key);
    sudoku.setCurrentCellManual();
  }
  // sudoku.updatePossible();
};
