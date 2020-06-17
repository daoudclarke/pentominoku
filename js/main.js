import {Sudoku} from "./draw";
import {Solver} from "./solver";
import {boxRestriction, columnRestriction, rowRestriction} from "./restrictions";


const solver = new Solver([rowRestriction, columnRestriction, boxRestriction])
const sudoku = new Sudoku(solver);
sudoku.draw();

document.onkeypress = function (e) {
  e = e || window.event;
  sudoku.setCurrentCellValue(e.key);
  sudoku.setCurrentCellManual();
  sudoku.updatePossible();
};
