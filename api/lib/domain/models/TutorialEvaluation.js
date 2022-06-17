const status = {
  LIKED: 'LIKED',
  NEUTRAL: 'NEUTRAL',
};

class TutorialEvaluation {
  constructor({ id, userId, tutorialId, status } = {}) {
    this.id = id;
    this.userId = userId;
    this.tutorialId = tutorialId;
    this.status = status;
  }
}

TutorialEvaluation.status = status;

module.exports = TutorialEvaluation;
