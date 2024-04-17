const levels = {
  TUTORIAL: 'TUTORIAL',
  TRAINING: 'TRAINING',
  VALIDATION: 'VALIDATION',
  CHALLENGE: 'CHALLENGE',
};
const status = {
  STARTED: 'STARTED',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  SKIPPED: 'SKIPPED',
};

class Activity {
  constructor({ id, assessmentId, createdAt, level, status, alternativeVersion, stepIndex } = {}) {
    this.id = id;
    this.assessmentId = assessmentId;
    this.createdAt = createdAt;
    this.level = level;
    this.status = status;
    this.stepIndex = stepIndex;
    this.alternativeVersion = alternativeVersion;
  }
}

Activity.levels = levels;
Activity.status = status;

export { Activity };
