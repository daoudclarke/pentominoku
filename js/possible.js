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
