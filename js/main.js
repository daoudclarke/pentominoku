
const MAX_MOVES = 10;

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
  let newSolution = getNewSolution(sudoku, restrictions);

  if (newSolution.length === 81) {
    return newSolution;
  }

  return solve(restrictions, newSolution);
}
