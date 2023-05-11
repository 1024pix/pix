const hashInt = require('hash-int');

function generateInt(min, max, seed) {
  const newSeed = hashInt(seed);
  return {
    value: min + (newSeed % (max - min)),
    seed: newSeed,
  };
}

/**
 *
 * @param probability integer with the percent of chance of choosing left element
 * @param length
 * @param seed
 */
function binaryTreeRandom(probability, length, seed) {
  if (length === 1) {
    return {
      value: 0,
      seed,
    };
  }

  const { value: randomValue, seed: newSeed } = generateInt(0, 100, seed);

  if (randomValue < probability) {
    return {
      value: 0,
      seed: newSeed,
    };
  }

  const { value, seed: finalSeed } = binaryTreeRandom(probability, length - 1, newSeed);

  return {
    value: value + 1,
    seed: finalSeed,
  };
}

module.exports = {
  binaryTreeRandom,
};
