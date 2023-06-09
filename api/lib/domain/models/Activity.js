const levels = {
  TUTORIAL: 'TUTORIAL',
  TRAINING: 'TRAINING',
  VALIDATION: 'VALIDATION',
  CHALLENGE: 'CHALLENGE',
};

class Activity {
  constructor({ id, assessmentId, createdAt, level } = {}) {
    this.id = id;
    this.assessmentId = assessmentId;
    this.createdAt = createdAt;
    this.level = level;
  }
}

Activity.levels = levels;

export { Activity };
