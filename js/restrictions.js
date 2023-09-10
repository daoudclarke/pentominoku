import {allNumbers, allPossible, binaryToArray, getFixedPoints} from "./possible";


export function atMostRestriction(neighbours) {
  function restriction(currentPossible) {
    const possible = currentPossible.slice();
    for (let i=0; i<possible.length; ++i) {
      const value = possible[i];
      const requiredCount = binaryToArray(value).length;
      // console.log("RequiredCount", requiredCount, "value", value);

      if (requiredCount > 4) {
        continue;
      }

      const keep = [];
      if (requiredCount > 1) {
        for (const neighbour of neighbours[i]) {
          const neighbourValue = possible[neighbour];
          // console.log("Neighbour value", neighbourValue);
          if ((neighbourValue | value) === value) {
            keep.push(neighbour);
            if (keep.length === requiredCount - 1) {
              break;
            }
          }
        }
      }

      if (keep.length === requiredCount - 1) {
        const keepSet = new Set(keep);
        for (const neighbour of neighbours[i]) {
          if (keepSet.has(neighbour)) {
            continue;
          }

          possible[neighbour] &= ~value;
        }
      }
    }

    return possible;
  }

  return restriction;
}

function atLeastRestriction(neighbours) {
  function restriction(currentPossible) {
    const possible = currentPossible.slice();
    for (let i=0; i<possible.length; ++i) {
      let otherValues = 0;
      for (const neighbour of neighbours[i]) {
          otherValues |= possible[neighbour];
      }

      if ((possible[i] & ~otherValues) !== 0) {
        possible[i] &= ~otherValues;
      }

      if ((possible[i] | otherValues) !== allNumbers) {
        possible[i] = 0;
      }
    }
    return possible;
  }

  return restriction;
}

function rowNeighbours() {
  const neighbours = [];
  for (let i=0; i<81; ++i) {
    const iNeighbours = [];
    const row = Math.floor(i / 9);
    for (let j = row * 9; j < (row + 1) * 9; ++j) {
      if (j !== i) {
        iNeighbours.push(j);
      }
    }
    neighbours.push(iNeighbours);
  }
  return neighbours;
}

function combinedRestriction(restrictions) {
  function combined(possible) {
    for (const restriction of restrictions) {
      possible = restriction(possible);
    }
    return possible;
  }
  return combined;
}

const rowNeighbourValues = rowNeighbours();
export const rowRestriction = combinedRestriction(
  [atLeastRestriction(rowNeighbourValues), atMostRestriction(rowNeighbourValues)])

function columnNeighbours() {
  const neighbours = [];
  for (let i=0; i<81; ++i) {
    const iNeighbours = [];
    const column = i % 9;
    for (let j = column; j < 81; j += 9) {
      if (j !== i) {
        iNeighbours.push(j);
      }
    }
    neighbours.push(iNeighbours);
  }
  return neighbours;
}

const columnNeighbourValues = columnNeighbours();
export const columnRestriction = combinedRestriction(
  [atLeastRestriction(columnNeighbourValues), atMostRestriction(columnNeighbourValues)])


export function getColumnRow(i) {
    const column = i % 9;
    const row = (i - column) / 9;
    return [column, row];
}

function boxNeighbours() {
  const neighbours = [];
  for (let i=0; i<81; ++i) {
    const iNeighbours = [];
    const [column, row] = getColumnRow(i);
    const firstRow = row - (row % 3);
    const firstColumn = column - (column % 3);
    for (let k = firstRow; k < firstRow + 3; ++k) {
      for (let l = firstColumn; l < firstColumn + 3; ++l) {
        const j = k * 9 + l;
        if (j !== i) {
          iNeighbours.push(j);
        }
      }
    }
    neighbours.push(iNeighbours);
  }
  return neighbours;
}

export const boxNeighbourValues = boxNeighbours();
export const boxRestriction = combinedRestriction(
  [atLeastRestriction(boxNeighbourValues), atMostRestriction(boxNeighbourValues)]
)

export function knightsMoveRestriction(currentPossible) {
  const fixedPoints = getFixedPoints(currentPossible);
    const possible = allPossible.slice();
    const knightsDifferences = [-11, -19, -17, -7, 11, 19, 17, 7]
    for (const [i, value] of fixedPoints) {
        const [iColumn, iRow] = getColumnRow(i);
        const notValue = ~(1 << (value - 1));
        for (const difference of knightsDifferences) {
            const j = i + difference;
            const [jColumn, jRow] = getColumnRow(j);
            if (j >= 0 && j < 81 && Math.max(Math.abs(jColumn - iColumn), Math.abs(jRow - iRow)) <= 2) {
                possible[j] &= notValue;
            }
        }
    }
    return possible;
}

