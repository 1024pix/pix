module.exports = class NewChallengeAsked {
  constructor({ assessmentId, challengeId, currentQuestionState }) {
    this.assessmentId = assessmentId;
    this.challengeId = challengeId;
    this.currentQuestionState = currentQuestionState;
  }
};
