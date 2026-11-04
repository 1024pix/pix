export class SessionAuthorizationInfo {
  constructor({
    id,
    invigilatorPassword,
    certificationCenterId,
    scoIsManagingStudentsOrganizationId,
    certificationCenterArchived,
    sessionStatus,
  }) {
    this.id = id;
    this.certificationCenterId = certificationCenterId;
    this.invigilatorPassword = invigilatorPassword;
    this.scoIsManagingStudentsOrganizationId = scoIsManagingStudentsOrganizationId;
    this.certificationCenterArchived = certificationCenterArchived;
    this.sessionStatus = sessionStatus;
  }

  get canJoin() {
    return !this.certificationCenterArchived && this.sessionStatus.isAtMostStarted();
  }

  isPasswordValid(password) {
    return this.invigilatorPassword === password;
  }
}
