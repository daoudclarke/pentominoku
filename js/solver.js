import {allPossible, binaryToArray, getFixedPoints, printPossible, singlePossibilities} from "./possible";
import {boxRestriction, columnRestriction, rowRestriction} from "./restrictions";

let nearlySolved = new Set();

for (let i=0; i<9; ++i) {
  for (let j=0; j<9; ++j) {
    for (let k=0; k<9; ++k) {
      const value = (1 << i) | (1 << j) | (1 << k);
      nearlySolved.add(value);
    }
  }
}
console.log("Nearly solved", nearlySolved);


export const MAX_DEPTH = 1;

function applyRestrictions(restrictions, possible) {
  for (const restriction of restrictions) {
    const restrictionPossible = restriction(possible);
    for (let i = 0; i < possible.length; ++i) {
      possible[i] &= restrictionPossible[i];
    }
  }
}


function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}


export function getPossible(restrictions, solution) {
  const possible = allPossible.slice();

  for (const [i, decimal] of solution) {
    possible[i] = 1 << (decimal - 1);
  }

  return getPossibleInternal(restrictions, possible, possible.slice(), MAX_DEPTH)
}

function getPossibleInternal(restrictions, possible, previousPossible, maxDepth) {
  while (true) {
    while (true) {
      const oldPossible = possible.slice();
      applyRestrictions(restrictions, possible);
      if (arraysEqual(oldPossible, possible)) {
        break;
      }
    }

    if (maxDepth === MAX_DEPTH) {
      console.log("After restriction");
      printPossible(possible);
    }

    if (maxDepth === 0 || Math.min(...possible) === 0) {
      return possible;
    }

    const restriction = searchRestriction(restrictions, possible, previousPossible, maxDepth);
    if (restriction == null) {
      break;
    }
    if (maxDepth === MAX_DEPTH) {
      console.log("Found search restriction", maxDepth, restriction);
    }
    const [i, decimal] = restriction;
    const binary = 1 << (decimal - 1);
    possible[i] &= ~binary;
    if (singlePossibilities.has(possible[i])) {
      const possibility = singlePossibilities.get(possible[i]);
      if (maxDepth === MAX_DEPTH) {
        console.log("Found single possibility", maxDepth, i, possibility);
      }
    }
  }

  return possible;
}

function searchRestriction(restrictions, possible, previousPossible, maxDepth) {
  console.log("Search restriction", maxDepth);
  for (let i = 0; i < possible.length; ++i) {
    let decimals = binaryToArray(possible[i]);
    for (const decimal of decimals) {
      const possibleCopy = possible.slice();
      possibleCopy[i] = 1 << (decimal - 1);
      const newPossible = getPossibleInternal(restrictions, possibleCopy, previousPossible, maxDepth - 1);
      const minimumValue = Math.min(...newPossible);
      if (minimumValue === 0) {
        return [i, decimal];
      }
    }
  }
  return null;
}

export function test() {
    let restrictions = [rowRestriction, columnRestriction, boxRestriction];
    // let fixedPoints = [[33,5]];
    let fixedPoints = [[0, 5], [1, 3], [4, 7],
        [9, 6], [12, 1], [13, 9], [14, 5],
        [19, 9], [20, 8], [25, 6],
        [27, 8], [31, 6], [35, 3],
        [36, 4], [39, 8], [41, 3], [44, 1],
        [45, 7], [49, 2], [53, 6],
        [55, 6], [60, 2], [61, 8],
        [66, 4], [67, 1], [68, 9], [71, 5],
        [76, 8], [79, 7], [80, 9]
    ]
    let possible = getPossible(restrictions, fixedPoints, allPossible.slice(), MAX_DEPTH);
    printPossible(possible);
}

