import { getUserCertificationEligibility } from '../../../../lib/domain/usecases/get-user-certification-eligibility.js';
import { config } from '../../../../src/shared/config.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | get-user-certification-eligibility', function () {
  let clock, userEligibilityService, complementaryCertificationBadgeRepository;
  const now = new Date(2020, 1, 1);

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    userEligibilityService = {
      getUserEligibilityList: sinon.stub(),
    };
    complementaryCertificationBadgeRepository = {
      findAll: sinon.stub(),
    };
  });

  afterEach(function () {
    clock.restore();
  });

  context('when pix certification is not eligible', function () {
    it('should return the user certification eligibility without eligible complementary certifications', async function () {
      // given
      userEligibilityService.getUserEligibilityList.withArgs({ userId: 2, limitDate: now }).resolves(
        domainBuilder.certification.enrolment.buildUserEligibilityList({
          userId: 2,
          date: now,
          eligibilitiesV2: [domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: false })],
        }),
      );

      // when
      const certificationEligibility = await getUserCertificationEligibility({
        userId: 2,
        userEligibilityService,
        complementaryCertificationBadgeRepository,
      });

      // then
      const expectedCertificationEligibility = domainBuilder.buildCertificationEligibility({
        id: 2,
        pixCertificationEligible: false,
      });
      expect(certificationEligibility).to.deep.equal(expectedCertificationEligibility);
    });
  });

  context('when pix certification is eligible', function () {
    beforeEach(function () {
      userEligibilityService.getUserEligibilityList.withArgs({ userId: 2, limitDate: now }).resolves(
        domainBuilder.certification.enrolment.buildUserEligibilityList({
          userId: 2,
          date: now,
          eligibilitiesV2: [domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true })],
        }),
      );
    });

    context(`when badge is not acquired`, function () {
      it('should return the user certification eligibility without eligible badge', async function () {
        // when
        const certificationEligibility = await getUserCertificationEligibility({
          userId: 2,
          userEligibilityService,
          complementaryCertificationBadgeRepository,
        });

        // then
        expect(certificationEligibility.complementaryCertifications).to.be.empty;
      });
    });

    context('when badge is acquired', function () {
      context('when the complementary certification is not acquired', function () {
        it('should return the user certification eligibility with the acquired badge information', async function () {
          // given
          userEligibilityService.getUserEligibilityList.withArgs({ userId: 2, limitDate: now }).resolves(
            domainBuilder.certification.enrolment.buildUserEligibilityList({
              userId: 2,
              date: now,
              eligibilitiesV2: [
                domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true }),
                domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
                  isCertifiable: false,
                  complementaryCertificationBadgeId: 123,
                  why: { isOutdated: true, isCoreCertifiable: true },
                  info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 1 },
                }),
              ],
            }),
          );
          complementaryCertificationBadgeRepository.findAll.resolves([
            domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
              id: 123,
              label: 'monSuperChouetteLabel',
              imageUrl: 'maSuperChouetteImageUrl',
            }),
          ]);

          // when
          const certificationEligibility = await getUserCertificationEligibility({
            userId: 2,
            userEligibilityService,
            complementaryCertificationBadgeRepository,
          });

          // then
          expect(certificationEligibility.complementaryCertifications).to.deep.equal([
            {
              label: 'monSuperChouetteLabel',
              imageUrl: 'maSuperChouetteImageUrl',
              isOutdated: true,
              isAcquiredExpectedLevel: false,
            },
          ]);
        });
      });

      context('when the complementary certification is acquired', function () {
        it('should return the user certification eligibility with an acquired badge', async function () {
          // given
          userEligibilityService.getUserEligibilityList.withArgs({ userId: 2, limitDate: now }).resolves(
            domainBuilder.certification.enrolment.buildUserEligibilityList({
              userId: 2,
              date: now,
              eligibilitiesV2: [
                domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true }),
                domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
                  isCertifiable: true,
                  complementaryCertificationBadgeId: 123,
                  why: { isOutdated: false, isCoreCertifiable: true },
                  info: { hasComplementaryCertificationForThisLevel: true, versionsBehind: 0 },
                }),
              ],
            }),
          );
          complementaryCertificationBadgeRepository.findAll.resolves([
            domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
              id: 123,
              label: 'monSuperChouetteLabel',
              imageUrl: 'maSuperChouetteImageUrl',
            }),
          ]);

          // when
          const certificationEligibility = await getUserCertificationEligibility({
            userId: 2,
            userEligibilityService,
            complementaryCertificationBadgeRepository,
          });

          // then
          expect(certificationEligibility.complementaryCertifications).to.deep.equal([
            {
              label: 'monSuperChouetteLabel',
              imageUrl: 'maSuperChouetteImageUrl',
              isOutdated: false,
              isAcquiredExpectedLevel: true,
            },
          ]);
        });

        context('when the complementary certification badge has been deprecated', function () {
          context('when the acquired complementary certification badge is lower level', function () {
            context('when there is only one new version', function () {
              it('should return the user certification eligibility with complementary certification', async function () {
                // given
                userEligibilityService.getUserEligibilityList.withArgs({ userId: 2, limitDate: now }).resolves(
                  domainBuilder.certification.enrolment.buildUserEligibilityList({
                    userId: 2,
                    date: now,
                    eligibilitiesV2: [
                      domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true }),
                      domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
                        isCertifiable: false,
                        complementaryCertificationBadgeId: 123,
                        why: { isOutdated: true, isCoreCertifiable: true },
                        info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 1 },
                      }),
                    ],
                  }),
                );
                complementaryCertificationBadgeRepository.findAll.resolves([
                  domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
                    id: 123,
                    label: 'monSuperChouetteLabel',
                    imageUrl: 'maSuperChouetteImageUrl',
                  }),
                ]);

                // when
                const certificationEligibility = await getUserCertificationEligibility({
                  userId: 2,
                  userEligibilityService,
                  complementaryCertificationBadgeRepository,
                });

                // then
                expect(certificationEligibility.complementaryCertifications).to.deep.equal([
                  {
                    label: 'monSuperChouetteLabel',
                    imageUrl: 'maSuperChouetteImageUrl',
                    isOutdated: true,
                    isAcquiredExpectedLevel: false,
                  },
                ]);
              });
            });

            context('when there is more than one new version', function () {
              context('if FT_ENABLE_PIX_PLUS_LOWER_LEVEL is enabled', function () {
                it('should return the user certification eligibility without complementary certification', async function () {
                  // given
                  sinon.stub(config.featureToggles, 'isPixPlusLowerLeverEnabled').value(true);
                  userEligibilityService.getUserEligibilityList.withArgs({ userId: 2, limitDate: now }).resolves(
                    domainBuilder.certification.enrolment.buildUserEligibilityList({
                      userId: 2,
                      date: now,
                      eligibilitiesV2: [
                        domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true }),
                        domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
                          isCertifiable: false,
                          complementaryCertificationBadgeId: 123,
                          why: { isOutdated: true, isCoreCertifiable: true },
                          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 2 },
                        }),
                      ],
                    }),
                  );
                  complementaryCertificationBadgeRepository.findAll.resolves([
                    domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
                      id: 123,
                      label: 'monSuperChouetteLabel',
                      imageUrl: 'maSuperChouetteImageUrl',
                    }),
                  ]);

                  // when
                  const certificationEligibility = await getUserCertificationEligibility({
                    userId: 2,
                    userEligibilityService,
                    complementaryCertificationBadgeRepository,
                  });

                  // then
                  expect(certificationEligibility.complementaryCertifications).to.deep.equal([]);
                });
              });

              context('if FT_ENABLE_PIX_PLUS_LOWER_LEVEL is not enabled', function () {
                it('should return the user certification eligibility with complementary certification', async function () {
                  // given
                  sinon.stub(config.featureToggles, 'isPixPlusLowerLeverEnabled').value(false);
                  userEligibilityService.getUserEligibilityList.withArgs({ userId: 2, limitDate: now }).resolves(
                    domainBuilder.certification.enrolment.buildUserEligibilityList({
                      userId: 2,
                      date: now,
                      eligibilitiesV2: [
                        domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true }),
                        domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
                          isCertifiable: false,
                          complementaryCertificationBadgeId: 123,
                          why: { isOutdated: true, isCoreCertifiable: true },
                          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 2 },
                        }),
                      ],
                    }),
                  );
                  complementaryCertificationBadgeRepository.findAll.resolves([
                    domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
                      id: 123,
                      label: 'monSuperChouetteLabel',
                      imageUrl: 'maSuperChouetteImageUrl',
                    }),
                  ]);

                  // when
                  const certificationEligibility = await getUserCertificationEligibility({
                    userId: 2,
                    userEligibilityService,
                    complementaryCertificationBadgeRepository,
                  });

                  // then
                  expect(certificationEligibility.complementaryCertifications).to.deep.equal([
                    {
                      label: 'monSuperChouetteLabel',
                      imageUrl: 'maSuperChouetteImageUrl',
                      isOutdated: true,
                      isAcquiredExpectedLevel: false,
                    },
                  ]);
                });
              });
            });
          });
          /* je n'ai rien compris à ce test
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
                          userEligibilityService,
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
          */
          context('when the complementary certification has not been taken', function () {
            it('should return the user certification eligibility with the acquired badge information', async function () {
              // given
              userEligibilityService.getUserEligibilityList.withArgs({ userId: 2, limitDate: now }).resolves(
                domainBuilder.certification.enrolment.buildUserEligibilityList({
                  userId: 2,
                  date: now,
                  eligibilitiesV2: [
                    domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true }),
                    domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
                      isCertifiable: true,
                      complementaryCertificationBadgeId: 123,
                      why: { isOutdated: false, isCoreCertifiable: true },
                      info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 0 },
                    }),
                  ],
                }),
              );
              complementaryCertificationBadgeRepository.findAll.resolves([
                domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
                  id: 123,
                  label: 'monSuperChouetteLabel',
                  imageUrl: 'maSuperChouetteImageUrl',
                }),
              ]);

              // when
              const certificationEligibility = await getUserCertificationEligibility({
                userId: 2,
                userEligibilityService,
                complementaryCertificationBadgeRepository,
              });

              // then
              expect(certificationEligibility.complementaryCertifications).to.deep.equal([
                {
                  label: 'monSuperChouetteLabel',
                  imageUrl: 'maSuperChouetteImageUrl',
                  isOutdated: false,
                  isAcquiredExpectedLevel: false,
                },
              ]);
            });
          });
        });
      });
    });
  });
});
/*
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
}*/
