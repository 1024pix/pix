const { sinon, expect, domainBuilder } = require('../../../test-helper');
const getUserCertificationEligibility = require('../../../../lib/domain/usecases/get-user-certification-eligibility');
const {
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR,
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
        cleaCertificationEligible: false,
        pixPlusDroitMaitreCertificationEligible: false,
        pixPlusDroitExpertCertificationEligible: false,
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
      expect(certificationEligibility.cleaCertificationEligible).to.be.true;
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  [
    { badgeKey: PIX_DROIT_MAITRE_CERTIF, certificationEligibilityAttribute: 'pixPlusDroitMaitreCertificationEligible' },
    { badgeKey: PIX_DROIT_EXPERT_CERTIF, certificationEligibilityAttribute: 'pixPlusDroitExpertCertificationEligible' },
    {
      badgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
      certificationEligibilityAttribute: 'pixPlusEduInitieCertificationEligible',
    },
    {
      badgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE,
      certificationEligibilityAttribute: 'pixPlusEduConfirmeCertificationEligible',
    },
    {
      badgeKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
      certificationEligibilityAttribute: 'pixPlusEduConfirmeCertificationEligible',
    },
    {
      badgeKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
      certificationEligibilityAttribute: 'pixPlusEduAvanceCertificationEligible',
    },
    {
      badgeKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR,
      certificationEligibilityAttribute: 'pixPlusEduExpertCertificationEligible',
    },
  ].forEach(({ badgeKey, certificationEligibilityAttribute }) => {
    context(`when ${badgeKey} badge is not acquired`, function () {
      it(`should return the user certification eligibility with not eligible ${badgeKey}`, async function () {
        // given
        const placementProfile = {
          isCertifiable: () => true,
        };
        placementProfileService.getPlacementProfile.withArgs({ userId: 2, limitDate: now }).resolves(placementProfile);
        certificationBadgesService.hasStillValidCleaBadgeAcquisition.resolves(false);
        const someOtherBadge = domainBuilder.buildBadge({
          key: 'someKey',
        });
        const someOtherBadgeAcquisition = domainBuilder.buildBadgeAcquisition({
          badge: someOtherBadge,
        });
        certificationBadgesService.findStillValidBadgeAcquisitions.resolves([someOtherBadgeAcquisition]);

        // when
        const certificationEligibility = await getUserCertificationEligibility({
          userId: 2,
          placementProfileService,
          certificationBadgesService,
        });

        // then
        expect(certificationEligibility[certificationEligibilityAttribute]).to.be.false;
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
        const maitreBadgeAcquisition = domainBuilder.buildBadgeAcquisition({
          badge: domainBuilder.buildBadge({
            key: badgeKey,
          }),
        });
        certificationBadgesService.findStillValidBadgeAcquisitions.resolves([maitreBadgeAcquisition]);

        // when
        const certificationEligibility = await getUserCertificationEligibility({
          userId: 2,
          placementProfileService,
          certificationBadgesService,
        });

        // then
        expect(certificationEligibility[certificationEligibilityAttribute]).to.be.true;
      });
    });
  });
});
