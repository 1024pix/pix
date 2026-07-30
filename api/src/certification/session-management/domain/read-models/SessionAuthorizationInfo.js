import { MAXIMAL_SESSION_DURATION_IN_MS } from '../constants.js';

export class SessionAuthorizationInfo {
  constructor({
    id,
    finalizedAt,
    firstCertificationStartedAt,
    certificationCenterId,
    scoIsManagingStudentsOrganizationId,
  }) {
    this.id = id;
    this.finalizedAt = finalizedAt;
    this.firstCertificationStartedAt = firstCertificationStartedAt;
    this.certificationCenterId = certificationCenterId;
    this.scoIsManagingStudentsOrganizationId = scoIsManagingStudentsOrganizationId;
  }

  get hasExpired() {
    const hasACertificationOnGoing = Boolean(this.firstCertificationStartedAt);
    if (hasACertificationOnGoing) {
      return this.#elapsedTimeSinceSessionStarted() > MAXIMAL_SESSION_DURATION_IN_MS;
    }
    return false;
  }

  get hasStarted() {
    return Boolean(this.firstCertificationStartedAt);
  }

  get isFinalized() {
    return Boolean(this.finalizedAt);
  }

  #elapsedTimeSinceSessionStarted() {
    return Date.now() - this.firstCertificationStartedAt.getTime();
  }
}
