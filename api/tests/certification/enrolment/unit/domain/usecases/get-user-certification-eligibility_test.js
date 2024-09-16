import { getUserCertificationEligibility } from '../../../../../../src/certification/enrolment/domain/usecases/get-user-certification-eligibility.js';
import { sources } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { AssessmentResult } from '../../../../../../src/shared/domain/models/index.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Usecases | get-user-certification-eligibility', function () {
  const userId = 123;
  const limitDate = new Date('2024-09-06');
  let dependencies;
  const placementProfileService = {};
  const certificationBadgesService = {};
  const complementaryCertificationCourseRepository = {};
  const pixCertificationRepository = {};
  const complementaryCertificationBadgeRepository = {};

  beforeEach(function () {
    placementProfileService.getPlacementProfile = sinon.stub();
    certificationBadgesService.findLatestBadgeAcquisitions = sinon.stub();
    complementaryCertificationCourseRepository.findByUserId = sinon.stub();
    pixCertificationRepository.findByUserId = sinon.stub();
    complementaryCertificationBadgeRepository.findAll = sinon.stub();
    dependencies = {
      userId,
      limitDate,
      placementProfileService,
      certificationBadgesService,
      complementaryCertificationCourseRepository,
      pixCertificationRepository,
      complementaryCertificationBadgeRepository,
    };
  });

  context('certificability', function () {
    beforeEach(function () {
      certificationBadgesService.findLatestBadgeAcquisitions.resolves([]);
      complementaryCertificationCourseRepository.findByUserId.resolves([]);
      pixCertificationRepository.findByUserId.resolves([]);
      complementaryCertificationBadgeRepository.findAll.resolves([]);
    });
    context('when user is certifiable', function () {
      it('returns a user certification eligibility with is certifiable set to true', async function () {
        placementProfileService.getPlacementProfile.withArgs({ userId, limitDate }).resolves(
          domainBuilder.buildPlacementProfile.buildCertifiable({
            profileDate: limitDate,
            userId,
          }),
        );

        const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

        expect(userCertificationEligibility).to.deep.equal(
          domainBuilder.certification.enrolment.buildUserCertificationEligibility({
            id: userId,
            isCertifiable: true,
            certificationEligibilities: [],
          }),
        );
      });
    });
    context('when user is not certifiable', function () {
      it('returns a user certification eligibility with is certifiable set to false', async function () {
        placementProfileService.getPlacementProfile.withArgs({ userId, limitDate }).resolves(
          domainBuilder.buildPlacementProfile({
            profileDate: limitDate,
            userId,
            userCompetences: [domainBuilder.buildUserCompetence({ estimatedLevel: 1, pixScore: 1 })],
          }),
        );

        const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

        expect(userCertificationEligibility).to.deep.equal(
          domainBuilder.certification.enrolment.buildUserCertificationEligibility({
            id: userId,
            isCertifiable: false,
            certificationEligibilities: [],
          }),
        );
      });
    });
  });
  context('eligibility', function () {
    const complementaryCertificationBadgeId = 123;

    context('when user has not acquired any certifiable badge', function () {
      it('returns a UserCertificationEligibility model with no eligibilities  ', async function () {
        placementProfileService.getPlacementProfile.withArgs({ userId, limitDate }).resolves(
          domainBuilder.buildPlacementProfile.buildCertifiable({
            profileDate: limitDate,
            userId,
          }),
        );
        certificationBadgesService.findLatestBadgeAcquisitions
          .withArgs({
            userId,
            limitDate,
          })
          .resolves([]);
        complementaryCertificationCourseRepository.findByUserId.resolves([]);

        const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

        expect(userCertificationEligibility).to.deep.equal(
          domainBuilder.certification.enrolment.buildUserCertificationEligibility({
            id: userId,
            isCertifiable: true,
            certificationEligibilities: [],
          }),
        );
      });
    });

    context('when user has acquired a badge', function () {
      let complementaryCertificationKey;
      const requiredPixScore = 150;
      context('CLEA', function () {
        beforeEach(function () {
          complementaryCertificationKey = ComplementaryCertificationKeys.CLEA;
        });
        context('when acquired badge is outdated', function () {
          const isOutdated = true;
          beforeEach(function () {
            complementaryCertificationBadgeRepository.findAll.resolves([
              domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
                id: '1234',
                requiredPixScore,
                offsetVersion: 0,
              }),
              domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
                id: complementaryCertificationBadgeId,
                requiredPixScore,
                offsetVersion: 1,
              }),
            ]);
          });
          context('when user is certifiable', function () {
            const isCertifiable = true;
            beforeEach(function () {
              placementProfileService.getPlacementProfile.withArgs({ userId, limitDate }).resolves(
                domainBuilder.buildPlacementProfile.buildCertifiable({
                  profileDate: limitDate,
                  userId,
                }),
              );
            });
            context('when user has an acquired certification for this badge', function () {
              it('should not be added in the eligibilities of the model', async function () {
                // given
                complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([
                  domainBuilder.certification.enrolment.buildComplementaryCertificationCourseWithResults({
                    complementaryCertificationBadgeId,
                    results: [
                      {
                        source: sources.PIX,
                        acquired: true,
                        complementaryCertificationBadgeId,
                      },
                    ],
                  }),
                ]);

                certificationBadgesService.findLatestBadgeAcquisitions
                  .withArgs({
                    userId,
                    limitDate,
                  })
                  .resolves([
                    domainBuilder.buildCertifiableBadgeAcquisition({
                      complementaryCertificationBadgeId,
                      complementaryCertificationKey,
                      complementaryCertificationBadgeImageUrl: 'monImageUrl',
                      complementaryCertificationBadgeLabel: 'monLabel',
                      isOutdated,
                    }),
                  ]);

                // when
                const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

                // then
                expect(userCertificationEligibility).to.deep.equal(
                  domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                    id: userId,
                    isCertifiable,
                    certificationEligibilities: [],
                  }),
                );
              });
            });
            context('when user has not an acquired certification for this badge', function () {
              beforeEach(function () {
                complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([]);
              });

              context('when badge is outdated by more than one version', function () {
                beforeEach(function () {
                  complementaryCertificationBadgeRepository.findAll.resolves([
                    domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
                      id: '1234',
                      requiredPixScore,
                      offsetVersion: 0,
                    }),
                    domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
                      id: '5678',
                      requiredPixScore,
                      offsetVersion: 1,
                    }),
                    domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
                      id: complementaryCertificationBadgeId,
                      requiredPixScore,
                      offsetVersion: 2,
                    }),
                  ]);
                });
                it('should not be added in the eligibilities of the model', async function () {
                  // given
                  certificationBadgesService.findLatestBadgeAcquisitions
                    .withArgs({
                      userId,
                      limitDate,
                    })
                    .resolves([
                      domainBuilder.buildCertifiableBadgeAcquisition({
                        complementaryCertificationBadgeId,
                        complementaryCertificationKey,
                        complementaryCertificationBadgeImageUrl: 'monImageUrl',
                        complementaryCertificationBadgeLabel: 'monLabel',
                        isOutdated,
                      }),
                    ]);

                  // when
                  const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

                  // then
                  expect(userCertificationEligibility).to.deep.equal(
                    domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                      id: userId,
                      isCertifiable,
                      certificationEligibilities: [],
                    }),
                  );
                });
              });
              context('when badge is outdated by exactly one version', function () {
                const offsetVersion = 1;
                it('returns a UserCertificationEligibility model with the outdated eligibility inside', async function () {
                  // given
                  certificationBadgesService.findLatestBadgeAcquisitions
                    .withArgs({
                      userId,
                      limitDate,
                    })
                    .resolves([
                      domainBuilder.buildCertifiableBadgeAcquisition({
                        complementaryCertificationBadgeId,
                        complementaryCertificationKey,
                        complementaryCertificationBadgeImageUrl: 'monImageUrl',
                        complementaryCertificationBadgeLabel: 'monLabel',
                        isOutdated,
                        offsetVersion,
                      }),
                    ]);

                  // when
                  const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

                  // then
                  expect(userCertificationEligibility).to.deep.equal(
                    domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                      id: userId,
                      isCertifiable,
                      certificationEligibilities: [
                        domainBuilder.certification.enrolment.buildV3CertificationEligibility({
                          label: 'monLabel',
                          imageUrl: 'monImageUrl',
                          isAcquiredExpectedLevel: false,
                          isOutdated: true,
                        }),
                      ],
                    }),
                  );
                });
              });
            });
          });
          context('when user is not certifiable', function () {
            const isCertifiable = false;
            beforeEach(function () {
              placementProfileService.getPlacementProfile.withArgs({ userId, limitDate }).resolves(
                domainBuilder.buildPlacementProfile({
                  profileDate: limitDate,
                  userId,
                  userCompetences: [domainBuilder.buildUserCompetence({ estimatedLevel: 1, pixScore: 1 })],
                }),
              );
            });
            context('when user has an acquired certification for this badge', function () {
              it('should not be added in the eligibilities of the model', async function () {
                // given
                complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([
                  domainBuilder.certification.enrolment.buildComplementaryCertificationCourseWithResults({
                    complementaryCertificationBadgeId,
                    results: [
                      {
                        source: sources.PIX,
                        acquired: true,
                        complementaryCertificationBadgeId,
                      },
                    ],
                  }),
                ]);

                certificationBadgesService.findLatestBadgeAcquisitions
                  .withArgs({
                    userId,
                    limitDate,
                  })
                  .resolves([
                    domainBuilder.buildCertifiableBadgeAcquisition({
                      complementaryCertificationBadgeId,
                      complementaryCertificationKey,
                      complementaryCertificationBadgeImageUrl: 'monImageUrl',
                      complementaryCertificationBadgeLabel: 'monLabel',
                      isOutdated: true,
                      offsetVersion: 1,
                    }),
                  ]);

                // when
                const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

                // then
                expect(userCertificationEligibility).to.deep.equal(
                  domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                    id: userId,
                    isCertifiable,
                    certificationEligibilities: [],
                  }),
                );
              });
            });
            context('when user has not an acquired certification for this badge', function () {
              beforeEach(function () {
                complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([]);
              });

              context('when badge is outdated by more than one version', function () {
                const offsetVersion = 2;
                it('should not be added in the eligibilities of the model', async function () {
                  // given
                  certificationBadgesService.findLatestBadgeAcquisitions
                    .withArgs({
                      userId,
                      limitDate,
                    })
                    .resolves([
                      domainBuilder.buildCertifiableBadgeAcquisition({
                        complementaryCertificationBadgeId,
                        complementaryCertificationKey,
                        complementaryCertificationBadgeImageUrl: 'monImageUrl',
                        complementaryCertificationBadgeLabel: 'monLabel',
                        isOutdated,
                        offsetVersion,
                      }),
                    ]);

                  // when
                  const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

                  // then
                  expect(userCertificationEligibility).to.deep.equal(
                    domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                      id: userId,
                      isCertifiable,
                      certificationEligibilities: [],
                    }),
                  );
                });
              });
              context('when badge is outdated by exactly one version', function () {
                const offsetVersion = 1;
                it('should not be added in the eligibilities of the model', async function () {
                  // given
                  certificationBadgesService.findLatestBadgeAcquisitions
                    .withArgs({
                      userId,
                      limitDate,
                    })
                    .resolves([
                      domainBuilder.buildCertifiableBadgeAcquisition({
                        complementaryCertificationBadgeId,
                        complementaryCertificationKey,
                        complementaryCertificationBadgeImageUrl: 'monImageUrl',
                        complementaryCertificationBadgeLabel: 'monLabel',
                        isOutdated,
                        offsetVersion,
                      }),
                    ]);

                  // when
                  const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

                  // then
                  expect(userCertificationEligibility).to.deep.equal(
                    domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                      id: userId,
                      isCertifiable,
                      certificationEligibilities: [],
                    }),
                  );
                });
              });
            });
          });
        });
        context('when acquired badge is not outdated', function () {
          const isOutdated = false;
          beforeEach(function () {
            complementaryCertificationBadgeRepository.findAll.resolves([
              domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
                id: complementaryCertificationBadgeId,
                requiredPixScore,
                offsetVersion: 0,
              }),
            ]);
          });
          context('when user is certifiable', function () {
            const isCertifiable = true;
            beforeEach(function () {
              placementProfileService.getPlacementProfile.withArgs({ userId, limitDate }).resolves(
                domainBuilder.buildPlacementProfile.buildCertifiable({
                  profileDate: limitDate,
                  userId,
                }),
              );
            });
            context('when user has an acquired certification for this badge', function () {
              it('returns a UserCertificationEligibility model with the corresponding eligibility', async function () {
                // given
                complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([
                  domainBuilder.certification.enrolment.buildComplementaryCertificationCourseWithResults({
                    complementaryCertificationBadgeId,
                    results: [
                      {
                        source: sources.PIX,
                        acquired: true,
                        complementaryCertificationBadgeId,
                      },
                    ],
                  }),
                ]);

                certificationBadgesService.findLatestBadgeAcquisitions
                  .withArgs({
                    userId,
                    limitDate,
                  })
                  .resolves([
                    domainBuilder.buildCertifiableBadgeAcquisition({
                      complementaryCertificationBadgeId,
                      complementaryCertificationKey,
                      complementaryCertificationBadgeImageUrl: 'monImageUrl',
                      complementaryCertificationBadgeLabel: 'monLabel',
                      isOutdated,
                    }),
                  ]);

                // when
                const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

                // then
                expect(userCertificationEligibility).to.deep.equal(
                  domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                    id: userId,
                    isCertifiable,
                    certificationEligibilities: [
                      domainBuilder.certification.enrolment.buildV3CertificationEligibility({
                        label: 'monLabel',
                        imageUrl: 'monImageUrl',
                        isAcquiredExpectedLevel: true,
                        isOutdated,
                      }),
                    ],
                  }),
                );
              });
            });
            context('when user has not an acquired certification for this badge', function () {
              beforeEach(function () {
                complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([]);
              });
              it('returns a UserCertificationEligibility model with the corresponding eligibility', async function () {
                // given
                certificationBadgesService.findLatestBadgeAcquisitions
                  .withArgs({
                    userId,
                    limitDate,
                  })
                  .resolves([
                    domainBuilder.buildCertifiableBadgeAcquisition({
                      complementaryCertificationBadgeId,
                      complementaryCertificationKey,
                      complementaryCertificationBadgeImageUrl: 'monImageUrl',
                      complementaryCertificationBadgeLabel: 'monLabel',
                      isOutdated,
                    }),
                  ]);

                // when
                const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

                // then
                expect(userCertificationEligibility).to.deep.equal(
                  domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                    id: userId,
                    isCertifiable,
                    certificationEligibilities: [
                      domainBuilder.certification.enrolment.buildV3CertificationEligibility({
                        label: 'monLabel',
                        imageUrl: 'monImageUrl',
                        isAcquiredExpectedLevel: false,
                        isOutdated,
                      }),
                    ],
                  }),
                );
              });
            });
          });
          context('when user is not certifiable', function () {
            const isCertifiable = false;
            beforeEach(function () {
              placementProfileService.getPlacementProfile.withArgs({ userId, limitDate }).resolves(
                domainBuilder.buildPlacementProfile({
                  profileDate: limitDate,
                  userId,
                  userCompetences: [domainBuilder.buildUserCompetence({ estimatedLevel: 1, pixScore: 1 })],
                }),
              );
            });
            context('when user has an acquired certification for this badge', function () {
              it('should not be added in the eligibilities of the model', async function () {
                // given
                complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([
                  domainBuilder.certification.enrolment.buildComplementaryCertificationCourseWithResults({
                    complementaryCertificationBadgeId,
                    results: [
                      {
                        source: sources.PIX,
                        acquired: true,
                        complementaryCertificationBadgeId,
                      },
                    ],
                  }),
                ]);

                certificationBadgesService.findLatestBadgeAcquisitions
                  .withArgs({
                    userId,
                    limitDate,
                  })
                  .resolves([
                    domainBuilder.buildCertifiableBadgeAcquisition({
                      complementaryCertificationBadgeId,
                      complementaryCertificationKey,
                      complementaryCertificationBadgeImageUrl: 'monImageUrl',
                      complementaryCertificationBadgeLabel: 'monLabel',
                      isOutdated,
                    }),
                  ]);

                // when
                const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

                // then
                expect(userCertificationEligibility).to.deep.equal(
                  domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                    id: userId,
                    isCertifiable,
                    certificationEligibilities: [],
                  }),
                );
              });
            });
            context('when user has not an acquired certification for this badge', function () {
              beforeEach(function () {
                complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([]);
              });

              it('should not be added in the eligibilities of the model', async function () {
                // given
                complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([
                  domainBuilder.certification.enrolment.buildComplementaryCertificationCourseWithResults({
                    complementaryCertificationBadgeId,
                    results: [
                      {
                        source: sources.PIX,
                        acquired: true,
                        complementaryCertificationBadgeId,
                      },
                    ],
                  }),
                ]);

                certificationBadgesService.findLatestBadgeAcquisitions
                  .withArgs({
                    userId,
                    limitDate,
                  })
                  .resolves([
                    domainBuilder.buildCertifiableBadgeAcquisition({
                      complementaryCertificationBadgeId,
                      complementaryCertificationKey,
                      complementaryCertificationBadgeImageUrl: 'monImageUrl',
                      complementaryCertificationBadgeLabel: 'monLabel',
                      isOutdated,
                    }),
                  ]);

                // when
                const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

                // then
                expect(userCertificationEligibility).to.deep.equal(
                  domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                    id: userId,
                    isCertifiable,
                    certificationEligibilities: [],
                  }),
                );
              });
            });
          });
        });
      });
      context('not CLEA', function () {
        const isCertifiable = true;
        beforeEach(function () {
          placementProfileService.getPlacementProfile.withArgs({ userId, limitDate }).resolves(
            domainBuilder.buildPlacementProfile.buildCertifiable({
              profileDate: limitDate,
              userId,
            }),
          );
          complementaryCertificationKey = 'NOT CLEA';
          complementaryCertificationBadgeRepository.findAll.resolves([
            domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
              id: complementaryCertificationBadgeId,
              requiredPixScore,
              offsetVersion: 0,
            }),
          ]);
        });

        context('when user has no pix certification', function () {
          const isOutdated = false;
          beforeEach(function () {
            pixCertificationRepository.findByUserId.withArgs({ userId }).resolves([]);
          });
          it('should not be added in the eligibilities of the model', async function () {
            complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([]);
            certificationBadgesService.findLatestBadgeAcquisitions
              .withArgs({
                userId,
                limitDate,
              })
              .resolves([
                domainBuilder.buildCertifiableBadgeAcquisition({
                  complementaryCertificationBadgeId,
                  complementaryCertificationKey,
                  complementaryCertificationBadgeImageUrl: 'monImageUrl',
                  complementaryCertificationBadgeLabel: 'monLabel',
                  isOutdated,
                }),
              ]);

            const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

            expect(userCertificationEligibility).to.deep.equal(
              domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                id: userId,
                isCertifiable,
                certificationEligibilities: [],
              }),
            );
          });
        });
        context(
          'when user has a validated certification that is not cancelled not rejected and without the required pixscore',
          function () {
            const isOutdated = false;
            beforeEach(function () {
              pixCertificationRepository.findByUserId.withArgs({ userId }).resolves([
                domainBuilder.certification.enrolment.buildPixCertification({
                  pixScore: requiredPixScore - 1,
                  status: AssessmentResult.status.VALIDATED,
                  isCancelled: false,
                  isRejectedForFraud: false,
                }),
              ]);
            });
            it('should not be added in the eligibilities of the model', async function () {
              complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([]);
              certificationBadgesService.findLatestBadgeAcquisitions
                .withArgs({
                  userId,
                  limitDate,
                })
                .resolves([
                  domainBuilder.buildCertifiableBadgeAcquisition({
                    complementaryCertificationBadgeId,
                    complementaryCertificationKey,
                    complementaryCertificationBadgeImageUrl: 'monImageUrl',
                    complementaryCertificationBadgeLabel: 'monLabel',
                    isOutdated,
                  }),
                ]);

              const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

              expect(userCertificationEligibility).to.deep.equal(
                domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                  id: userId,
                  isCertifiable,
                  certificationEligibilities: [],
                }),
              );
            });
          },
        );
        context(
          'when user has a validated and cancelled certification that is not rejected for fraud and with the required pixscore',
          function () {
            const isOutdated = false;
            beforeEach(function () {
              pixCertificationRepository.findByUserId.withArgs({ userId }).resolves([
                domainBuilder.certification.enrolment.buildPixCertification({
                  pixScore: requiredPixScore,
                  status: AssessmentResult.status.VALIDATED,
                  isCancelled: true,
                  isRejectedForFraud: false,
                }),
              ]);
            });
            it('should not be added in the eligibilities of the model', async function () {
              complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([]);
              certificationBadgesService.findLatestBadgeAcquisitions
                .withArgs({
                  userId,
                  limitDate,
                })
                .resolves([
                  domainBuilder.buildCertifiableBadgeAcquisition({
                    complementaryCertificationBadgeId,
                    complementaryCertificationKey,
                    complementaryCertificationBadgeImageUrl: 'monImageUrl',
                    complementaryCertificationBadgeLabel: 'monLabel',
                    isOutdated,
                  }),
                ]);

              const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

              expect(userCertificationEligibility).to.deep.equal(
                domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                  id: userId,
                  isCertifiable,
                  certificationEligibilities: [],
                }),
              );
            });
          },
        );
        context(
          'when user has not cancelled but rejected for fraud validated pix certification with the required pix score',
          function () {
            const isOutdated = false;
            beforeEach(function () {
              pixCertificationRepository.findByUserId.withArgs({ userId }).resolves([
                domainBuilder.certification.enrolment.buildPixCertification({
                  pixScore: requiredPixScore,
                  status: AssessmentResult.status.VALIDATED,
                  isCancelled: false,
                  isRejectedForFraud: true,
                }),
              ]);
            });
            it('should not be added in the eligibilities of the model', async function () {
              complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([]);
              certificationBadgesService.findLatestBadgeAcquisitions
                .withArgs({
                  userId,
                  limitDate,
                })
                .resolves([
                  domainBuilder.buildCertifiableBadgeAcquisition({
                    complementaryCertificationBadgeId,
                    complementaryCertificationKey,
                    complementaryCertificationBadgeImageUrl: 'monImageUrl',
                    complementaryCertificationBadgeLabel: 'monLabel',
                    isOutdated,
                  }),
                ]);

              const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

              expect(userCertificationEligibility).to.deep.equal(
                domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                  id: userId,
                  isCertifiable,
                  certificationEligibilities: [],
                }),
              );
            });
          },
        );
        context('when user has not cancelled not rejected for fraud but not validated pix certification', function () {
          const isOutdated = false;
          beforeEach(function () {
            pixCertificationRepository.findByUserId.withArgs({ userId }).resolves([
              domainBuilder.certification.enrolment.buildPixCertification({
                pixScore: requiredPixScore,
                status: AssessmentResult.status.REJECTED,
                isCancelled: true,
                isRejectedForFraud: false,
              }),
            ]);
          });
          it('should not be added in the eligibilities of the model', async function () {
            complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([]);
            certificationBadgesService.findLatestBadgeAcquisitions
              .withArgs({
                userId,
                limitDate,
              })
              .resolves([
                domainBuilder.buildCertifiableBadgeAcquisition({
                  complementaryCertificationBadgeId,
                  complementaryCertificationKey,
                  complementaryCertificationBadgeImageUrl: 'monImageUrl',
                  complementaryCertificationBadgeLabel: 'monLabel',
                  isOutdated,
                }),
              ]);

            const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

            expect(userCertificationEligibility).to.deep.equal(
              domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                id: userId,
                isCertifiable,
                certificationEligibilities: [],
              }),
            );
          });
        });
        context('when user has a pix certification delivered validated with the required pix score', function () {
          beforeEach(function () {
            pixCertificationRepository.findByUserId.withArgs({ userId }).resolves([
              domainBuilder.certification.enrolment.buildPixCertification({
                pixScore: requiredPixScore,
                status: AssessmentResult.status.VALIDATED,
                isCancelled: false,
                isRejectedForFraud: false,
              }),
            ]);
          });
          context('when acquired badge is not outdated', function () {
            const isOutdated = false;
            context('when user has an acquired certification for this badge', function () {
              it('returns a UserCertificationEligibility model with the outdated eligibility inside', async function () {
                // given
                complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([
                  domainBuilder.certification.enrolment.buildComplementaryCertificationCourseWithResults({
                    complementaryCertificationBadgeId,
                    results: [
                      {
                        source: sources.PIX,
                        acquired: true,
                        complementaryCertificationBadgeId,
                      },
                    ],
                  }),
                ]);
                certificationBadgesService.findLatestBadgeAcquisitions
                  .withArgs({
                    userId,
                    limitDate,
                  })
                  .resolves([
                    domainBuilder.buildCertifiableBadgeAcquisition({
                      complementaryCertificationBadgeId,
                      complementaryCertificationKey,
                      complementaryCertificationBadgeImageUrl: 'monImageUrl',
                      complementaryCertificationBadgeLabel: 'monLabel',
                      isOutdated,
                    }),
                  ]);

                // when
                const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

                // then
                expect(userCertificationEligibility).to.deep.equal(
                  domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                    id: userId,
                    isCertifiable,
                    certificationEligibilities: [
                      domainBuilder.certification.enrolment.buildV3CertificationEligibility({
                        label: 'monLabel',
                        imageUrl: 'monImageUrl',
                        isAcquiredExpectedLevel: true,
                        isOutdated: false,
                      }),
                    ],
                  }),
                );
              });
            });
            context('when user has not an acquired certification for this badge', function () {
              beforeEach(function () {
                complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([]);
              });
              it('returns a UserCertificationEligibility model with the outdated eligibility inside', async function () {
                // given
                certificationBadgesService.findLatestBadgeAcquisitions
                  .withArgs({
                    userId,
                    limitDate,
                  })
                  .resolves([
                    domainBuilder.buildCertifiableBadgeAcquisition({
                      complementaryCertificationBadgeId,
                      complementaryCertificationKey,
                      complementaryCertificationBadgeImageUrl: 'monImageUrl',
                      complementaryCertificationBadgeLabel: 'monLabel',
                      isOutdated,
                    }),
                  ]);

                // when
                const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

                // then
                expect(userCertificationEligibility).to.deep.equal(
                  domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                    id: userId,
                    isCertifiable,
                    certificationEligibilities: [
                      domainBuilder.certification.enrolment.buildV3CertificationEligibility({
                        label: 'monLabel',
                        imageUrl: 'monImageUrl',
                        isAcquiredExpectedLevel: false,
                        isOutdated: false,
                      }),
                    ],
                  }),
                );
              });
            });
          });
          context('when acquired badge is outdated by one version', function () {
            const isOutdated = true;
            context('when user has an acquired certification for this badge', function () {
              it('should not be added in the eligibilities of the model', async function () {
                // given
                complementaryCertificationBadgeRepository.findAll.resolves([
                  domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
                    id: '1234',
                    requiredPixScore,
                    offsetVersion: 0,
                  }),
                  domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
                    id: complementaryCertificationBadgeId,
                    requiredPixScore,
                    offsetVersion: 1,
                  }),
                ]);

                complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([
                  domainBuilder.certification.enrolment.buildComplementaryCertificationCourseWithResults({
                    complementaryCertificationBadgeId,
                    results: [
                      {
                        source: sources.PIX,
                        acquired: true,
                        complementaryCertificationBadgeId,
                      },
                    ],
                  }),
                ]);
                certificationBadgesService.findLatestBadgeAcquisitions
                  .withArgs({
                    userId,
                    limitDate,
                  })
                  .resolves([
                    domainBuilder.buildCertifiableBadgeAcquisition({
                      complementaryCertificationBadgeId,
                      complementaryCertificationKey,
                      complementaryCertificationBadgeImageUrl: 'monImageUrl',
                      complementaryCertificationBadgeLabel: 'monLabel',
                      isOutdated,
                    }),
                  ]);

                // when
                const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

                // then
                expect(userCertificationEligibility).to.deep.equal(
                  domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                    id: userId,
                    isCertifiable,
                    certificationEligibilities: [],
                  }),
                );
              });
            });
            context('when user has not an acquired certification for this badge', function () {
              beforeEach(function () {
                complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([]);
              });
              it('returns a UserCertificationEligibility model with the outdated eligibility inside', async function () {
                // given
                certificationBadgesService.findLatestBadgeAcquisitions
                  .withArgs({
                    userId,
                    limitDate,
                  })
                  .resolves([
                    domainBuilder.buildCertifiableBadgeAcquisition({
                      complementaryCertificationBadgeId,
                      complementaryCertificationKey,
                      complementaryCertificationBadgeImageUrl: 'monImageUrl',
                      complementaryCertificationBadgeLabel: 'monLabel',
                      isOutdated,
                    }),
                  ]);

                // when
                const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

                // then
                expect(userCertificationEligibility).to.deep.equal(
                  domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                    id: userId,
                    isCertifiable,
                    certificationEligibilities: [
                      domainBuilder.certification.enrolment.buildV3CertificationEligibility({
                        label: 'monLabel',
                        imageUrl: 'monImageUrl',
                        isAcquiredExpectedLevel: false,
                        isOutdated,
                      }),
                    ],
                  }),
                );
              });
            });
          });
          context('when acquired badge is outdated by more than one version', function () {
            const isOutdated = true;
            it('should not be added in the eligibilities of the model', async function () {
              // given
              complementaryCertificationBadgeRepository.findAll.resolves([
                domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
                  id: '1234',
                  requiredPixScore,
                  offsetVersion: 0,
                }),
                domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
                  id: '5678',
                  requiredPixScore,
                  offsetVersion: 1,
                }),
                domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
                  id: complementaryCertificationBadgeId,
                  requiredPixScore,
                  offsetVersion: 2,
                }),
              ]);

              complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([
                domainBuilder.certification.enrolment.buildComplementaryCertificationCourseWithResults({
                  complementaryCertificationBadgeId,
                  results: [
                    {
                      source: sources.PIX,
                      acquired: true,
                      complementaryCertificationBadgeId,
                    },
                  ],
                }),
              ]);
              certificationBadgesService.findLatestBadgeAcquisitions
                .withArgs({
                  userId,
                  limitDate,
                })
                .resolves([
                  domainBuilder.buildCertifiableBadgeAcquisition({
                    complementaryCertificationBadgeId,
                    complementaryCertificationKey,
                    complementaryCertificationBadgeImageUrl: 'monImageUrl',
                    complementaryCertificationBadgeLabel: 'monLabel',
                    isOutdated,
                  }),
                ]);

              // when
              const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

              // then
              expect(userCertificationEligibility).to.deep.equal(
                domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                  id: userId,
                  isCertifiable,
                  certificationEligibilities: [],
                }),
              );
            });
          });
        });
      });
    });
  });
});
