// const {allNumbers, allPossible} = require('./possible');

// import {allPossible} from "./possible";
// allPossible = require('./possible');

import {allPossible} from './possible';

test('all possible has the right number', () => {
  expect(allPossible.length === 81);
});
