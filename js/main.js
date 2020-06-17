import {Sudoku} from "./draw";



const sudoku = new Sudoku();
sudoku.draw();

document.onkeypress = function (e) {
    e = e || window.event;
    sudoku.setCurrentCellValue(e.key);
};
