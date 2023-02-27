module.exports = class EmailingAttempt {
  static errorCode = {
    PROVIDER_ERROR: 'PROVIDER_ERROR',
    INVALID_DOMAIN: 'INVALID_DOMAIN',
    INVALID_EMAIL: 'INVALID_EMAIL',
  };

  constructor(email, status, errorCode, errorMessage) {
    this.email = email;
    this.status = status;
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
  }

  hasFailed() {
    return this.status === AttemptStatus.FAILURE;
  }

  hasFailedBecauseDomainWasInvalid() {
    return this.status === AttemptStatus.FAILURE && this.errorCode === EmailingAttempt.errorCode.INVALID_DOMAIN;
  }

  hasFailedBecauseEmailWasInvalid() {
    return this.status === AttemptStatus.FAILURE && this.errorCode === EmailingAttempt.errorCode.INVALID_EMAIL;
  }

  hasSucceeded() {
    return this.status === AttemptStatus.SUCCESS;
  }

  static success(email) {
    return new EmailingAttempt(email, AttemptStatus.SUCCESS);
  }

  static failure(email, errorCode = EmailingAttempt.errorCode.PROVIDER_ERROR, errorMessage) {
    return new EmailingAttempt(email, AttemptStatus.FAILURE, errorCode, errorMessage);
  }
};

const AttemptStatus = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
};
