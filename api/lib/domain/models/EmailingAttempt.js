module.exports = class EmailingAttempt {
  constructor(recipientEmail, status) {
    this.recipientEmail = recipientEmail;
    this.status = status;
  }

  hasFailed() {
    return this.status === AttemptStatus.FAILURE;
  }

  hasSucceeded() {
    return this.status === AttemptStatus.SUCCESS;
  }

  static success(recipientEmail) {
    return new EmailingAttempt(recipientEmail, AttemptStatus.SUCCESS);
  }

  static failure(recipientEmail) {
    return new EmailingAttempt(recipientEmail, AttemptStatus.FAILURE);
  }
};

const AttemptStatus = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
};
