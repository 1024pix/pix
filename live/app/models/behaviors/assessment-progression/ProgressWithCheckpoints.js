
import ENV from 'pix-live/config/environment';

const CHECKPOINTS_MAX_STEP = ENV.APP.NUMBER_OF_CHALLENGE_BETWEEN_TWO_CHECKPOINTS_IN_SMART_PLACEMENT;

export default {
  progress(nbAnswers, nbChallenges) {
    const maxStep = CHECKPOINTS_MAX_STEP;
    const currentStep = this._getCurrentStep(nbAnswers, nbChallenges);
    const stepPercentage = currentStep / maxStep * 100;

    return { currentStep, maxStep, stepPercentage };
  },

  answersSinceLastCheckpoints(answers) {
    const howManyAnswersSinceTheLastCheckpoint = this._howManyAnswersSinceTheLastCheckpoint(answers.length);
    const sliceAnswersFrom = (howManyAnswersSinceTheLastCheckpoint === 0)
      ? -CHECKPOINTS_MAX_STEP
      : -howManyAnswersSinceTheLastCheckpoint;

    return answers.slice(sliceAnswersFrom);
  },

  _getCurrentStep(answersCount = 0, _maxStep) {
    return 1 + this._howManyAnswersSinceTheLastCheckpoint(answersCount);
  },

  _howManyAnswersSinceTheLastCheckpoint(nbAnswers) {
    return nbAnswers % CHECKPOINTS_MAX_STEP;
  },
};
