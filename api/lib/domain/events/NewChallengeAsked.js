module.exports = class NewChallengeAsked {
  constructor({ assessmentId, challengeId, currentChallengeId }) {
    this.assessmentId = assessmentId;
    this.currentChallengeId = currentChallengeId;
    this.challengeId = challengeId;
  }
};
