const statuses = {
  LIKED: 'LIKED',
  NEUTRAL: 'NEUTRAL',
};

class TutorialEvaluation {
  constructor({ id, userId, tutorialId, status, updatedAt } = {}) {
    this.id = id;
    this.userId = userId;
    this.tutorialId = tutorialId;
    this.status = status;
    this.updatedAt = updatedAt;
  }
}

TutorialEvaluation.statuses = statuses;

export default TutorialEvaluation;
