
const MAX_MOVES = 3;

function randomNumber() {
  return Math.ceil(Math.random() * 9);
}

function randomMove() {
  return [randomNumber(), randomNumber(), randomNumber()]
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
    const newSolution = sudoku.concat([randomMove()]);
    if (!isValid(restrictions, newSolution)) {
      continue;
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

function sudokuRestrictions() {
  return [sudokuRestriction(getPositionKey), sudokuRestriction(getRowKey),
    sudokuRestriction(getColumnKey), sudokuRestriction(getBoxKey)];
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

    console.log("Keys", keys, sudoku);
    return true;
  }

  return restriction;
}
