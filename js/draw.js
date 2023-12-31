// noinspection ES6CheckImport
import {SVG} from '@svgdotjs/svg.js'
import {binaryToArray} from "./possible";

export const allowedChars = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9']);


export class Sudoku {
  constructor(clickCallback) {
    this.clickCallback = clickCallback;
    this.selectedRectIndex = null;
    this.rects = null;
    this.svg = null;
    this.locations = null;
    this.hoveredSquare = null;
  }

  draw() {
    if (this.svg) {
      this.svg.remove();
    }
    this.svg = SVG().addTo('body').size(1200, 1200);

    this.locations = [];
    this.rects = [];
    for (let i=0; i<9; ++i) {
      for (let j=0; j<9; ++j) {
        let x = 20 + 90*i;
        let y = 20 + 90*j;

        this.locations.push({x: x + 45, y: y + 45});

        const square = this.svg.nested();
        square.attr({x: x, y: y});
        square.addClass('square');

        const rect = square.rect(90, 90).attr({x: 0, y: 0, fill: '#fff', stroke: '#000', 'stroke-width': 1});
        const text = square.text('').attr(
          {'font-size': '60px'});

        // square.mouseover(() => rect.attr({fill: '#eee'}));
        // square.mouseout(() => rect.attr({fill: '#fff'}));
        let index = i * 9 + j;
        square.mouseover(() => this.hoveredSquare = index);
        square.click(() => this.clickCallback(index));
        this.rects.push({rect: rect, square: square, text: text, manual: false});
      }
    }
  }

  select(index) {
    const square = this.rects[index].square;
    if (this.selectedSquare !== null) {
      this.selectedSquare.removeClass('selected');
    }
    square.addClass('selected');
    this.selectedRectIndex = index;
  }

  drawRestriction(restriction) {
    restriction.draw(this.svg, this.locations, this.rects);
  }

  setCurrentCellValue(value) {
    const index = this.hoveredSquare;
    this.setCellValue(index, value);
  }

  removeCurrentCellValue() {
    const index = this.hoveredSquare;
    this.rects[index].value = null;
    this.rects[index].text.text('');
  }

  setCurrentCellManual() {
    if (this.hoveredSquare !== null) {
      this.rects[this.hoveredSquare].manual = true;
      this.rects[this.hoveredSquare].square.addClass('manual');
    }
  }

  setCurrentCellAuto() {
    console.log("Selected rect", this.hoveredSquare)
    this.rects[this.hoveredSquare].manual = false;
    this.rects[this.hoveredSquare].square.removeClass('manual');
  }

  setCellWrong(index) {
    this.rects[index].square.addClass('wrong');
  }

  setCellRight(index) {
    this.rects[index].square.removeClass('wrong');
  }

  setCellValue(index, value) {
    if (index === null || !allowedChars.has(value)) {
      return;
    }

    this.rects[index].value = value;

    const text = this.rects[index].text;
    text.text(value);
    text.font({'font-size': "60px"});
    text.center(45, 45);
  }

  setCellValues(index, values) {
    let valueString = values.join('');
    const text = this.rects[index].text;

    if (values.length === 9) {
      text.text('');
      return;
    }

    if (values.length > 4) {
      valueString = valueString.substring(0, 4).concat('\n').concat(valueString.substring(4))
    }

    text.text(valueString);

    const fontSize = values.length > 1 ? '30px' : '60px';
    text.font({'font-size': fontSize});
    text.center(45, 45);
    // const scale = 90 / text.bbox().width;
    // text.width(80);
  }

  get selectedSquare() {
    console.log("Selected rect index", this.selectedRectIndex);
    return this.selectedRectIndex === null ? null : this.rects[this.selectedRectIndex].square;
  }

  updatePossible(possibleDecimal) {
    for (let i=0; i<possibleDecimal.length; ++i) {
      if (!this.rects[i].manual) {
        this.setCellValues(i, possibleDecimal[i]);
      }
      // if (possibleDecimal[i].length === 1) {
      //   const value = possibleDecimal[i][0];
      //   console.log("Setting value", i, value);
      //   this.setCellValue(i, value.toString());
      // }
      if (possibleDecimal[i].length === 0) {
        this.setCellWrong(i);
      } else {
        this.setCellRight(i);
      }
    }
  }
}

