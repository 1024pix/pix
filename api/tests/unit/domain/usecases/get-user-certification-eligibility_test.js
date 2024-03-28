import { getUserCertificationEligibility } from '../../../../lib/domain/usecases/get-user-certification-eligibility.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | get-user-certification-eligibility', function () {
  let clock,
    placementProfileService,
    certificationBadgesService,
    complementaryCertificationCourseRepository,
    targetProfileHistoryRepository;
  const now = new Date(2020, 1, 1);

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    complementaryCertificationCourseRepository = {
      findByUserId: sinon.stub(),
    };
    targetProfileHistoryRepository = {
      getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId: sinon.stub(),
      getDetachedTargetProfilesHistoryByComplementaryCertificationId: sinon.stub(),
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
        targetProfileHistoryRepository,
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
        targetProfileHistoryRepository,
      });

      // then
      expect(certificationEligibility.complementaryCertifications).to.be.empty;
    });
  });

  context('when badge is acquired', function () {
    context('when the complementary certification is not acquired', function () {
      // context('when the acquired complementary certification badge is outdated by one version')
      it('should return the user certification eligibility with the acquired badge information', async function () {
        // given
        const placementProfile = { isCertifiable: () => true };
        placementProfileService.getPlacementProfile.withArgs({ userId: 2, limitDate: now }).resolves(placementProfile);
        const badgeAcquisition = _getOutdatedBadgeAcquisition({ complementaryCertificationBadgeId: 34 });
        const detachedTargetProfileHistory = domainBuilder.buildTargetProfileHistoryForAdmin({
          badges: [
            domainBuilder.buildComplementaryCertificationBadgeForAdmin({
              id: 3,
              complementaryCertificationBadgeId: 34,
            }),
          ],
          attachedAt: new Date('2021-01-01'),
          detachedAt: new Date('2022-01-01'),
        });
        const attachedTargetProfileHistory = domainBuilder.buildTargetProfileHistoryForAdmin({
          detachedAt: null,
          attachedAt: new Date('2024-01-01'),
          badges: [
            domainBuilder.buildComplementaryCertificationBadgeForAdmin({
              id: 3,
              complementaryCertificationBadgeId: 35,
            }),
          ],
        });
        certificationBadgesService.findLatestBadgeAcquisitions.resolves([badgeAcquisition]);
        targetProfileHistoryRepository.getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId
          .withArgs({ complementaryCertificationId: 1 })
          .resolves([attachedTargetProfileHistory]);

        targetProfileHistoryRepository.getDetachedTargetProfilesHistoryByComplementaryCertificationId
          .withArgs({ complementaryCertificationId: 1 })
          .resolves([detachedTargetProfileHistory]);

        complementaryCertificationCourseRepository.findByUserId.resolves([
          domainBuilder.buildComplementaryCertificationCourseWithResults({
            id: 1,
            hasExternalJury: false,
            complementaryCertificationBadgeId: 34,
            results: [
              {
                id: 3,
                acquired: false,
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
          targetProfileHistoryRepository,
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

    context('when the complementary certification is acquired', function () {
      it('should return the user certification eligibility with an acquired badge', async function () {
        // given
        const placementProfile = { isCertifiable: () => true };
        placementProfileService.getPlacementProfile.withArgs({ userId: 2, limitDate: now }).resolves(placementProfile);
        const badgeAcquisition = _getBadgeAcquisition({ complementaryCertificationBadgeId: 34 });
        certificationBadgesService.findLatestBadgeAcquisitions.resolves([badgeAcquisition]);

        complementaryCertificationCourseRepository.findByUserId.resolves([
          domainBuilder.buildComplementaryCertificationCourseWithResults({
            id: 1,
            hasExternalJury: false,
            complementaryCertificationBadgeId: 34,
            results: [
              {
                id: 3,
                acquired: true,
                source: 'PIX',
                complementaryCertificationBadgeId: 34,
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
          targetProfileHistoryRepository,
        });

        // then
        expect(certificationEligibility.complementaryCertifications).to.deep.equal([
          {
            label: 'BADGE_LABEL',
            imageUrl: 'http://www.image-url.com',
            isOutdated: false,
            isAcquired: true,
          },
        ]);
      });

      context('when the complementary certification badge has been deprecated', function () {
        context('when the acquired complementary certification badge is lower level', function () {
          context('when there is only one new version', function () {
            it('should return the user certification eligibility with complementary certification', async function () {
              // given
              const detachedTargetProfileHistory = domainBuilder.buildTargetProfileHistoryForAdmin({
                badges: [
                  domainBuilder.buildComplementaryCertificationBadgeForAdmin({
                    id: 3,
                    complementaryCertificationBadgeId: 34,
                  }),
                ],
                attachedAt: new Date('2021-01-01'),
                detachedAt: new Date('2022-01-01'),
              });
              const attachedTargetProfileHistory = domainBuilder.buildTargetProfileHistoryForAdmin({
                detachedAt: null,
                attachedAt: new Date('2024-01-01'),
                badges: [
                  domainBuilder.buildComplementaryCertificationBadgeForAdmin({
                    id: 3,
                    complementaryCertificationBadgeId: 35,
                  }),
                  domainBuilder.buildComplementaryCertificationBadgeForAdmin({
                    id: 3,
                    complementaryCertificationBadgeId: 36,
                  }),
                ],
              });
              targetProfileHistoryRepository.getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId
                .withArgs({ complementaryCertificationId: 1 })
                .resolves([attachedTargetProfileHistory]);

              targetProfileHistoryRepository.getDetachedTargetProfilesHistoryByComplementaryCertificationId
                .withArgs({ complementaryCertificationId: 1 })
                .resolves([detachedTargetProfileHistory]);

              const placementProfile = { isCertifiable: () => true };
              placementProfileService.getPlacementProfile
                .withArgs({ userId: 2, limitDate: now })
                .resolves(placementProfile);
              const badgeAcquisition = _getOutdatedBadgeAcquisition({ complementaryCertificationBadgeId: 34 });
              certificationBadgesService.findLatestBadgeAcquisitions.resolves([badgeAcquisition]);

              complementaryCertificationCourseRepository.findByUserId.resolves([
                domainBuilder.buildComplementaryCertificationCourseWithResults({
                  id: 1,
                  hasExternalJury: false,
                  complementaryCertificationBadgeId: 36,
                  results: [
                    {
                      id: 3,
                      acquired: true,
                      source: 'PIX',
                      complementaryCertificationBadgeId: 35,
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
                targetProfileHistoryRepository,
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

          context('when there is more than one new version', function () {
            it('should return the user certification eligibility without complementary certification', async function () {
              // given
              const detachedTargetProfileHistory1 = domainBuilder.buildTargetProfileHistoryForAdmin({
                badges: [
                  domainBuilder.buildComplementaryCertificationBadgeForAdmin({
                    id: 3,
                    complementaryCertificationBadgeId: 32,
                  }),
                  domainBuilder.buildComplementaryCertificationBadgeForAdmin({
                    id: 3,
                    complementaryCertificationBadgeId: 33,
                  }),
                ],
                attachedAt: new Date('2020-01-01'),
                detachedAt: new Date('2021-01-01'),
              });
              const detachedTargetProfileHistory2 = domainBuilder.buildTargetProfileHistoryForAdmin({
                badges: [
                  domainBuilder.buildComplementaryCertificationBadgeForAdmin({
                    id: 3,
                    complementaryCertificationBadgeId: 34,
                  }),
                ],
                attachedAt: new Date('2021-01-01'),
                detachedAt: new Date('2022-01-01'),
              });
              const attachedTargetProfileHistory = domainBuilder.buildTargetProfileHistoryForAdmin({
                detachedAt: null,
                attachedAt: new Date('2024-01-01'),
                badges: [
                  domainBuilder.buildComplementaryCertificationBadgeForAdmin({
                    id: 3,
                    complementaryCertificationBadgeId: 35,
                  }),
                ],
              });

              targetProfileHistoryRepository.getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId
                .withArgs({ complementaryCertificationId: 1 })
                .resolves([attachedTargetProfileHistory]);

              targetProfileHistoryRepository.getDetachedTargetProfilesHistoryByComplementaryCertificationId
                .withArgs({ complementaryCertificationId: 1 })
                .resolves([detachedTargetProfileHistory2, detachedTargetProfileHistory1]);

              const placementProfile = { isCertifiable: () => true };
              placementProfileService.getPlacementProfile
                .withArgs({ userId: 2, limitDate: now })
                .resolves(placementProfile);

              const badgeAcquisition = _getOutdatedBadgeAcquisition({ complementaryCertificationBadgeId: 33 });

              certificationBadgesService.findLatestBadgeAcquisitions.resolves([badgeAcquisition]);

              complementaryCertificationCourseRepository.findByUserId.resolves([
                domainBuilder.buildComplementaryCertificationCourseWithResults({
                  id: 1,
                  hasExternalJury: false,
                  complementaryCertificationBadgeId: 33,
                  results: [
                    {
                      id: 3,
                      acquired: true,
                      source: 'PIX',
                      complementaryCertificationBadgeId: 32,
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
                targetProfileHistoryRepository,
              });

              // then
              expect(certificationEligibility.complementaryCertifications).to.deep.equal([]);
            });
          });
        });

        context('when the acquired complementary certification badge is current level', function () {
          it('should return the user certification eligibility without complementary certification', async function () {
            // given
            const attachedTargetProfileHistory = domainBuilder.buildTargetProfileHistoryForAdmin({
              detachedAt: null,
              attachedAt: new Date('2024-01-01'),
              badges: [
                domainBuilder.buildComplementaryCertificationBadgeForAdmin({
                  id: 3,
                  complementaryCertificationBadgeId: 35,
                }),
              ],
            });

            const detachedTargetProfileHistory = domainBuilder.buildTargetProfileHistoryForAdmin({
              detachedAt: null,
              attachedAt: new Date('2024-01-01'),
              badges: [
                domainBuilder.buildComplementaryCertificationBadgeForAdmin({
                  id: 3,
                  complementaryCertificationBadgeId: 34,
                }),
              ],
            });

            targetProfileHistoryRepository.getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId
              .withArgs({ complementaryCertificationId: 1 })
              .resolves([attachedTargetProfileHistory]);

            targetProfileHistoryRepository.getDetachedTargetProfilesHistoryByComplementaryCertificationId
              .withArgs({ complementaryCertificationId: 1 })
              .resolves([detachedTargetProfileHistory]);

            const placementProfile = { isCertifiable: () => true };
            placementProfileService.getPlacementProfile
              .withArgs({ userId: 2, limitDate: now })
              .resolves(placementProfile);

            const badgeAcquisition = _getOutdatedBadgeAcquisition({ complementaryCertificationBadgeId: 35 });

            certificationBadgesService.findLatestBadgeAcquisitions.resolves([badgeAcquisition]);

            complementaryCertificationCourseRepository.findByUserId.resolves([
              domainBuilder.buildComplementaryCertificationCourseWithResults({
                id: 1,
                hasExternalJury: false,
                complementaryCertificationBadgeId: 35,
                results: [
                  {
                    id: 3,
                    acquired: true,
                    source: 'PIX',
                    complementaryCertificationBadgeId: 35,
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
              targetProfileHistoryRepository,
            });

            // then
            expect(certificationEligibility.complementaryCertifications).to.deep.equal([]);
          });
        });
      });
    });

    context('when the complementary certification has not been taken', function () {
      it('should return the user certification eligibility with the acquired badge information', async function () {
        // given
        const attachedTargetProfileHistory = domainBuilder.buildTargetProfileHistoryForAdmin({
          detachedAt: null,
          attachedAt: new Date('2024-01-01'),
          badges: [
            domainBuilder.buildComplementaryCertificationBadgeForAdmin({
              id: 3,
              complementaryCertificationBadgeId: 35,
            }),
          ],
        });

        targetProfileHistoryRepository.getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId
          .withArgs({ complementaryCertificationId: 1 })
          .resolves([attachedTargetProfileHistory]);

        targetProfileHistoryRepository.getDetachedTargetProfilesHistoryByComplementaryCertificationId
          .withArgs({ complementaryCertificationId: 1 })
          .resolves([]);
        const placementProfile = { isCertifiable: () => true };
        placementProfileService.getPlacementProfile.withArgs({ userId: 2, limitDate: now }).resolves(placementProfile);
        const badgeAcquisition = _getBadgeAcquisition({});
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
          targetProfileHistoryRepository,
        });

        // then
        expect(certificationEligibility.complementaryCertifications).to.deep.equal([
          {
            label: 'BADGE_LABEL',
            imageUrl: 'http://www.image-url.com',
            isOutdated: false,
            isAcquired: false,
          },
        ]);
      });
    });

    context('when the complementary certification has an external', function () {
      context('when the pix jury is acquired', function () {
        context('when the external jury is not acquired', function () {
          it('should return the user certification eligibility with acquired badge', async function () {
            // given
            const detachedTargetProfileHistory = domainBuilder.buildTargetProfileHistoryForAdmin({
              badges: [
                domainBuilder.buildComplementaryCertificationBadgeForAdmin({
                  id: 3,
                  complementaryCertificationBadgeId: 33,
                }),
              ],
              attachedAt: new Date('2020-01-01'),
              detachedAt: new Date('2021-01-01'),
            });

            const attachedTargetProfileHistory = domainBuilder.buildTargetProfileHistoryForAdmin({
              detachedAt: null,
              attachedAt: new Date('2024-01-01'),
              badges: [
                domainBuilder.buildComplementaryCertificationBadgeForAdmin({
                  id: 3,
                  complementaryCertificationBadgeId: 35,
                }),
              ],
            });

            targetProfileHistoryRepository.getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId
              .withArgs({ complementaryCertificationId: 1 })
              .resolves([attachedTargetProfileHistory]);

            targetProfileHistoryRepository.getDetachedTargetProfilesHistoryByComplementaryCertificationId
              .withArgs({ complementaryCertificationId: 1 })
              .resolves([detachedTargetProfileHistory]);

            const placementProfile = { isCertifiable: () => true };
            placementProfileService.getPlacementProfile
              .withArgs({ userId: 2, limitDate: now })
              .resolves(placementProfile);
            const badgeAcquisition = _getOutdatedBadgeAcquisition({ complementaryCertificationBadgeId: 33 });
            certificationBadgesService.findLatestBadgeAcquisitions.resolves([badgeAcquisition]);

            complementaryCertificationCourseRepository.findByUserId.resolves([
              domainBuilder.buildComplementaryCertificationCourseWithResults({
                id: 1,
                hasExternalJury: true,
                complementaryCertificationBadgeId: 33,
                results: [
                  {
                    id: 3,
                    acquired: true,
                    source: 'PIX',
                  },
                  {
                    id: 4,
                    acquired: true,
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
              targetProfileHistoryRepository,
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
      });
    });
  });

  function _getBadgeAcquisition({
    complementaryCertificationId = 1,
    complementaryCertificationBadgeId = 2,
    outdated = false,
  }) {
    return domainBuilder.buildCertifiableBadgeAcquisition({
      badgeKey: 'BADGE_KEY',
      complementaryCertificationId,
      complementaryCertificationBadgeId,
      complementaryCertificationBadgeLabel: 'BADGE_LABEL',
      complementaryCertificationBadgeImageUrl: 'http://www.image-url.com',
      isOutdated: outdated,
    });
  }

  function _getOutdatedBadgeAcquisition({ complementaryCertificationId = 1, complementaryCertificationBadgeId = 2 }) {
    return _getBadgeAcquisition({ complementaryCertificationId, complementaryCertificationBadgeId, outdated: true });
  }
});
