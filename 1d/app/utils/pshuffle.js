/**
 * Pseudo randomly shuffle arr based on seed (same seed gives same order).
 * @param {any[]} array
 * @param {int} seed (optional) used as based of shuffle, must be between 0 and 1
 */
export function pshuffle(array, seed = Math.random()) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = _randomIndexFrom0ToI(i, seed);
    _permuteJValueToIValue(array, i, j);
  }
}

function _randomIndexFrom0ToI(i, seed) {
  return Math.floor(_ensureSeedIsBetween0And1(seed) * (i + 1));
}

function _permuteJValueToIValue(array, i, j) {
  [array[i], array[j]] = [array[j], array[i]];
}

function _ensureSeedIsBetween0And1(seed) {
  if (seed === 0) {
    return 1;
  }
  if (seed > 1 || seed < 0) {
    return Number.parseFloat('0.' + Math.abs(seed).toString());
  }
  return seed;
}
