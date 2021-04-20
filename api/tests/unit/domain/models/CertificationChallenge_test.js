const { expect, domainBuilder } = require('../../../test-helper');
const CertificationChallenge = require('../../../../lib/domain/models/CertificationChallenge');

describe('Unit | Domain | Models | CertificationChallenge', () => {

  describe('#neutralize', () => {

    it('should neutralize a non neutralized certification challenge', () => {
      // given
      const certificationChallenge = domainBuilder.buildCertificationChallenge({ isNeutralized: false });

      // when
      certificationChallenge.neutralize();

      // then
      expect(certificationChallenge.isNeutralized).to.be.true;
    });

    it('should leave a neutralized certification challenge if it was neutralized already', () => {
      // given
      const certificationChallenge = domainBuilder.buildCertificationChallenge({ isNeutralized: true });

      // when
      certificationChallenge.neutralize();

      // then
      expect(certificationChallenge.isNeutralized).to.be.true;
    });
  });

  describe('#static createForPixCertification', () => {

    it('should build a certificationChallenge for pix certification', () => {
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

  describe('#static createForPixPlusCertification', () => {

    it('should build a certificationChallenge for pix certification', () => {
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
