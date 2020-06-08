
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

function isValid(restrictions, newSolution) {
  for (const restriction of restrictions) {
    if (!restriction(newSolution)) {
      return false;
    }
  }
  return true;
}

function solve(restrictions, sudoku) {
  for (let i=0; i<MAX_MOVES; ++i) {
    const newSolution = sudoku.concat([randomMove(sudoku)]);
    if (!isValid(restrictions, newSolution)) {
      continue;
    }

    console.log("New solution", newSolution);
    if (newSolution.length > 53) {
      console.log("Solution", newSolution);
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

function getPositionKey(move) {
  return move.slice(0, 2).toString();
}

function getRowKey(move) {
  return [move[1], move[2]].toString();
}

function getColumnKey(move) {
  return [move[0], move[2]].toString();
}

function getBoxKey(move) {
  const box = Math.floor(move[0] / 3) + 3 * (Math.floor(move[1] / 3));
  return [box, move[2]].toString();
}

function sudokuRestriction(keyFunction) {
  function restriction(sudoku) {
    const keys = new Set();

    for (const move of sudoku) {
      const key = keyFunction(move);
      if (keys.has(key)) {
        return false;
      }
      keys.add(key);
    }

    return true;
  }

  return restriction;
}

const positionRestriction = sudokuRestriction(getPositionKey);
const rowRestriction = sudokuRestriction(getRowKey);
const columnRestriction = sudokuRestriction(getColumnKey)
const boxRestriction = sudokuRestriction(getBoxKey)

function sudokuRestrictions() {
  return [positionRestriction, rowRestriction, columnRestriction, boxRestriction];
}
