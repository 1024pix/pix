
export default {

  progress(nbAnswers, nbChallenges) {
    const maxStep = nbChallenges;
    const currentStep = this._getCurrentStep(nbAnswers, nbChallenges);
    const stepPercentage = currentStep / maxStep * 100;

    return { currentStep, maxStep, stepPercentage };
  },

  answersSinceLastCheckpoints() {
    throw new Error('This is an Assessment without checkpoints !');
  },

  _getCurrentStep(answersCount = 0, maxStep) {
    const step = answersCount + 1;

    if (maxStep == null) {
      return step;
    } else {
      return Math.min(step, maxStep);
    }
  }
};
