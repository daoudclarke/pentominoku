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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
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

  addRestriction(restriction) {
    this.restrictions.push(restriction);
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

    return this.getPossibleInternal(possible, this.maxDepth);
  }

  getPossibleInternal(possible, maxDepth) {
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

      const restriction = this.searchRestriction(possible, maxDepth);
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

  searchRestriction(possible, maxDepth) {
    console.log("Search restriction", maxDepth);
    const allDecimals = possible.map((x, i) => ({index: i, decimals: binaryToArray(x)}));

    let searchDecimals = allDecimals.filter(x => x.decimals.length > 1);
    shuffleArray(searchDecimals);
    // searchDecimals.sort((a, b) => a.decimals.length - b.decimals.length);
    // searchDecimals = searchDecimals.slice(0, );

    // const decimalArray = [].concat(...allDecimals.map(x => x.decimals));
    // const decimalCounts = {};
    // decimalArray.forEach((x) => decimalCounts[x] = (decimalCounts[x] || 0) + 1);
    // console.log("Decimal counts", decimalCounts);

    console.log("Sorted decimals", searchDecimals);
    for (const item of searchDecimals) {
      for (const decimal of item.decimals) {
        const possibleCopy = possible.slice();
        possibleCopy[item.index] = 1 << (decimal - 1);
        const newPossible = this.getPossibleInternal(possibleCopy, maxDepth - 1);
        const minimumValue = Math.min(...newPossible);
        if (minimumValue === 0) {
          return [item.index, decimal];
        }
      }
    }


    return null;
  }

}