export function kingsMoveRestriction(currentPossible) {
  const fixedPoints = getFixedPoints(currentPossible);
    const possible = allPossible.slice();
    const knightsDifferences = [-10, -9, -8, -1, 1, 8, 9, 10];
    for (const [i, value] of fixedPoints) {
        const [iColumn, iRow] = getColumnRow(i);
        const notValue = ~(1 << (value - 1));
        for (const difference of knightsDifferences) {
            const j = i + difference;
            const [jColumn, jRow] = getColumnRow(j);
            if (j >= 0 && j < 81 && Math.max(Math.abs(jColumn - iColumn), Math.abs(jRow - iRow)) <= 1) {
                possible[j] &= notValue;
            }
        }
    }
    return possible;
}

export function orthogonalConsecutiveRestriction(currentPossible) {
  const fixedPoints = getFixedPoints(currentPossible);
    const possible = allPossible.slice();
    const consecutiveDifferences = [-9, -1, 1, 9];
    for (const [i, value] of fixedPoints) {
        const [iColumn, iRow] = getColumnRow(i);

        let notValue = allNumbers;
        if (value > 1) {
            notValue &= ~(1 << (value - 2));
        }
        if (value < 8) {
            notValue &= ~(1 << value);
        }

        for (const difference of consecutiveDifferences) {
            const j = i + difference;
            const [jColumn, jRow] = getColumnRow(j);
            if (j >= 0 && j < 81 && Math.max(Math.abs(jColumn - iColumn), Math.abs(jRow - iRow)) <= 1) {
                possible[j] &= notValue;
            }
        }
    }
    return possible;
}

function getThermoMinBinaryValues() {
  const values = [];

  let restriction = 0;
  for (let i=0; i<9; ++i) {
    restriction += 1 << i;
    values.push(allNumbers & ~restriction);
  }
  return values;
}

const thermoMinBinaryValues = getThermoMinBinaryValues();

function getThermoMaxBinaryValues() {
  const values = [];

  let restriction = 0;
  for (let i=8; i>=0; --i) {
    restriction += 1 << i;
    values.push(allNumbers & ~restriction);
  }
  return values.reverse();
}

const thermoMaxBinaryValues = getThermoMaxBinaryValues();

export class ThermoRestriction {
  constructor(cells) {
    this.cells = cells;
  }

  restrict(currentPossible) {
    const possible = currentPossible.slice();
    for (let i=1; i<this.cells.length; ++i) {
      const lastValueBinary = possible[this.cells[i-1]];
      const lastValues = binaryToArray(lastValueBinary);
      const minLastValue = Math.min(...lastValues);
      const currentRestrictionBinary = thermoMinBinaryValues[minLastValue - 1];
      possible[this.cells[i]] &= currentRestrictionBinary;
    }
    for (let i=this.cells.length - 2; i>=0; --i) {
      const lastValueBinary = possible[this.cells[i+1]];
      const lastValues = binaryToArray(lastValueBinary);
      const maxLastValue = Math.max(...lastValues);
      const currentRestrictionBinary = thermoMaxBinaryValues[maxLastValue - 1];
      possible[this.cells[i]] &= currentRestrictionBinary;
    }
    return possible;
  }
}

export class PrimeNumberRestriction {
  constructor(pairs) {
    this.pairs = pairs;

    const primeNumbers = new Set([2, 3, 5, 7, 11, 13, 17]);
    this.allowedValues = [];
    for (let i=1; i<=9; ++i) {
      let allowedValues = 0;
      for (let j=1; j<=9; ++j) {
        if (primeNumbers.has(i + j)) {
          allowedValues |= 1 << (j - 1);
        }
      }
      this.allowedValues.push(allowedValues);
    }
    console.log("Prime pairs", this.allowedValues);
  }

  restrict(currentPossible) {
    const possible = currentPossible.slice();

    for (const [first, second] of this.pairs) {
      this.restrictPrimes(first, second, possible);
      this.restrictPrimes(second, first, possible);
    }

    return possible;
  }

  restrictPrimes(first, second, possible) {
    const firstPossible = binaryToArray(possible[first]);
    let secondAllowed = 0;
    for (const firstValue of firstPossible) {
      secondAllowed |= this.allowedValues[firstValue - 1];
    }
    possible[second] &= secondAllowed;
  }
}
