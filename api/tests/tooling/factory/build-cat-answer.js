const buildCatChallenge = require('./build-cat-challenge');
const CatAnswer = require('../../../lib/cat/answer');

module.exports = function buildCatAnswer({
  challenge = buildCatChallenge(),
  result = 'ok',
} = {}) {
  return new CatAnswer(challenge, result);
};
