export class V3CertificationCourseDetailsForAdministration {
  constructor({ certificationCourseId, certificationChallengesForAdministration = [] }) {
    this.certificationCourseId = certificationCourseId;
    this.certificationChallengesForAdministration = certificationChallengesForAdministration;
  }
}
