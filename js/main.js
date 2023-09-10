import {allowedChars, Sudoku} from "./draw";
import {Solver} from "./solver";
import {boxRestriction, columnRestriction, PrimeNumberRestriction, rowRestriction} from "./restrictions";
import {Thermo} from "./drawRestrictions";
import {binaryToArray} from "./possible";
import {NumberedPentomino, Pentomino, PentominoManager} from "./pentomino";

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



class PentominoSet {
  constructor(pentominos) {
    this.items = new Map();
    for (const pentomino of pentominos) {
      this.items.set(JSON.stringify(pentomino), pentomino);
    }
  }

  intersect(pentominos) {
    console.log("Intersect", pentominos, [...this.items.values()]);
    const newPentominos = [];
    for (const pentomino of pentominos) {
      let key = JSON.stringify(pentomino);
      console.log("Key", key);
      if (this.items.has(key)) {
        newPentominos.push(pentomino);
      }
    }
    console.log("Intersect end", newPentominos)
    return new PentominoSet(newPentominos);
  }
}


const solver = new Solver();
const sudoku = new Sudoku(onClick);
// sudoku.draw();
const thermoManager = new ThermoManager(solver, sudoku);
// thermoManager.addThermo();

// let p = 0;
// const pentominos = [allNumberedPentominos[p]];

// const pentomino = allNumberedPentominos[p];
// const sudokuNumber = new SudokuNumber(2, 0, 2);

// console.log("Pentomino", pentomino);
// console.log("Number", sudokuNumber);
//
// const pentominos = [pentomino, sudokuNumber];

const pentominos = [];

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


let myWorker;

const starredIndexes = new Set();
let bestResult = [];
let solutions = [];
let pentominoSet = null;
let numSteps = 0;
function onClick(i) {
  if (myWorker) {
    myWorker.terminate();
  }
  myWorker = new Worker("worker.js");
  // thermoManager.addCell(i);
  // starredIndexes.add(i);
  toggleStar(i);
  bestResult = [];
  solutions = [];
  numSteps = 0;
  pentominoSet = null;
  fixedPoints.clear();
  startWorker();
  newMessage("Started search");
  myWorker.postMessage(starredIndexes);
}

function toggleStar(index) {
  if (starredIndexes.has(index)) {
    starredIndexes.delete(index);
  } else {
    starredIndexes.add(index);
  }
}


function drawPentominos(pentominoData) {
  console.log("Draw", pentominoData);
  pentominoManager.pentominos = pentominoData.map(p => new NumberedPentomino(new Pentomino(p.pentomino), p.number, p.indexes));
  pentominoManager.starredIndexes = starredIndexes;
  pentominoManager.draw();

  fixedPoints.clear();
  for (const pentomino of pentominoData) {
    for (const index of pentomino.indexes) {
      fixedPoints.set(index, pentomino.number);
    }
  }
  thermoManager.update();
}


function isSolutionGood(pentominos) {
  const solutionFixedPoints = new Map();

  for (const pentomino of pentominos) {
    for (const index of pentomino.indexes) {
      solutionFixedPoints.set(index, pentomino.number);
    }
  }

  const restrictions = [rowRestriction, columnRestriction, boxRestriction];
  const possibleBinary = solver.getPossible(solutionFixedPoints, restrictions);
  return Math.min(...possibleBinary) > 0;
}


function onWorkerMessage(e) {
  if (e.data.update === "step") {
    ++numSteps;
    const pentominoData = e.data.pentominos;
    if (solutions.length === 0 && pentominoData.length > bestResult.length) {
      bestResult = pentominoData;

      drawPentominos(pentominoData);
    }

    if (numSteps >= 1000) {
      // Solution is taking too long, restart with new random order
      numSteps = 0;
      myWorker.terminate();
      myWorker = new Worker("worker.js");
      startWorker();
      myWorker.postMessage(starredIndexes);
    }

  } else if (e.data.update === "solution") {
    if (!isSolutionGood(e.data.pentominos)) {
      return;
    }
    solutions.push(e.data.pentominos);
    newMessage("Searching... found new solution: " + solutions.length + " in steps: " + numSteps);
    numSteps = 0;
    if (pentominoSet === null) {
      pentominoSet = new PentominoSet(e.data.pentominos);
    } else {
      pentominoSet = pentominoSet.intersect(e.data.pentominos);
    }
    drawPentominos([...pentominoSet.items.values()]);
    // If we have lots of solutions, randomize and try again to avoid getting lots of similar solutions
    if (solutions.length >= 2) {
      myWorker.terminate();
      if (solutions.length < 20) {
        myWorker = new Worker("worker.js");
        startWorker();
        myWorker.postMessage(starredIndexes);
      }
    }

  } else if (e.data.update === "finish") {
    if (solutions.length === 1) {
      newMessage("Congratulations! unique solution found");
    } else {
      newMessage("Finished - found " + solutions.length + " solutions");
    }
  }
}

function startWorker() {
  myWorker.onmessage = onWorkerMessage;

}

function newMessage(message) {
  const p = document.createElement("p");
  p.innerText = message;

  const div = document.getElementById("messages");
  for (const child of div.children) {
    child.remove();
  }
  div.appendChild(p);
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

window.onload = function() {
  newMessage("Click in the grid to add pentominoku stars");
}

