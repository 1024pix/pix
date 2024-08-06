/**
 * Asynchronously maps over an array of values with a concurrency limit.
 *
 * @param {Array} array - The array of values to be mapped.
 * @param {Function} mapper - A function that takes a value and its index, and returns a promise or value.
 * @param {Object} [options] - Optional configuration object.
 * @param {number} [options.concurrency=Infinity] - The maximum number of concurrent promises created by the mapper function.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of mapped results.
 *
 */
function map(array, mapper, { concurrency = Infinity } = {}) {
  let index = 0;
  let concurrentPromises = 0;

  const results = new Array(array.length);

  return new Promise((resolve, reject) => {
    const next = () => {
      if (index >= array.length) {
        if (concurrentPromises === 0) resolve(results);
        return;
      }

      const currentIndex = index++;

      concurrentPromises++;
      Promise.resolve(mapper(array[currentIndex], currentIndex)).then(
        (result) => {
          results[currentIndex] = result;
          concurrentPromises--;
          next();
        },
        (err) => reject(err),
      );

      if (concurrentPromises < concurrency) next();
    };

    next();
  });
}

export const PromiseUtils = { map };
