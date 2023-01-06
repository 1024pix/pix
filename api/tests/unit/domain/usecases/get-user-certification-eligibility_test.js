const { sinon, expect, domainBuilder } = require('../../../test-helper');
const getUserCertificationEligibility = require('../../../../lib/domain/usecases/get-user-certification-eligibility');

describe('Unit | UseCase | get-user-certification-eligibility', function () {
  let clock;
  const now = new Date(2020, 1, 1);

  const placementProfileService = {
    getPlacementProfile: () => undefined,
  };
  const certificationBadgesService = {
    findStillValidBadgeAcquisitions: () => undefined,
  };

  beforeEach(function () {
    clock = sinon.useFakeTimers(now);
    placementProfileService.getPlacementProfile = sinon.stub();
    certificationBadgesService.findStillValidBadgeAcquisitions = sinon.stub();
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

  context(`when badge is not acquired`, function () {
    it('should return the user certification eligibility with not eligible badge', async function () {
      // given
      const placementProfile = {
        isCertifiable: () => true,
      };
      placementProfileService.getPlacementProfile.withArgs({ userId: 2, limitDate: now }).resolves(placementProfile);
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

  context('when badge is acquired', function () {
    it('should return the user certification eligibility with the eligible badge', async function () {
      // given
      const placementProfile = {
        isCertifiable: () => true,
      };
      placementProfileService.getPlacementProfile.withArgs({ userId: 2, limitDate: now }).resolves(placementProfile);
      const badgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
        badgeKey: 'BADGE_KEY',
        complementaryCertificationBadgeLabel: 'BADGE_LABEL',
        complementaryCertificationBadgeImageUrl: 'http://www.image-url.com',
      });
      certificationBadgesService.findStillValidBadgeAcquisitions.resolves([badgeAcquisition]);

      // when
      const certificationEligibility = await getUserCertificationEligibility({
        userId: 2,
        placementProfileService,
        certificationBadgesService,
      });

      // then
      expect(certificationEligibility.eligibleComplementaryCertifications).to.deep.equal([
        {
          label: 'BADGE_LABEL',
          imageUrl: 'http://www.image-url.com',
        },
      ]);
    });
  });
});
