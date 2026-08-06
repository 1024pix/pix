export class CertificationCourseInfo {
  constructor({ id, nbChallenges, firstName, lastName, version, isAdjustedForAccessibility, assessmentId }) {
    this.id = id;
    this.nbChallenges = nbChallenges;
    this.firstName = firstName;
    this.lastName = lastName;
    this.version = version;
    this.isAdjustedForAccessibility = isAdjustedForAccessibility;
    this.assessmentId = assessmentId;
  }
}
