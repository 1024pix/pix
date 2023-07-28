/**
 * Pseudo randomly shuffle arr based on seed (same seed gives same order).
 * @param {any[]} arr
 */
export function pshuffle(arr) {
  let m = arr.length;
  const random = Math.floor(Math.random() * 100000);

  // While there remain elements to shuffle...
  while (m) {
    // Pick a remaining element...
    const i = random % m--;

    // And swap it with the current element.
    const t = arr[m];
    arr[m] = arr[i];
    arr[i] = t;
  }
}
