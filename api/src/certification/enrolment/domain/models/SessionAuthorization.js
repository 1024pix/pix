export class SessionAuthorization {
  constructor({ id, sessionStatus, certificationCenterId, scoIsManagingStudentsOrganizationId }) {
    this.id = id;
    this.sessionStatus = sessionStatus;
    this.scoIsManagingStudentsOrganizationId = scoIsManagingStudentsOrganizationId;
    this.certificationCenterId = certificationCenterId;
  }

  get canEnrollCandidateIndividually() {
    return this.sessionStatus.isAtMostStarted();
  }

  get canEnrollScoCandidate() {
    return this.sessionStatus.isAtMostStarted();
  }

  get canEnrollCandidateViaODS() {
    return this.sessionStatus.isCreated();
  }

  get canEnrollCandidateViaMassImport() {
    return this.sessionStatus.isCreated();
  }

  get canJoinSession() {
    return this.sessionStatus.isAtMostStarted();
  }
}
