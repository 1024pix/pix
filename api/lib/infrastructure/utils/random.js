const randomInEnum = (values) => {
  let probabilitiesSum = 0;
  const randomFloat = Math.random();
  for (const key in values) {
    if (probabilitiesSum + values[key] > randomFloat) {
      return key;
    }
    probabilitiesSum += values[key];
  }
};

const randomsInEnum = (values, length) => [...new Array(length)].map(() => randomInEnum(values));

export const random = { randomsInEnum };
