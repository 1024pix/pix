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

const binaryTreeRandom = (probability, length) => {
  if (length === 1) {
    return 0;
  }

  const randomValue = Math.random() * 100;

  if (randomValue < probability) {
    return 0;
  }

  return 1 + binaryTreeRandom(probability, length - 1);
};

export const random = { weightedRandoms, binaryTreeRandom };
