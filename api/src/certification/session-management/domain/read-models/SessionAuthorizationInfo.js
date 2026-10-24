export class SessionAuthorizationInfo {
  constructor({ id, certificationCenterId, scoIsManagingStudentsOrganizationId, sessionStatus }) {
    this.id = id;
    this.certificationCenterId = certificationCenterId;
    this.scoIsManagingStudentsOrganizationId = scoIsManagingStudentsOrganizationId;
    this.sessionStatus = sessionStatus;
  }
}
