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

export function printPossible(possible) {
  console.log("Possible");
  const slices = [];
  for (let i = 0; i < 81; i += 9) {
    slices.push(possible.slice(i, i + 9).map(x => binaryToArray(x).join('').padStart(9, ' ')).join(' '));
  }
  console.log(slices.join('\n'));
}
