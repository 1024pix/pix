function pickAnswersFromArray(array) {
  return function ({ answerIndex }) {
    return array[answerIndex];
  };
}

export const pickAnswersService = {
  pickAnswersFromArray,
};
