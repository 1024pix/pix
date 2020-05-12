const { expect } = require('../../../test-helper');
const CertificationChallenge = require('../../../../lib/domain/models/CertificationChallenge');
const certificationChallengesService = require('../../../../lib/domain/services/certification-challenges-service');

describe('Unit | Service | Certification Challenge Service', () => {

  describe('#generateCertificationChallenges', () => {

    const certificationCourseId = 'certification-course-id';
    const challenge1 = {
      id: 'challengeId11',
      competenceId: 'competenceId1',
      testedSkill: { id: 'skill1Id', name: 'skill1Name' },
    };
    const certificationChallenge1 = new CertificationChallenge({
      challengeId: challenge1.id,
      competenceId: challenge1.competenceId,
      associatedSkillName: challenge1.testedSkill.name,
      associatedSkillId: challenge1.testedSkill.id,
      courseId: certificationCourseId,
    });
    const challenge2 = {
      id: 'challengeId2',
      competence: 'competenceId2',
      testedSkill: { id: 'skill2Id', name: 'skill2Name' },
    };
    const certificationChallenge2 = new CertificationChallenge({
      challengeId: challenge2.id,
      competenceId: challenge2.competenceId,
      associatedSkillName: challenge2.testedSkill.name,
      associatedSkillId: challenge2.testedSkill.id,
      courseId: certificationCourseId,
    });

    const certificationProfileWithTwoCompetence = [
      {
        challenges: [challenge1]
      }, {
        challenges: [challenge2]
      }
    ];

    it('should return certification challenges objects generated from the provided userCompetences and certificationCourseId', async () => {
      // when
      const actualCertificationChallenges = await certificationChallengesService.generateCertificationChallenges(certificationProfileWithTwoCompetence, certificationCourseId);

      // then
      expect(actualCertificationChallenges).to.have.deep.members([ certificationChallenge1, certificationChallenge2 ]);
    });
  });
});
