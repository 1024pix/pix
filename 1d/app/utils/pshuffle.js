/**
 * Pseudo randomly shuffle arr based on seed (same seed gives same order).
 * @param {any[]} array
 * @param {int} seed (optional) used as based of shuffle, must be between 0 and 1
 */

const SEED_OFFSET = 7;
export function pshuffle(array, seed = Math.random() * 10000) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = _randomIndexFrom0ToI(i, seed);
    _permuteJValueToIValue(array, i, j);
  }
}

function _randomIndexFrom0ToI(i, seed) {
  return (_ensureSeedCanShuffle(seed) * (i + 1)) % i;
}

function _ensureSeedCanShuffle(seed) {
  let newSeed = Math.floor(Math.abs(seed));
  if (newSeed <= 1) {
    newSeed += SEED_OFFSET;
  }
  return newSeed;
}

function _permuteJValueToIValue(array, i, j) {
  [array[i], array[j]] = [array[j], array[i]];
}
