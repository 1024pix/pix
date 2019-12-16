/* Use https://github.com/mikolalysenko/hash-int/ for hashInt */
function hashInt(key) {
  const A = [0];
  A[0]  = key | 0;
  A[0] -= (A[0] << 6);
  A[0] ^= (A[0] >>> 17);
  A[0] -= (A[0] << 9);
  A[0] ^= (A[0] << 4);
  A[0] -= (A[0] << 3);
  A[0] ^= (A[0] << 10);
  A[0] ^= (A[0] >>> 15);
  return Math.abs(A[0]);
}

module.exports = {
  hashInt
};
