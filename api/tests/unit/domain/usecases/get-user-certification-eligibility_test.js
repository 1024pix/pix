import { domainBuilder, expect, sinon } from '../../../test-helper.js';
import { getUserCertificationEligibility } from '../../../../lib/domain/usecases/get-user-certification-eligibility.js';

describe('Unit | UseCase | get-user-certification-eligibility', function () {
  let clock, placementProfileService, certificationBadgesService, complementaryCertificationCourseRepository;
  const now = new Date(2020, 1, 1);

  beforeEach(function () {
    clock = sinon.useFakeTimers(now);
    complementaryCertificationCourseRepository = {
      findByUserId: sinon.stub(),
    };
    certificationBadgesService = {
      findLatestBadgeAcquisitions: sinon.stub(),
    };
    placementProfileService = {
      getPlacementProfile: sinon.stub(),
    };
  });

  afterEach(function () {
    clock.restore();
  });

  context('when pix certification is not eligible', function () {
    it('should return the user certification eligibility without eligible complementary certifications', async function () {
      // given
      const placementProfile = { isCertifiable: () => false };
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
      const placementProfile = { isCertifiable: () => true };
      placementProfileService.getPlacementProfile.withArgs({ userId: 2, limitDate: now }).resolves(placementProfile);
      certificationBadgesService.findLatestBadgeAcquisitions.resolves([]);
      complementaryCertificationCourseRepository.findByUserId.resolves([]);

      // when
      const certificationEligibility = await getUserCertificationEligibility({
        userId: 2,
        placementProfileService,
        certificationBadgesService,
        complementaryCertificationCourseRepository,
      });

      // then
      expect(certificationEligibility.complementaryCertifications).to.be.empty;
    });
  });

  context('when badge is acquired', function () {
    context('when the certification is not acquired', function () {
      it('should return the user certification eligibility with the acquired badge information', async function () {
        // given
        const placementProfile = { isCertifiable: () => true };
        placementProfileService.getPlacementProfile.withArgs({ userId: 2, limitDate: now }).resolves(placementProfile);
        const badgeAcquisition = getOutdatedBadgeAcquisition();
        certificationBadgesService.findLatestBadgeAcquisitions.resolves([badgeAcquisition]);

        complementaryCertificationCourseRepository.findByUserId.resolves([
          domainBuilder.buildComplementaryCertificationCourseWithResults({
            id: 1,
            hasExternalJury: false,
            complementaryCertificationBadgeId: 2,
            results: [
              {
                id: 3,
                acquired: false,
                partnerKey: 'BADGE_KEY',
                source: 'PIX',
              },
            ],
          }),
        ]);

        // when
        const certificationEligibility = await getUserCertificationEligibility({
          userId: 2,
          placementProfileService,
          certificationBadgesService,
          complementaryCertificationCourseRepository,
        });

        // then
        expect(certificationEligibility.complementaryCertifications).to.deep.equal([
          {
            label: 'BADGE_LABEL',
            imageUrl: 'http://www.image-url.com',
            isOutdated: true,
            isAcquired: false,
          },
        ]);
      });
    });
    context('when the certification is acquired', function () {
      it('should return the user certification eligibility with a badge not acquired', async function () {
        // given
        const placementProfile = { isCertifiable: () => true };
        placementProfileService.getPlacementProfile.withArgs({ userId: 2, limitDate: now }).resolves(placementProfile);
        const badgeAcquisition = getOutdatedBadgeAcquisition();
        certificationBadgesService.findLatestBadgeAcquisitions.resolves([badgeAcquisition]);
        complementaryCertificationCourseRepository.findByUserId.resolves([
          domainBuilder.buildComplementaryCertificationCourseWithResults({
            id: 1,
            hasExternalJury: false,
            complementaryCertificationBadgeId: 2,
            results: [
              {
                id: 3,
                acquired: true,
                partnerKey: 'BADGE_KEY',
                source: 'PIX',
              },
            ],
          }),
        ]);

        // when
        const certificationEligibility = await getUserCertificationEligibility({
          userId: 2,
          placementProfileService,
          certificationBadgesService,
          complementaryCertificationCourseRepository,
        });

        // then
        expect(certificationEligibility.complementaryCertifications).to.deep.equal([
          {
            label: 'BADGE_LABEL',
            imageUrl: 'http://www.image-url.com',
            isOutdated: true,
            isAcquired: true,
          },
        ]);
      });
    });
    context('when the certification has no result', function () {
      it('should return the user certification eligibility with the acquired badge information', async function () {
        // given
        const placementProfile = { isCertifiable: () => true };
        placementProfileService.getPlacementProfile.withArgs({ userId: 2, limitDate: now }).resolves(placementProfile);
        const badgeAcquisition = getOutdatedBadgeAcquisition();
        certificationBadgesService.findLatestBadgeAcquisitions.resolves([badgeAcquisition]);
        complementaryCertificationCourseRepository.findByUserId.resolves([
          domainBuilder.buildComplementaryCertificationCourseWithResults({
            id: 1,
            hasExternalJury: false,
            complementaryCertificationBadgeId: 2,
            results: [],
          }),
        ]);

        // when
        const certificationEligibility = await getUserCertificationEligibility({
          userId: 2,
          placementProfileService,
          certificationBadgesService,
          complementaryCertificationCourseRepository,
        });

        // then
        expect(certificationEligibility.complementaryCertifications).to.deep.equal([
          {
            label: 'BADGE_LABEL',
            imageUrl: 'http://www.image-url.com',
            isOutdated: true,
            isAcquired: false,
          },
        ]);
      });
    });
    context('when the certification with external jury is acquired', function () {
      it('should return the user certification eligibility with acquired badge', async function () {
        // given
        const placementProfile = { isCertifiable: () => true };
        placementProfileService.getPlacementProfile.withArgs({ userId: 2, limitDate: now }).resolves(placementProfile);
        const badgeAcquisition = getOutdatedBadgeAcquisition();
        certificationBadgesService.findLatestBadgeAcquisitions.resolves([badgeAcquisition]);
        complementaryCertificationCourseRepository.findByUserId.resolves([
          domainBuilder.buildComplementaryCertificationCourseWithResults({
            id: 1,
            hasExternalJury: true,
            complementaryCertificationBadgeId: 2,
            results: [
              {
                id: 3,
                acquired: true,
                partnerKey: 'BADGE_KEY',
                source: 'PIX',
              },
              {
                id: 4,
                acquired: true,
                partnerKey: 'BADGE_KEY',
                source: 'EXTERNAL',
              },
            ],
          }),
        ]);

        // when
        const certificationEligibility = await getUserCertificationEligibility({
          userId: 2,
          placementProfileService,
          certificationBadgesService,
          complementaryCertificationCourseRepository,
        });

        // then
        expect(certificationEligibility.complementaryCertifications).to.deep.equals([
          {
            label: 'BADGE_LABEL',
            imageUrl: 'http://www.image-url.com',
            isOutdated: true,
            isAcquired: true,
          },
        ]);
      });
    });
    context('when the certification with external jury is not acquired', function () {
      context('when the user failed the external examination', function () {
        it('should return the user certification eligibility with the acquired badge', async function () {
          // given
          const placementProfile = {
            isCertifiable: () => true,
          };
          placementProfileService.getPlacementProfile
            .withArgs({ userId: 2, limitDate: now })
            .resolves(placementProfile);
          const badgeAcquisition = getOutdatedBadgeAcquisition();
          certificationBadgesService.findLatestBadgeAcquisitions.resolves([badgeAcquisition]);
          complementaryCertificationCourseRepository.findByUserId.resolves([
            domainBuilder.buildComplementaryCertificationCourseWithResults({
              id: 1,
              hasExternalJury: true,
              complementaryCertificationBadgeId: 2,
              results: [
                {
                  id: 3,
                  acquired: true,
                  partnerKey: 'BADGE_KEY',
                  source: 'PIX',
                },
                {
                  id: 4,
                  acquired: false,
                  partnerKey: 'BADGE_KEY',
                  source: 'EXTERNAL',
                },
              ],
            }),
          ]);

          // when
          const certificationEligibility = await getUserCertificationEligibility({
            userId: 2,
            placementProfileService,
            certificationBadgesService,
            complementaryCertificationCourseRepository,
          });

          // then
          expect(certificationEligibility.complementaryCertifications).to.exactlyContain([
            {
              label: 'BADGE_LABEL',
              imageUrl: 'http://www.image-url.com',
              isOutdated: true,
              isAcquired: false,
            },
          ]);
        });
      });
      context('when the user has not yet the external jury result', function () {
        it('should return the user certification eligibility with the acquired badge', async function () {
          // given
          const placementProfile = { isCertifiable: () => true };
          placementProfileService.getPlacementProfile
            .withArgs({ userId: 2, limitDate: now })
            .resolves(placementProfile);
          const badgeAcquisition = getOutdatedBadgeAcquisition();
          certificationBadgesService.findLatestBadgeAcquisitions.resolves([badgeAcquisition]);
          complementaryCertificationCourseRepository.findByUserId.resolves([
            domainBuilder.buildComplementaryCertificationCourseWithResults({
              id: 1,
              hasExternalJury: true,
              complementaryCertificationBadgeId: 2,
              results: [
                {
                  id: 3,
                  acquired: true,
                  partnerKey: 'BADGE_KEY',
                  source: 'PIX',
                },
              ],
            }),
          ]);

          // when
          const certificationEligibility = await getUserCertificationEligibility({
            userId: 2,
            placementProfileService,
            certificationBadgesService,
            complementaryCertificationCourseRepository,
          });

          // then
          expect(certificationEligibility.complementaryCertifications).to.exactlyContain([
            {
              label: 'BADGE_LABEL',
              imageUrl: 'http://www.image-url.com',
              isOutdated: true,
              isAcquired: false,
            },
          ]);
        });
      });
    });
  });

  function getOutdatedBadgeAcquisition() {
    return domainBuilder.buildCertifiableBadgeAcquisition({
      badgeKey: 'BADGE_KEY',
      complementaryCertificationBadgeId: 2,
      complementaryCertificationBadgeLabel: 'BADGE_LABEL',
      complementaryCertificationBadgeImageUrl: 'http://www.image-url.com',
      isOutdated: true,
    });
  }
});
