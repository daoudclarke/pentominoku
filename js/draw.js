// noinspection ES6CheckImport
import { SVG } from '@svgdotjs/svg.js'
import {binaryToArray} from "./possible";

const allowedChars = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9']);


export class Sudoku {
  constructor(solver) {
    this.solver = solver;
    this.selectedRectIndex = null;
    this.rects = null;
  }

  draw() {
    const draw = SVG().addTo('body').size(1200, 1200);

    this.rects = [];
    for (let i=0; i<9; ++i) {
      for (let j=0; j<9; ++j) {
        let x = 20 + 90*i;
        let y = 20 + 90*j;

        const square = draw.nested();
        square.attr({x: x, y: y});

        const rect = square.rect(90, 90).attr({x: 0, y: 0, fill: '#fff', stroke: '#000', 'stroke-width': 1});
        const text = square.text('').attr(
          {'font-size': '60px'});

        square.mouseover(() => rect.attr({fill: '#eee'}));
        square.mouseout(() => rect.attr({fill: '#fff'}));
        square.click(() => {
          if (this.selectedRect !== null) {
            this.selectedRect.removeClass('selected');
          }
          rect.addClass('selected');
          this.selectedRectIndex = i*9 + j;
        });
        this.rects.push({rect: rect, square: square, text: text});
      }
    }
  }

  setCurrentCellValue(value) {
    const index = this.selectedRectIndex;
    this.setCellValue(index, value);
  }

  setCellValue(index, value) {
    if (index === null || !allowedChars.has(value)) {
      return;
    }

    this.rects[index].value = value;

    const text = this.rects[index].text;
    text.text(value);
    text.center(45, 45);
  }

  get selectedRect() {
    console.log("Selected rect index", this.selectedRectIndex);
    return this.selectedRectIndex === null ? null : this.rects[this.selectedRectIndex].rect;
  }

  updatePossible() {
    const solution = [];
    for (let i=0; i<this.rects.length; ++i) {
      let value = this.rects[i].value;
      if (value) {
        let valueInt = parseInt(value);
        solution.push([i, valueInt]);
      }
    }
    const possibleBinary = this.solver.getPossible(solution);
    const possibleDecimal = possibleBinary.map((x) => binaryToArray(x));
    for (let i=0; i<possibleDecimal.length; ++i) {
      if (possibleDecimal[i].length === 1) {
        const value = possibleDecimal[i][0];
        console.log("Setting value", i, value);
        this.setCellValue(i, value.toString());
      }
    }
  }
}


