module.exports = class EmailingAttempt {
  static errorCode = {
    PROVIDER_ERROR: 'PROVIDER_ERROR',
    INVALID_DOMAIN: 'INVALID_DOMAIN',
  };

  constructor(email, status, errorCode) {
    this.email = email;
    this.status = status;
    this.errorCode = errorCode;
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

  static failure(email, errorCode = EmailingAttempt.errorCode.PROVIDER_ERROR) {
    return new EmailingAttempt(email, AttemptStatus.FAILURE, errorCode);
  }
};

const AttemptStatus = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
};
