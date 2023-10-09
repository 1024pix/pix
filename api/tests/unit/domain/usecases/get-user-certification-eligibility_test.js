import { sinon, expect, domainBuilder } from '../../../test-helper.js';
import { getUserCertificationEligibility } from '../../../../lib/domain/usecases/get-user-certification-eligibility.js';

describe('Unit | UseCase | get-user-certification-eligibility', function () {
  let clock;
  const now = new Date(2020, 1, 1);

  const placementProfileService = {
    getPlacementProfile: () => undefined,
  };
  const certificationBadgesService = {
    findLatestBadgeAcquisitions: () => undefined,
  };

  beforeEach(function () {
    clock = sinon.useFakeTimers(now);
    placementProfileService.getPlacementProfile = sinon.stub();
    certificationBadgesService.findLatestBadgeAcquisitions = sinon.stub();
  });

  afterEach(function () {
    clock.restore();
  });

  context('when pix certification is not eligible', function () {
    it('should return the user certification eligibility without eligible complementary certifications', async function () {
      // given
      const placementProfile = {
        isCertifiable: () => false,
      };
      placementProfileService.getPlacementProfile.withArgs({ userId: 2, limitDate: now }).resolves(placementProfile);
      certificationBadgesService.findLatestBadgeAcquisitions.throws(new Error('I should not be called'));

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
    it('should return the user certification eligibility without eligible badge', async function () {
      // given
      const placementProfile = {
        isCertifiable: () => true,
      };
      placementProfileService.getPlacementProfile.withArgs({ userId: 2, limitDate: now }).resolves(placementProfile);
      certificationBadgesService.findLatestBadgeAcquisitions.resolves([]);

      // when
      const certificationEligibility = await getUserCertificationEligibility({
        userId: 2,
        placementProfileService,
        certificationBadgesService,
      });

      // then
      expect(certificationEligibility.complementaryCertifications).to.be.empty;
    });
  });

  context('when badge is acquired', function () {
    it('should return the user certification eligibility with the acquired badge informations', async function () {
      // given
      const placementProfile = {
        isCertifiable: () => true,
      };
      placementProfileService.getPlacementProfile.withArgs({ userId: 2, limitDate: now }).resolves(placementProfile);
      const badgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
        badgeKey: 'BADGE_KEY',
        complementaryCertificationBadgeLabel: 'BADGE_LABEL',
        complementaryCertificationBadgeImageUrl: 'http://www.image-url.com',
        isOutdated: true,
      });
      certificationBadgesService.findLatestBadgeAcquisitions.resolves([badgeAcquisition]);

      // when
      const certificationEligibility = await getUserCertificationEligibility({
        userId: 2,
        placementProfileService,
        certificationBadgesService,
      });

      // then
      expect(certificationEligibility.complementaryCertifications).to.deep.equal([
        {
          label: 'BADGE_LABEL',
          imageUrl: 'http://www.image-url.com',
          isOutdated: true,
        },
      ]);
    });
  });
});
