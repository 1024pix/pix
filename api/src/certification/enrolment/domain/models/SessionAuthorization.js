export class SessionAuthorization {
  constructor({
    id,
    sessionStatus,
    certificationCenterId,
    scoIsManagingStudentsOrganizationId,
    certificationCenterArchived,
  }) {
    this.id = id;
    this.sessionStatus = sessionStatus;
    this.scoIsManagingStudentsOrganizationId = scoIsManagingStudentsOrganizationId;
    this.certificationCenterId = certificationCenterId;
    this.certificationCenterArchived = certificationCenterArchived;
  }

  get canEnrollCandidateIndividually() {
    return !this.certificationCenterArchived && this.sessionStatus.isAtMostStarted();
  }

  get canEnrollScoCandidate() {
    return !this.certificationCenterArchived && this.sessionStatus.isAtMostStarted();
  }

  get canEnrollCandidateViaODS() {
    return !this.certificationCenterArchived && this.sessionStatus.isCreated();
  }

  get canEnrollCandidateViaMassImport() {
    return !this.certificationCenterArchived && this.sessionStatus.isCreated();
  }

  get canJoinSession() {
    return !this.certificationCenterArchived && this.sessionStatus.isAtMostStarted();
  }
}
