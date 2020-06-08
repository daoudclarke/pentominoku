
const MAX_MOVES = 3;

function randomNumber() {
  return Math.ceil(Math.random() * 9);
}

function randomMove() {
  return [randomNumber(), randomNumber(), randomNumber()]
}

function getNewSolution(sudoku, restrictions) {
  for (let i = 0; i < MAX_MOVES; ++i) {
    const newMove = randomMove();
    const newSolution = sudoku.concat([newMove])
    let valid = true;
    for (const restriction of restrictions) {
      if (!restriction(newSolution)) {
        valid = false;
        break;
      }
    }
    if (valid) {
      return newSolution;
    }
  }
  return null;
}

function solve(restrictions, sudoku) {
  for (let i=0; i<MAX_MOVES; ++i) {
    let newSolution = getNewSolution(sudoku, restrictions);
    if (newSolution == null) {
      return null;
    }

    if (newSolution.length === 81) {
      return newSolution;
    }

    let solution = solve(restrictions, newSolution);
    if (solution != null) {
      return solution;
    }
  }
  return null;
}

function sudokuRestriction(sudoku) {
  const positions = {};
  const rows = new Set();
  const columns = new Set();
  const boxes = new Set();

  for (const move of sudoku) {
    const key = move.slice(0, 2).toString();
    if (key in positions) {
      return false;
    }

    const value = move[2];

    const row = move[1];
    const rowKey = [row, value].toString();
    if (rows.has(rowKey)) {
      return false;
    }
    rows.add(rowKey);

    const column = move[0];
    const columnKey = [column, value].toString();
    if (columns.has(columnKey)) {
      return false;
    }
    columns.add(columnKey);

    const box = Math.floor(column/3) + 3*(Math.floor(row/3));
    const boxKey = [box, value].toString();
    if (boxes.has(boxKey)) {
      return false;
    }
    boxes.add(boxKey);
  }
  if (sudoku.length > 53) {
    console.log("Got valid", sudoku, positions, rows, columns, boxes);
  }
  return true;
}
