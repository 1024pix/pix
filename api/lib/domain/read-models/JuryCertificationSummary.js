const { status: assessmentResultStatuses } = require('../models/AssessmentResult');

const VALIDATED = assessmentResultStatuses.VALIDATED;
const REJECTED = assessmentResultStatuses.REJECTED;
const STARTED = 'started';

const statuses = {
  VALIDATED,
  REJECTED,
  STARTED,
};

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
    if (![statuses.VALIDATED, statuses.REJECTED].includes(this.status)) {
      this.status = statuses.STARTED;
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
module.exports.statuses = statuses;
