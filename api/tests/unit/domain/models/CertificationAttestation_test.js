const { expect, domainBuilder } = require('../../../test-helper');
const {
  PIX_EMPLOI_CLEA,
  PIX_EMPLOI_CLEA_V2,
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
} = require('../../../../lib/domain/models/Badge').keys;

describe('Unit | Domain | Models | CertificationAttestation', function () {
  context('#setResultCompetenceTree', function () {
    it('should set the resultCompetenceTree on CertificationAttestation model', function () {
      // given
      const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({ id: 'someId' });
      const certificationAttestation = domainBuilder.buildCertificationAttestation();

      // when
      certificationAttestation.setResultCompetenceTree(resultCompetenceTree);

      // expect
      expect(certificationAttestation.resultCompetenceTree).to.deep.equal(resultCompetenceTree);
    });
  });

  context('#getAcquiredCleaCertification', function () {
    it('should return the acquired PIX_EMPLOI_CLEA badge', function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        acquiredComplementaryCertifications: [{ partnerKey: 'OTHER_BADGE' }, { partnerKey: PIX_EMPLOI_CLEA }],
      });

      // when
      const acquiredCleaCertification = certificationAttestation.getAcquiredCleaCertification();

      // expect
      expect(acquiredCleaCertification).to.deep.equal(PIX_EMPLOI_CLEA);
    });

    it('should return the acquired PIX_EMPLOI_CLEA_V2 badge', function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        acquiredComplementaryCertifications: [{ partnerKey: 'OTHER_BADGE' }, { partnerKey: PIX_EMPLOI_CLEA_V2 }],
      });

      // when
      const acquiredCleaCertification = certificationAttestation.getAcquiredCleaCertification();

      // expect
      expect(acquiredCleaCertification).to.deep.equal(PIX_EMPLOI_CLEA_V2);
    });

    it('should return undefined if no clea badge has been acquired', function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        acquiredComplementaryCertifications: [{ partnerKey: 'OTHER_BADGE_1' }, { partnerKey: 'OTHER_BADGE_2' }],
      });

      // when
      const acquiredCleaCertification = certificationAttestation.getAcquiredCleaCertification();

      // expect
      expect(acquiredCleaCertification).to.be.undefined;
    });
  });

  context('#getAcquiredPixPlusDroitCertification', function () {
    it('should return the acquired PIX_DROIT_MAITRE_CERTIF badge', function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        acquiredComplementaryCertifications: [{ partnerKey: 'OTHER_BADGE' }, { partnerKey: PIX_DROIT_MAITRE_CERTIF }],
      });

      // when
      const acquiredPixPlusDroitCertification = certificationAttestation.getAcquiredPixPlusDroitCertification();

      // expect
      expect(acquiredPixPlusDroitCertification).to.deep.equal(PIX_DROIT_MAITRE_CERTIF);
    });

    it('should return the acquired PIX_DROIT_EXPERT_CERTIF badge', function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        acquiredComplementaryCertifications: [{ partnerKey: 'OTHER_BADGE' }, { partnerKey: PIX_DROIT_EXPERT_CERTIF }],
      });

      // when
      const acquiredPixPlusDroitCertification = certificationAttestation.getAcquiredPixPlusDroitCertification();

      // expect
      expect(acquiredPixPlusDroitCertification).to.deep.equal(PIX_DROIT_EXPERT_CERTIF);
    });

    it('should return undefined if no Pix+ Droit badge has been acquired', function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        acquiredComplementaryCertifications: [{ partnerKey: 'OTHER_BADGE_1' }, { partnerKey: 'OTHER_BADGE_2' }],
      });

      // when
      const acquiredPixPlusDroitCertification = certificationAttestation.getAcquiredPixPlusDroitCertification();

      // expect
      expect(acquiredPixPlusDroitCertification).to.be.undefined;
    });
  });

  context('#getAcquiredPixPlusEduCertification', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
      PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
    ].forEach((badgeKey) => {
      it(`should return the acquired ${badgeKey} badge`, function () {
        // given
        const certificationAttestation = domainBuilder.buildCertificationAttestation({
          acquiredComplementaryCertifications: [{ partnerKey: 'OTHER_BADGE' }, { temporaryPartnerKey: badgeKey }],
        });

        // when
        const acquiredPixPlusEduCertification = certificationAttestation.getAcquiredPixPlusEduCertification();

        // expect
        expect(acquiredPixPlusEduCertification).to.deep.equal({ temporaryPartnerKey: badgeKey });
      });
    });

    it('should return undefined if no Pix+ Edu badge has been acquired', function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        acquiredComplementaryCertifications: ['OTHER_BADGE_1', 'OTHER_BADGE_2'],
      });

      // when
      const acquiredPixPlusEduCertification = certificationAttestation.getAcquiredPixPlusEduCertification();

      // expect
      expect(acquiredPixPlusEduCertification).to.be.undefined;
    });
  });

  context('#getPixPlusEduBadgeDisplayName', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        badgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
        expectedDisplayName: 'Initié (entrée dans le métier)',
      },
      { badgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME, expectedDisplayName: 'Confirmé' },
      { badgeKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME, expectedDisplayName: 'Confirmé' },
      { badgeKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE, expectedDisplayName: 'Avancé' },
      { badgeKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT, expectedDisplayName: 'Expert' },
    ].forEach(({ badgeKey, expectedDisplayName }) => {
      it(`should return ${expectedDisplayName} for badge key ${badgeKey}`, function () {
        // given
        const certificationAttestation = domainBuilder.buildCertificationAttestation({
          acquiredComplementaryCertifications: [{ partnerKey: badgeKey }],
        });

        // when
        const result = certificationAttestation.getPixPlusEduBadgeDisplayName();

        // then
        expect(result).to.equal(expectedDisplayName);
      });
    });
  });

  context('#hasAcquiredAnyComplementaryCertifications', function () {
    it('should return true if certified badge images for attestation is not empty', function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        acquiredComplementaryCertifications: [PIX_EMPLOI_CLEA],
      });

      // when
      const hasAcquiredAnyComplementaryCertifications =
        certificationAttestation.hasAcquiredAnyComplementaryCertifications();

      // expect
      expect(hasAcquiredAnyComplementaryCertifications).to.be.true;
    });

    it('should return false if certified badge images for attestation is empty', function () {
      // given
      const certificationAttestation = domainBuilder.buildCertificationAttestation({
        acquiredComplementaryCertifications: [],
      });

      // when
      const hasAcquiredAnyComplementaryCertifications =
        certificationAttestation.hasAcquiredAnyComplementaryCertifications();

      // expect
      expect(hasAcquiredAnyComplementaryCertifications).to.be.false;
    });
  });
});
