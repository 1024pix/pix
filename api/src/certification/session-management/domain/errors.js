import { DomainError } from '../../../shared/domain/errors.js';
import { SESSION_SUPERVISING } from './constants.js';

class SessionAlreadyFinalizedError extends DomainError {
  constructor(message = 'Cannot finalize session more than once.') {
    super(message);
    this.code = 'SESSION_ALREADY_FINALIZED';
  }
}

class SessionAlreadyPublishedError extends DomainError {
  constructor(message = 'La session est déjà publiée.') {
    super(message);
  }
}

class SessionWithoutStartedCertificationError extends DomainError {
  constructor(message = "This session hasn't started, you can't finalise it. However, you can delete it.") {
    super(message);
    this.code = 'SESSION_WITHOUT_STARTED_CERTIFICATION';
  }
}

class SessionWithAbortReasonOnCompletedCertificationCourseError extends DomainError {
  constructor(
    message = 'The field "Reason for abandonment" has been filled in for a candidate who has finished their certification exam in between. The session therefore can\'t be finalised. Please refresh the page before finalising.',
  ) {
    super(message);
    this.code = 'SESSION_WITH_ABORT_REASON_ON_COMPLETED_CERTIFICATION_COURSE';
  }
}

class SessionWithMissingAbortReasonError extends DomainError {
  constructor(
    message = "Une ou plusieurs certifications non terminées n'ont pas de “Raison de l’abandon” renseignées. La session ne peut donc pas être finalisée.",
  ) {
    super(message);
    this.code = 'UNTERMINATED_CERTIFICATION_WITHOUT_ABORT_REASON';
  }
}

class CsvWithNoSessionDataError extends DomainError {
  constructor(message = 'No session data in csv') {
    super(message);
    this.code = 'CSV_DATA_REQUIRED';
  }
}

class ChallengeToBeNeutralizedNotFoundError extends DomainError {
  constructor() {
    super("La question à neutraliser n'a pas été posée lors du test de certification");
  }
}

class ChallengeToBeDeneutralizedNotFoundError extends DomainError {
  constructor() {
    super("La question à dé-neutraliser n'a pas été posée lors du test de certification");
  }
}

class InvalidSessionSupervisingLoginError extends DomainError {
  constructor(message = SESSION_SUPERVISING.INCORRECT_DATA.getMessage()) {
    super(message);
    this.code = SESSION_SUPERVISING.INCORRECT_DATA.code;
  }
}

class SessionNotAccessible extends DomainError {
  constructor(message = "La session de certification n'est plus accessible.") {
    super(message);
  }
}

export {
  ChallengeToBeDeneutralizedNotFoundError,
  ChallengeToBeNeutralizedNotFoundError,
  CsvWithNoSessionDataError,
  InvalidSessionSupervisingLoginError,
  SessionAlreadyFinalizedError,
  SessionAlreadyPublishedError,
  SessionNotAccessible,
  SessionWithAbortReasonOnCompletedCertificationCourseError,
  SessionWithMissingAbortReasonError,
  SessionWithoutStartedCertificationError,
};
