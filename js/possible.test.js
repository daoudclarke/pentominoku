import {allPossible} from './possible';
import {expect} from "@jest/globals";

test('all possible has the right number', () => {
  expect(allPossible.length === 81);
});
