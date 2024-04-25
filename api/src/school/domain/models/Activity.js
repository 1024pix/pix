/**
 * Activity levels
 * @readonly
 * @enum {string}
 */
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

const END_OF_STEP = Symbol('END_OF_STEP');

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

  get isDare() {
    return this.level === levels.CHALLENGE;
  }

  get isValidation() {
    return this.level === levels.VALIDATION;
  }

  get isTraining() {
    return this.level === levels.TRAINING;
  }

  get isSucceeded() {
    return this.status === status.SUCCEEDED;
  }

  get isFailed() {
    return this.status === status.FAILED;
  }

  get isSkipped() {
    return this.status === status.SKIPPED;
  }

  get isFailedOrSkipped() {
    return this.isFailed || this.isSkipped;
  }

  /**
   * Returns higher order level of activity level
   * @returns ({levels | END_OF_STEP})
   */
  get higherLevel() {
    if (this.isValidation) return END_OF_STEP;
    if (this.isTraining) return levels.VALIDATION;
    return levels.TRAINING;
  }

  isLevel(level) {
    return this.level === level;
  }
}

Activity.levels = levels;
Activity.status = status;
Activity.END_OF_STEP = END_OF_STEP;

export { Activity };
