module.exports = class EmailingAttempt {
  constructor(email, status) {
    this.email = email;
    this.status = status;
  }

  hasFailed() {
    return this.status === AttemptStatus.FAILURE;
  }

  hasSucceeded() {
    return this.status === AttemptStatus.SUCCESS;
  }

  static success(email) {
    return new EmailingAttempt(email, AttemptStatus.SUCCESS);
  }

  static failure(email) {
    return new EmailingAttempt(email, AttemptStatus.FAILURE);
  }
};

const AttemptStatus = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
};
