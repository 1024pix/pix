function pickAnswersFromArray(array) {
  return function ({ answerIndex }) {
    return array[answerIndex];
  };
}

function pickAnswerForCapacity(capacity) {
  return function ({ nextChallenge }) {
    const successProbability = 1 / (1 + Math.exp(-nextChallenge.discriminant * (capacity - nextChallenge.difficulty)));
    return successProbability > Math.random() ? 'ok' : 'ko';
  };
}

export const pickAnswersService = {
  pickAnswersFromArray,
  pickAnswerForCapacity,
};
