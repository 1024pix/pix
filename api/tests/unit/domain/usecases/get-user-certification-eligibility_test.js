const { sinon, expect, domainBuilder } = require('../../../test-helper');
const getUserCertificationEligibility = require('../../../../lib/domain/usecases/get-user-certification-eligibility');
const {
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
} = require('../../../../lib/domain/models/Badge').keys;

describe('Unit | UseCase | get-user-certification-eligibility', function () {
  let clock;
  const now = new Date(2020, 1, 1);

  const placementProfileService = {
    getPlacementProfile: () => undefined,
  };
  const certificationBadgesService = {
    findStillValidBadgeAcquisitions: () => undefined,
    hasStillValidCleaBadgeAcquisition: () => undefined,
  };

  beforeEach(function () {
    clock = sinon.useFakeTimers(now);
    placementProfileService.getPlacementProfile = sinon.stub();
    certificationBadgesService.findStillValidBadgeAcquisitions = sinon.stub();
    certificationBadgesService.hasStillValidCleaBadgeAcquisition = sinon.stub();
  });

  afterEach(function () {
    clock.restore();
  });

  context('when pix certification is not eligible', function () {
    it('should return the user certification eligibility with not eligible complementary certifications', async function () {
      // given
      const placementProfile = {
        isCertifiable: () => false,
      };
      placementProfileService.getPlacementProfile.withArgs({ userId: 2, limitDate: now }).resolves(placementProfile);
      certificationBadgesService.hasStillValidCleaBadgeAcquisition.throws(new Error('I should not be called'));
      certificationBadgesService.findStillValidBadgeAcquisitions.throws(new Error('I should not be called'));

      // when
      const certificationEligibility = await getUserCertificationEligibility({
        userId: 2,
        placementProfileService,
        certificationBadgesService,
      });

      // then
      const expectedCertificationEligibility = domainBuilder.buildCertificationEligibility({
        id: 2,
        pixCertificationEligible: false,
      });
      expect(certificationEligibility).to.deep.equal(expectedCertificationEligibility);
    });
  });

  context('when clea badge is acquired and still valid', function () {
    it('should return the user certification eligibility with eligible clea', async function () {
      // given
      const placementProfile = {
        isCertifiable: () => true,
      };
      placementProfileService.getPlacementProfile.withArgs({ userId: 2, limitDate: now }).resolves(placementProfile);
      certificationBadgesService.hasStillValidCleaBadgeAcquisition.resolves(true);
      certificationBadgesService.findStillValidBadgeAcquisitions.resolves([]);

      // when
      const certificationEligibility = await getUserCertificationEligibility({
        userId: 2,
        placementProfileService,
        certificationBadgesService,
      });

      // then
      expect(certificationEligibility.eligibleComplementaryCertifications).contains('CléA Numérique');
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  [
    { badgeKey: PIX_DROIT_MAITRE_CERTIF, expectedCertifiableBadgeLabel: 'Pix+ Droit Maître' },
    { badgeKey: PIX_DROIT_EXPERT_CERTIF, expectedCertifiableBadgeLabel: 'Pix+ Droit Expert' },
    {
      badgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
      expectedCertifiableBadgeLabel: 'Pix+ Édu 2nd degré Initié (entrée dans le métier)',
    },
    {
      badgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
      expectedCertifiableBadgeLabel: 'Pix+ Édu 2nd degré Confirmé',
    },
    {
      badgeKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
      expectedCertifiableBadgeLabel: 'Pix+ Édu 2nd degré Confirmé',
    },
    {
      badgeKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
      expectedCertifiableBadgeLabel: 'Pix+ Édu 2nd degré Avancé',
    },
    {
      badgeKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
      expectedCertifiableBadgeLabel: 'Pix+ Édu 2nd degré Expert',
    },
    {
      badgeKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
      expectedCertifiableBadgeLabel: 'Pix+ Édu 1er degré Initié (entrée dans le métier)',
    },
    {
      badgeKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
      expectedCertifiableBadgeLabel: 'Pix+ Édu 1er degré Confirmé',
    },
    {
      badgeKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
      expectedCertifiableBadgeLabel: 'Pix+ Édu 1er degré Confirmé',
    },
    {
      badgeKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
      expectedCertifiableBadgeLabel: 'Pix+ Édu 1er degré Avancé',
    },
    {
      badgeKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
      expectedCertifiableBadgeLabel: 'Pix+ Édu 1er degré Expert',
    },
  ].forEach(({ badgeKey, expectedCertifiableBadgeLabel }) => {
    context(`when ${badgeKey} badge is not acquired`, function () {
      it(`should return the user certification eligibility with not eligible ${badgeKey}`, async function () {
        // given
        const placementProfile = {
          isCertifiable: () => true,
        };
        placementProfileService.getPlacementProfile.withArgs({ userId: 2, limitDate: now }).resolves(placementProfile);
        certificationBadgesService.hasStillValidCleaBadgeAcquisition.resolves(false);
        certificationBadgesService.findStillValidBadgeAcquisitions.resolves([]);

        // when
        const certificationEligibility = await getUserCertificationEligibility({
          userId: 2,
          placementProfileService,
          certificationBadgesService,
        });

        // then
        expect(certificationEligibility.eligibleComplementaryCertifications).to.be.empty;
      });
    });

    context(`when ${badgeKey} badge is acquired`, function () {
      it(`should return the user certification eligibility with eligible ${badgeKey}`, async function () {
        // given
        const placementProfile = {
          isCertifiable: () => true,
        };
        placementProfileService.getPlacementProfile.withArgs({ userId: 2, limitDate: now }).resolves(placementProfile);
        certificationBadgesService.hasStillValidCleaBadgeAcquisition.resolves(false);
        const badgeAcquisition = domainBuilder.buildBadgeAcquisition({
          badge: domainBuilder.buildBadge({
            key: badgeKey,
          }),
        });
        certificationBadgesService.findStillValidBadgeAcquisitions.resolves([badgeAcquisition]);

        // when
        const certificationEligibility = await getUserCertificationEligibility({
          userId: 2,
          placementProfileService,
          certificationBadgesService,
        });

        // then
        expect(certificationEligibility.eligibleComplementaryCertifications).contains(expectedCertifiableBadgeLabel);
      });
    });
  });
});
