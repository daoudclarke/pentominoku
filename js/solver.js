import {allPossible, binaryToArray, getFixedPoints, printPossible, singlePossibilities} from "./possible";
import {boxRestriction, columnRestriction, rowRestriction} from "./restrictions";

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export class Solver {
  constructor(restrictions, maxDepth = 1) {
    this.restrictions = restrictions;
    this.maxDepth = maxDepth;

    this.nearlySolved = new Set();
    for (let i=0; i<9; ++i) {
      for (let j=0; j<9; ++j) {
        for (let k=0; k<9; ++k) {
          const value = (1 << i) | (1 << j) | (1 << k);
          this.nearlySolved.add(value);
        }
      }
    }
    console.log("Nearly solved", this.nearlySolved);
  }

  applyRestrictions(possible) {
    for (const restriction of this.restrictions) {
      const restrictionPossible = restriction(possible);
      for (let i = 0; i < possible.length; ++i) {
        possible[i] &= restrictionPossible[i];
      }
    }
  }

  getPossible(solution) {
    const possible = allPossible.slice();

    for (const [i, decimal] of solution) {
      possible[i] = 1 << (decimal - 1);
    }

    return this.getPossibleInternal(possible, possible.slice(), this.maxDepth);
  }

  getPossibleInternal(possible, previousPossible, maxDepth) {
    while (true) {
      while (true) {
        const oldPossible = possible.slice();
        this.applyRestrictions(possible);
        if (arraysEqual(oldPossible, possible)) {
          break;
        }
      }

      if (maxDepth === this.maxDepth) {
        console.log("After restriction");
        printPossible(possible);
      }

      if (maxDepth === 0 || Math.min(...possible) === 0) {
        return possible;
      }

      const restriction = this.searchRestriction(possible, previousPossible, maxDepth);
      if (restriction == null) {
        break;
      }
      if (maxDepth === this.maxDepth) {
        console.log("Found search restriction", maxDepth, restriction);
      }
      const [i, decimal] = restriction;
      const binary = 1 << (decimal - 1);
      possible[i] &= ~binary;
      if (singlePossibilities.has(possible[i])) {
        const possibility = singlePossibilities.get(possible[i]);
        if (maxDepth === this.maxDepth) {
          console.log("Found single possibility", maxDepth, i, possibility);
        }
      }
    }

    return possible;
  }

  searchRestriction(possible, previousPossible, maxDepth) {
    console.log("Search restriction", maxDepth);
    for (let i = 0; i < possible.length; ++i) {
      let decimals = binaryToArray(possible[i]);
      for (const decimal of decimals) {
        const possibleCopy = possible.slice();
        possibleCopy[i] = 1 << (decimal - 1);
        const newPossible = this.getPossibleInternal(possibleCopy, previousPossible, maxDepth - 1);
        const minimumValue = Math.min(...newPossible);
        if (minimumValue === 0) {
          return [i, decimal];
        }
      }
    }
    return null;
  }

}
