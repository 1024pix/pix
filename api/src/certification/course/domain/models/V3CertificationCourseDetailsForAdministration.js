export class V3CertificationCourseDetailsForAdministration {
  constructor({ certificationCourseId, certificationChallengesForAdministration = [] }) {
    this.certificationCourseId = certificationCourseId;
    this.certificationChallengesForAdministration = certificationChallengesForAdministration;
  }

  setCompetencesDetails(competenceList) {
    this.certificationChallengesForAdministration.forEach((challenge) => {
      challenge.setCompetenceDetails(competenceList);
    });
  }
}
