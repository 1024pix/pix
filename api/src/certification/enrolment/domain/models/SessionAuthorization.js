export class SessionAuthorization {
  constructor({ id, isFinalized, hasExpired, hasStarted, scoIsManagingStudentsOrganizationId }) {
    this.id = id;
    this.isFinalized = isFinalized;
    this.hasExpired = hasExpired;
    this.hasStarted = hasStarted;
    this.scoIsManagingStudentsOrganizationId = scoIsManagingStudentsOrganizationId;
  }

  get canEnrollCandidateIndividually() {
    return !this.isFinalized && !this.hasExpired;
  }

  get canEnrollScoCandidate() {
    return !this.isFinalized && !this.hasExpired;
  }

  get canEnrollCandidateViaODS() {
    return !this.hasStarted;
  }

  get canEnrollCandidateViaMassImport() {
    return !this.hasStarted;
  }
}
