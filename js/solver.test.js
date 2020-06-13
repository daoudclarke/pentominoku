import {boxRestriction, columnRestriction, rowRestriction} from "./restrictions";
import {allNumbers, allPossible} from "./possible";
import {expect} from "@jest/globals";
import {binaryToArray, getPossible, MAX_DEPTH} from "./solver";


test('simple sudoku can be solved', () => {
  let restrictions = [rowRestriction, columnRestriction, boxRestriction];
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
  const possibleArray = possible.map(x => binaryToArray(x).toString())
  const expected = [
    "5", "3", "4", "6", "7", "8", "9", "1", "2",
    "6", "7", "2", "1", "9", "5", "3", "4", "8",
    "1", "9", "8", "3", "4", "2", "5", "6", "7",
    "8", "5", "9", "7", "6", "1", "4", "2", "3",
    "4", "2", "6", "8", "5", "3", "7", "9", "1",
    "7", "1", "3", "9", "2", "4", "8", "5", "6",
    "9", "6", "1", "5", "3", "7", "2", "8", "4",
    "2", "8", "7", "4", "1", "9", "6", "3", "5",
    "3", "4", "5", "2", "8", "6", "1", "7", "9"
  ]
  expect(possibleArray).toEqual(expected);
});

test('row restriction works', () => {
  let restrictions = [rowRestriction];
  let fixedPoints = [[4, 5], [0, 3]];

  let possible = getPossible(restrictions, fixedPoints, allPossible.slice(), MAX_DEPTH);
  const possibleArray = possible.map(x => binaryToArray(allNumbers - x).toString())

  const expected = [
    "1,2,4,5,6,7,8,9", "3,5", "3,5", "3,5", "1,2,3,4,6,7,8,9", "3,5", "3,5", "3,5", "3,5",
    "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", ""
  ]

  expect(possibleArray).toEqual(expected);
})
