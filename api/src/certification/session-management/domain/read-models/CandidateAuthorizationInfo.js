import { Frameworks } from '../../../shared/domain/models/Frameworks.js';
const MAXIMAL_CERTIFICATION_DURATION_IN_MS = 24 * 60 * 60 * 1000; // 24h

export class CandidateAuthorizationInfo {
  constructor({
    id,
    sessionId,
    sessionAccessCode,
    sessionFinalizedAt,
    sessionPublishedAt,
    reconciledUserId,
    reconciledAt,
    subscription,
    authorizedToStart,
    certificationId,
    certificationStartedAt,
    centerHabilitations = {},
  }) {
    this.id = id;
    this.sessionId = sessionId;
    this.sessionAccessCode = sessionAccessCode;
    this.sessionFinalizedAt = sessionFinalizedAt;
    this.sessionPublishedAt = sessionPublishedAt;
    this.reconciledUserId = reconciledUserId;
    this.reconciledAt = reconciledAt;
    this.subscription = subscription;
    this.authorizedToStart = authorizedToStart;
    this.certificationId = certificationId;
    this.certificationStartedAt = certificationStartedAt;
    this.centerHabilitations = {};
    for (const framework of Object.values(Frameworks)) {
      this.centerHabilitations[framework] =
        framework === Frameworks.CORE ? true : (centerHabilitations[framework] ?? false);
    }
  }

  get isSessionAccessible() {
    return !this.sessionFinalizedAt && !this.sessionPublishedAt;
  }

  get hasExceededCertificationDuration() {
    if (this.certificationId) {
      return Date.now() - this.certificationStartedAt.getTime() > MAXIMAL_CERTIFICATION_DURATION_IN_MS;
    }
    return false;
  }

  get isCenterHabilitatedForCandidateSubscription() {
    return this.centerHabilitations[this.subscription];
  }
}
