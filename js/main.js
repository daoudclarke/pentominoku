
const MAX_MOVES = 3;

function randomNumber() {
  return Math.ceil(Math.random() * 9);
}

let allPositions = new Set();
for (let i=1; i<=9; ++i) {
  for (let j=1; j<=9; ++j) {
    allPositions.add([i,j]);
  }
}

function choose(choices) {
  let index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

function randomMove(sudoku) {
  const positions = new Set();
  for (const move of sudoku) {
    positions.add([move[0], move[1]]);
  }

  const validPositions = new Set([...allPositions].filter(x => !positions.has(x)));

  const position = choose(Array.from(validPositions));
  return [position[0], position[1], randomNumber()]
}


let allPossible = [];
const allNumbers = 511;
for (let i=0; i<81; ++i) {
  allPossible.push(allNumbers);
}


function getPossible(restrictions, solution) {
  const possible = allPossible.slice();
  for (const restriction of restrictions) {
    const restrictionPossible = restriction(solution);
    for (let i=0; i<possible.length; ++i) {
      possible[i] &= restrictionPossible[i];
    }
  }
  return possible;
}


function rowRestriction(fixedPoints) {
  const possible = allPossible.slice();
  for (const [i, value] of fixedPoints) {
    const row = Math.floor(i/9);
    let valueBinary = 1 << (value - 1);
    const notValue = allNumbers - valueBinary;
    for (let j=row*9; j<(row+1)*9; ++j) {
      if (j === i) {
        possible[j] = valueBinary;
      } else {
        possible[j] &= notValue;
      }
    }
  }
  return possible;
}


function columnRestriction(fixedPoints) {
  const possible = allPossible.slice();
  for (const [i, value] of fixedPoints) {
    const column = i % 9;
    let valueBinary = 1 << (value - 1);
    const notValue = allNumbers - valueBinary;
    for (let j=column; j<81; j+=9) {
      if (j === i) {
        possible[j] = valueBinary;
      } else {
        possible[j] &= notValue;
      }
    }
  }
  return possible;
}


function boxRestriction(fixedPoints) {
  const possible = allPossible.slice();
  for (const [i, value] of fixedPoints) {
    const column = i % 9;
    const row = (i - column)/9;
    const firstRow = row - (row % 3);
    const firstColumn = column - (column % 3);
    console.log("First row column", row, column, firstRow, firstColumn);
    let valueBinary = 1 << (value - 1);
    const notValue = allNumbers - valueBinary;
    for (let k=firstRow; k<firstRow + 3; ++k) {
      for (let l=firstColumn; l<firstColumn + 3; ++l) {
        const j = k*9 + l;
        if (j === i) {
          possible[j] = valueBinary;
        } else {
          possible[j] &= notValue;
        }
      }
    }
  }
  return possible;
}


function testRow() {
  let restrictions = [rowRestriction];
  let fixedPoints = [[4,5], [0,3]];
  let possible = getPossible(restrictions, fixedPoints);
  console.log("Possible", possible);
}

function testColumn() {
  let restrictions = [columnRestriction];
  let fixedPoints = [[4,5], [0,3]];
  let possible = getPossible(restrictions, fixedPoints);
  // console.log("Possible", possible);
  printPossible(possible);
}

function testBox() {
  let restrictions = [boxRestriction];
  let fixedPoints = [[33,5]];
  let possible = getPossible(restrictions, fixedPoints);
  printPossible(possible);
}

function test() {
  let restrictions = [rowRestriction, columnRestriction, boxRestriction];
  let fixedPoints = [[33,5]];
  let possible = getPossible(restrictions, fixedPoints);
  printPossible(possible);
}

function printPossible(possible) {
  console.log("Possible");
  for (let i=0; i<81; i+=9) {
    console.log(possible.slice(i, i+9));
  }
}
