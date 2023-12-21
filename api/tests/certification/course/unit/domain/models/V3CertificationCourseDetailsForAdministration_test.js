import { expect, domainBuilder } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | V3CertificationCourseDetailsForAdministration', function () {
  describe('setCompetencesDetails', function () {
    it('should set the competence name and ids', function () {
      const certificationCourseId = 123;
      const competenceId = 'competenceID';
      const competenceName = 'competenceName';
      const competenceIndex = '1.2';

      const competenceList = [
        domainBuilder.buildCompetence({
          id: competenceId,
          name: competenceName,
          index: competenceIndex,
        }),
        domainBuilder.buildCompetence({
          id: 'other',
          name: 'otherName',
          index: 'otherIndex',
        }),
      ];

      const challenge = domainBuilder.buildV3CertificationChallengeForAdministration({
        competenceId,
      });

      const courseDetails = domainBuilder.buildV3CertificationCourseDetailsForAdministration({
        certificationCourseId,
        certificationChallengesForAdministration: [challenge],
      });

      courseDetails.setCompetencesDetails(competenceList);

      expect(courseDetails.certificationChallengesForAdministration[0]).to.deep.equal(
        domainBuilder.buildV3CertificationChallengeForAdministration({
          competenceId,
          competenceName,
          competenceIndex,
        }),
      );
    });
  });
});
