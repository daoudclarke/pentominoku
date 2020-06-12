import {allNumbers, allPossible} from "./possible";

export function rowRestriction(fixedPoints) {
    const possible = allPossible.slice();
    for (const [i, value] of fixedPoints) {
        const row = Math.floor(i / 9);
        let valueBinary = 1 << (value - 1);
        const notValue = allNumbers - valueBinary;
        for (let j = row * 9; j < (row + 1) * 9; ++j) {
            if (j === i) {
                possible[j] = valueBinary;
            } else {
                possible[j] &= notValue;
            }
        }
    }
    return possible;
}

export function columnRestriction(fixedPoints) {
    const possible = allPossible.slice();
    for (const [i, value] of fixedPoints) {
        const column = i % 9;
        let valueBinary = 1 << (value - 1);
        const notValue = allNumbers - valueBinary;
        for (let j = column; j < 81; j += 9) {
            if (j === i) {
                possible[j] = valueBinary;
            } else {
                possible[j] &= notValue;
            }
        }
    }
    return possible;
}

function getColumnRow(i) {
    const column = i % 9;
    const row = (i - column) / 9;
    return [column, row];
}

export function boxRestriction(fixedPoints) {
    const possible = allPossible.slice();
    for (const [i, value] of fixedPoints) {
        const [column, row] = getColumnRow(i);
        const firstRow = row - (row % 3);
        const firstColumn = column - (column % 3);
        // console.log("First row column", row, column, firstRow, firstColumn);
        let valueBinary = 1 << (value - 1);
        const notValue = allNumbers - valueBinary;
        for (let k = firstRow; k < firstRow + 3; ++k) {
            for (let l = firstColumn; l < firstColumn + 3; ++l) {
                const j = k * 9 + l;
                if (j === i) {
                    possible[j] = valueBinary;
                } else {
                    possible[j] &= notValue;
                }
            }
        }
    }
    return possible;
}

export function knightsMoveRestriction(fixedPoints) {
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

export function kingsMoveRestriction(fixedPoints) {
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

export function orthogonalConsecutiveRestriction(fixedPoints) {
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
