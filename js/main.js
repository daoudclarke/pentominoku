import {Sudoku} from "./draw";
import {Solver} from "./solver";
import {
  boxRestriction,
  columnRestriction,
  kingsMoveRestriction,
  knightsMoveRestriction, orthogonalConsecutiveRestriction,
  rowRestriction, ThermoRestriction
} from "./restrictions";
import {Thermo} from "./drawRestrictions";
import {binaryToArray} from "./possible";

class ThermoManager {
  constructor(solver, sudoku) {
    this.solver = solver;
    this.sudoku = sudoku;
  }

  addCell(i) {
    this.thermoCells.push(i);
    this.sudoku.drawRestriction(this.thermo);
    const possibleBinary = solver.getPossible([]);
    const possibleDecimal = possibleBinary.map((x) => binaryToArray(x));
    sudoku.updatePossible(possibleDecimal);
  }

  addThermo() {
    this.thermoCells = [];
    this.thermoRestriction = new ThermoRestriction(this.thermoCells);
    this.thermo = new Thermo(this.thermoCells);
    this.solver.addRestriction(this.thermoRestriction.restrict.bind(this.thermoRestriction));
  }
}

const solver = new Solver([rowRestriction, columnRestriction, boxRestriction,
  kingsMoveRestriction])
const sudoku = new Sudoku(onClick);
sudoku.draw();
const thermoManager = new ThermoManager(solver, sudoku);
thermoManager.addThermo();


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
  } else {
    sudoku.setCurrentCellValue(e.key);
    sudoku.setCurrentCellManual();
  }
  // sudoku.updatePossible();
};
