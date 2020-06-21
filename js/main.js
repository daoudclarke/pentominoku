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



const thermoCells = [];
const thermoRestriction = new ThermoRestriction(thermoCells);
const thermo = new Thermo(thermoCells);

const solver = new Solver([rowRestriction, columnRestriction, boxRestriction,
  kingsMoveRestriction, thermoRestriction.restrict.bind(thermoRestriction)])
const sudoku = new Sudoku(solver, onClick);
sudoku.draw();


function onClick(i) {
  // sudoku.select(i);
  thermoCells.push(i);
  sudoku.drawRestriction(thermo);
  sudoku.updatePossible();
}


document.onkeypress = function (e) {
  e = e || window.event;
  console.log('Key: ', e.key);
  if (e.key === 'Delete') {
    sudoku.removeCurrentCellValue();
    sudoku.setCurrentCellAuto();
  } else {
    sudoku.setCurrentCellValue(e.key);
    sudoku.setCurrentCellManual();
  }
  sudoku.updatePossible();
};
