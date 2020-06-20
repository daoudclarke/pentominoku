import {Sudoku} from "./draw";
import {Solver} from "./solver";
import {
  boxRestriction,
  columnRestriction,
  kingsMoveRestriction,
  knightsMoveRestriction, orthogonalConsecutiveRestriction,
  rowRestriction
} from "./restrictions";


const solver = new Solver([rowRestriction, columnRestriction, boxRestriction,
  kingsMoveRestriction, knightsMoveRestriction])
const sudoku = new Sudoku(solver);
sudoku.draw();

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
