/**
 * Pseudo randomly shuffle arr based on seed (same seed gives same order).
 * @param {any[]} arr
 * @param {number} seed
 */
export function pshuffle(arr, seed) {
  let m = arr.length;
  const random = makeRandom(seed);

  // While there remain elements to shuffle...
  while (m) {
    // Pick a remaining element...
    const i = random() % m--;

    // And swap it with the current element.
    const t = arr[m];
    arr[m] = arr[i];
    arr[i] = t;
  }
}

/**
 * Basic and fast pseudo random number generator.
 * @param {number} seed
 * @returns A function returning pseudo-random numbers between 1 and 2^32 - 2.
 */
function makeRandom(seed) {
  seed %= 2147483647;
  if (seed <= 0) seed += 2147483646;
  const next = () => {
    seed = (seed * 48271) % 2147483647;
    return seed;
  };
  next();
  return next;
}
