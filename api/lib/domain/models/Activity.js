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

const orderedActivityLevels = [levels.TUTORIAL, levels.TRAINING, levels.VALIDATION, levels.CHALLENGE];

class Activity {
  constructor({ id, assessmentId, createdAt, level, status, alternativeVersion } = {}) {
    this.id = id;
    this.assessmentId = assessmentId;
    this.createdAt = createdAt;
    this.level = level;
    this.status = status;
    this.alternativeVersion = alternativeVersion;
  }
}

Activity.levels = levels;
Activity.status = status;
Activity.orderedActivityLevels = orderedActivityLevels;

export { Activity };
