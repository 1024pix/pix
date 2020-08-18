const { status: assessmentResultStatuses } = require('../models/AssessmentResult');

const STARTED = 'started';

class JuryCertificationSummary {
  constructor({
    id,
    firstName,
    lastName,
    status,
    pixScore,
    createdAt,
    completedAt,
    isPublished,
    examinerComment,
    hasSeenEndTestScreen,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.status = status;
    if (!Object.values(assessmentResultStatuses).includes(this.status)) {
      this.status = STARTED;
    }
    this.pixScore = pixScore;
    this.createdAt = createdAt;
    this.completedAt = completedAt;
    this.isPublished = isPublished;
    this.examinerComment = examinerComment;
    this.hasSeenEndTestScreen = hasSeenEndTestScreen;
  }
}

module.exports = JuryCertificationSummary;
module.exports.statuses = { ...assessmentResultStatuses, STARTED };
