export const allNumbers = 511;
export let allPossible = [];

for (let i=0; i<81; ++i) {
  allPossible.push(allNumbers);
}

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

export function getDisplay(possible) {
  const slices = [];
  for (let i = 0; i < 81; i += 9) {
    slices.push(possible.slice(i, i + 9).map(x => binaryToArray(x).join('').padStart(9, ' ')).join(' '));
  }
  return slices.join('\n');
}

export function printPossible(possible) {
  console.log("Possible");
  let possibleString = getDisplay(possible);
  console.log(possibleString);
}

export function getFixedPoints(currentPossible) {
  const fixedPoints = [];
  for (let i = 0; i < currentPossible.length; ++i) {
    if (singlePossibilities.has(currentPossible[i])) {
      fixedPoints.push([i, singlePossibilities.get(currentPossible[i])])
    }
  }
  // console.log("Fixed points", fixedPoints);
  return fixedPoints;
}
