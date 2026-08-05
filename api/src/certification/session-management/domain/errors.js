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

class SendingEmailToRefererError extends DomainError {
  constructor(failedEmailReferers) {
    super(
      `Échec lors de l'envoi du mail au(x) référent(s) du centre de certification : ${failedEmailReferers.join(', ')}`,
    );
  }
}

class CertificationCourseNotPublishableError extends DomainError {
  constructor(
    sessionId,
    message = `Publication de la session ${sessionId}: Une Certification avec le statut 'started' ou 'error' ne peut être publiée.`,
  ) {
    super(message);
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

class SessionNotJoinable extends DomainError {
  constructor(blockedAccessDate) {
    super('Certification session is not joinable', 'SESSION_NOT_JOINABLE');
    if (blockedAccessDate) {
      this.meta = { blockedAccessDate };
    }
  }
}

class SessionFinalized extends DomainError {
  constructor() {
    super('Certification session is finalized', 'SESSION_FINALIZED');
  }
}

class CertificationIssueReportAutomaticallyResolvedShouldNotBeUpdatedManually extends DomainError {
  constructor(message = 'Le signalement ne peut pas être modifié manuellement') {
    super(message);
  }
}

class SendingEmailToResultRecipientError extends DomainError {
  constructor(failedEmailsRecipients) {
    super(`Échec lors de l'envoi des résultats au(x) destinataire(s) : ${failedEmailsRecipients.join(', ')}`);
  }
}

class CertificationCenterIsArchivedError extends DomainError {
  constructor(message = 'Ce centre de certification est archivé.') {
    super(message);
    this.code = 'CERTIFICATION_CENTER_IS_ARCHIVED';
  }
}

export {
  CertificationCenterIsArchivedError,
  CertificationCourseNotPublishableError,
  CertificationIssueReportAutomaticallyResolvedShouldNotBeUpdatedManually,
  ChallengeToBeDeneutralizedNotFoundError,
  ChallengeToBeNeutralizedNotFoundError,
  InvalidSessionSupervisingLoginError,
  SendingEmailToRefererError,
  SendingEmailToResultRecipientError,
  SessionAlreadyFinalizedError,
  SessionAlreadyPublishedError,
  SessionFinalized,
  SessionNotJoinable,
  SessionWithMissingAbortReasonError,
  SessionWithoutStartedCertificationError,
};
