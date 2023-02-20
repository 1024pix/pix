import { expect } from '../../../test-helper';
import CertificationChallenge from '../../../../lib/domain/models/CertificationChallenge';

describe('Unit | Domain | Models | CertificationChallenge', function () {
  describe('#static createForPixCertification', function () {
    it('should build a certificationChallenge for pix certification', function () {
      // given
      const associatedSkillName = '@faireDesOrigamis1';
      const associatedSkillId = 'recOrigami1';
      const challengeId = 'recChallABC';
      const competenceId = 'recCompDEF';

      // when
      const certificationChallenge = CertificationChallenge.createForPixCertification({
        associatedSkillName,
        associatedSkillId,
        challengeId,
        competenceId,
      });

      // then
      const expectedCertificationChallenge = new CertificationChallenge({
        id: undefined,
        courseId: undefined,
        associatedSkillName,
        associatedSkillId,
        challengeId,
        competenceId,
        isNeutralized: false,
        certifiableBadgeKey: null,
      });
      expect(certificationChallenge).to.deep.equal(expectedCertificationChallenge);
    });
  });

  describe('#static createForPixPlusCertification', function () {
    it('should build a certificationChallenge for pix certification', function () {
      // given
      const associatedSkillName = '@faireDesOrigamis1';
      const associatedSkillId = 'recOrigami1';
      const challengeId = 'recChallABC';
      const competenceId = 'recCompDEF';
      const certifiableBadgeKey = 'BADGE_MANGUE';

      // when
      const certificationChallenge = CertificationChallenge.createForPixPlusCertification({
        associatedSkillName,
        associatedSkillId,
        challengeId,
        competenceId,
        certifiableBadgeKey,
      });

      // then
      const expectedCertificationChallenge = new CertificationChallenge({
        id: undefined,
        courseId: undefined,
        associatedSkillName,
        associatedSkillId,
        challengeId,
        competenceId,
        isNeutralized: false,
        certifiableBadgeKey,
      });
      expect(certificationChallenge).to.deep.equal(expectedCertificationChallenge);
    });
  });
});
