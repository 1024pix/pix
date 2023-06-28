const weightedRandom = (values) => {
  let probabilitiesSum = 0;
  const randomFloat = Math.random();
  for (const key in values) {
    probabilitiesSum += values[key];
    const shouldSelectCurrentKey = probabilitiesSum > randomFloat;
    if (shouldSelectCurrentKey) {
      return key;
    }
  }
};

const weightedRandoms = (values, length) => [...new Array(length)].map(() => weightedRandom(values));

export const random = { weightedRandoms };
