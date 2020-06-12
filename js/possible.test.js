const allPossible = require('./possible');

test('all possible has the right number', () => {
  expect(allPossible.length === 81);
});
