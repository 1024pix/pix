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

export const random = { binaryTreeRandom };
