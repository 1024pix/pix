import { Frameworks } from '../../../shared/domain/models/Frameworks.js';
import {
  AUTHORIZED_TO_START_DURATION_VALIDITY_IN_MS,
  MAXIMAL_CERTIFICATION_DURATION_IN_MS,
  MAXIMAL_SESSION_DURATION_IN_MS,
} from '../constants.js';

export class CandidateAuthorizationInfo {
  constructor({
    id,
    sessionId,
    sessionAccessCode,
    sessionFinalizedAt,
    sessionStartedAt,
    reconciledUserId,
    reconciledAt,
    subscription,
    authorizedToStartAt,
    certificationId,
    certificationStartedAt,
    centerHabilitations = {},
  }) {
    this.id = id;
    this.sessionId = sessionId;
    this.sessionAccessCode = sessionAccessCode;
    this.sessionFinalizedAt = sessionFinalizedAt;
    this.reconciledUserId = reconciledUserId;
    this.reconciledAt = reconciledAt;
    this.subscription = subscription;
    this.authorizedToStartAt = authorizedToStartAt;
    this.certificationId = certificationId;
    this.certificationStartedAt = certificationStartedAt;
    this.sessionIsOvertime = sessionStartedAt
      ? computeElapsedTime(sessionStartedAt) > MAXIMAL_SESSION_DURATION_IN_MS
      : false;
    this.centerHabilitations = {};
    for (const framework of Object.values(Frameworks)) {
      this.centerHabilitations[framework] =
        framework === Frameworks.CORE ? true : (centerHabilitations[framework] ?? false);
    }
  }

  get isSessionAccessible() {
    return !this.sessionFinalizedAt && !this.sessionIsOvertime;
  }

  get hasExceededCertificationDuration() {
    if (this.certificationId) {
      return this.#elapsedTimeSinceCertificationStarted() > MAXIMAL_CERTIFICATION_DURATION_IN_MS;
    }
    return false;
  }

  get isCenterHabilitatedForCandidateSubscription() {
    return this.centerHabilitations[this.subscription];
  }

  get authorizedToStart() {
    if (this.authorizedToStartAt) {
      return this.#elapsedTimeSinceInvigilatorAuthorizedToStart() < AUTHORIZED_TO_START_DURATION_VALIDITY_IN_MS;
    }
    return false;
  }

  #elapsedTimeSinceInvigilatorAuthorizedToStart() {
    return Date.now() - this.authorizedToStartAt.getTime();
  }

  #elapsedTimeSinceCertificationStarted() {
    return computeElapsedTime(this.certificationStartedAt);
  }
}

function computeElapsedTime(from) {
  return Date.now() - new Date(from).getTime();
}
