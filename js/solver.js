import {allNumbers, allPossible} from "./possible";
import {
  boxRestriction,
  columnRestriction,
  kingsMoveRestriction,
  knightsMoveRestriction,
  orthogonalConsecutiveRestriction,
  rowRestriction
} from "./restrictions";

export let singlePossibilities = new Map();

singlePossibilities.set(1, 1);
singlePossibilities.set(2, 2);
singlePossibilities.set(4, 3);
singlePossibilities.set(8, 4);
singlePossibilities.set(16, 5);
singlePossibilities.set(32, 6);
singlePossibilities.set(64, 7);
singlePossibilities.set(128, 8);
singlePossibilities.set(256, 9);

export let nearlySolved = new Set();

for (let i=0; i<9; ++i) {
  for (let j=0; j<9; ++j) {
    for (let k=0; k<9; ++k) {
      const value = (1 << i) | (1 << j) | (1 << k);
      nearlySolved.add(value);
    }
  }
}
console.log("Nearly solved", nearlySolved);


export function binaryToArray(binary) {
    const result = [];
    for (let i = 0; i < 9; ++i) {
        if ((binary & 1) === 1) {
            result.push(i + 1);
        }
        binary = binary >> 1;
    }
    return result;
}

export const MAX_DEPTH = 2;

function applyRestrictions(restrictions, solution, possible) {
    for (const restriction of restrictions) {
        const restrictionPossible = restriction(solution);
        for (let i = 0; i < possible.length; ++i) {
            possible[i] &= restrictionPossible[i];
        }
    }
}

export function getPossible(restrictions, solution, previousPossible, maxDepth) {
    const possible = allPossible.slice();
    applyRestrictions(restrictions, solution, possible);
    if (maxDepth === MAX_DEPTH) {
        console.log("After initial restriction");
        printPossible(possible);
    }

    if (maxDepth === 0) {
        return possible;
    }

    const newSolution = solution.slice();
    while (true) {
        const restriction = searchRestriction(restrictions, newSolution, possible, previousPossible, maxDepth);
        if (restriction == null) {
            break;
        }
        if (maxDepth === MAX_DEPTH) {
            console.log("Found restriction", maxDepth, restriction);
        }
        const [i, decimal] = restriction;
        possible[i] &= ~(1 << (decimal - 1));
        if (singlePossibilities.has(possible[i])) {
            const possibility = singlePossibilities.get(possible[i]);
            if (maxDepth === MAX_DEPTH) {
                console.log("Found single possibility", maxDepth, i, possibility);
            }
            newSolution.push([i, possibility]);
            applyRestrictions(restrictions, newSolution, possible);
        }
    }

    return possible;
}

function searchRestriction(restrictions, solution, possible, previousPossible, maxDepth) {
    for (let i = 0; i < possible.length; ++i) {
        if (nearlySolved.has(possible[i]) && previousPossible[i] !== possible[i]) {
            let decimals = binaryToArray(possible[i]);
            for (const decimal of decimals) {
                const newSolution = solution.slice();
                // console.log("Searching with additional possibility", maxDepth, i, decimal)
                newSolution.push([i, decimal]);
                const newPossible = getPossible(restrictions, newSolution, possible, maxDepth - 1);
                const minimumValue = Math.min(...newPossible);
                if (minimumValue === 0) {
                    // We can rule out this decimal from the actual solution
                    return [i, decimal];
                }
            }
        }
    }
    // console.log("Found no restriction", maxDepth);
    return null;
}

export function testKnightsMove() {
    let restrictions = [knightsMoveRestriction];
    let fixedPoints = [[0, 1], [33, 5]];
    let possible = getPossible(restrictions, fixedPoints);
    printPossible(possible);
}

export function testKingsMove() {
    let restrictions = [kingsMoveRestriction];
    let fixedPoints = [[0, 1], [33, 5]];
    let possible = getPossible(restrictions, fixedPoints);
    printPossible(possible);
}

export function testOrthogonalConsecutive() {
    let restrictions = [orthogonalConsecutiveRestriction];
    let fixedPoints = [[0, 1], [33, 5]];
    let possible = getPossible(restrictions, fixedPoints);
    printPossible(possible);
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

function testMiracle() {
    const restrictions = [rowRestriction, columnRestriction, boxRestriction, knightsMoveRestriction,
        kingsMoveRestriction, orthogonalConsecutiveRestriction];
    const fixedPoints = [[38, 1], [51, 2]];
    let possible = getPossible(restrictions, fixedPoints, allPossible.slice(), MAX_DEPTH);
    printPossible(possible);
}

function printPossible(possible) {
  console.log("Possible");
    // for (let i = 0; i < 81; i += 9) {
  console.log(possible.map(x => binaryToArray(allNumbers - x).toString()));
    // }
}
