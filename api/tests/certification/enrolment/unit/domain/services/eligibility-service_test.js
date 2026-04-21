import sinon from 'sinon';

import { getUserCertificationEligibility } from '../../../../../../src/certification/enrolment/domain/services/eligibility-service.js';
import { ComplementaryCertificationCourseResult } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Enrolment | Unit | Services | eligibility-service', function () {
  const userId = 123;
  const limitDate = new Date('2024-09-06');
  let dependencies;
  const placementProfileService = {};
  const certificationBadgesService = {};
  const complementaryCertificationCourseRepository = {};
  const pixCertificationRepository = {};
  const complementaryCertificationBadgeWithOffsetVersionRepository = {};

  beforeEach(function () {
    placementProfileService.getPlacementProfile = sinon.stub();
    certificationBadgesService.findLatestBadgeAcquisitions = sinon.stub();
    complementaryCertificationCourseRepository.findByUserId = sinon.stub();
    complementaryCertificationBadgeWithOffsetVersionRepository.getAllWithSameTargetProfile = sinon.stub();
    dependencies = {
      userId,
      limitDate,
      placementProfileService,
      certificationBadgesService,
      complementaryCertificationCourseRepository,
      pixCertificationRepository,
      complementaryCertificationBadgeWithOffsetVersionRepository,
    };
  });

  context('certificability', function () {
    beforeEach(function () {
      certificationBadgesService.findLatestBadgeAcquisitions.resolves([]);
      complementaryCertificationCourseRepository.findByUserId.resolves([]);
      complementaryCertificationBadgeWithOffsetVersionRepository.getAllWithSameTargetProfile.resolves([]);
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
            doubleCertificationEligibility: null,
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
            doubleCertificationEligibility: null,
          }),
        );
      });
    });
  });

  context('eligibility', function () {
    const complementaryCertificationBadgeId = 123;

    context('when user is certifiable', function () {
      context('when user has acquired a non double certification badge', function () {
        it('should not be added in the eligibilities of the model', async function () {
          const complementaryCertificationKey = 'NOT_DOUBLE_CERTIFICATION';
          const isCertifiable = true;

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
            .resolves([
              domainBuilder.buildCertifiableBadgeAcquisition({
                complementaryCertificationBadgeId,
                complementaryCertificationKey,
                complementaryCertificationBadgeImageUrl: 'monImageUrl',
                complementaryCertificationBadgeLabel: 'monLabel',
                isOutdated: false,
              }),
            ]);

          const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

          expect(userCertificationEligibility).to.deep.equal(
            domainBuilder.certification.enrolment.buildUserCertificationEligibility({
              id: userId,
              isCertifiable,
              doubleCertificationEligibility: null,
            }),
          );
        });
      });

      context('when user has acquired a double certification badge', function () {
        let complementaryCertificationKey;
        const requiredPixScore = 150;

        beforeEach(function () {
          complementaryCertificationKey = ComplementaryCertificationKeys.CLEA;
        });

        context('when acquired badge is outdated', function () {
          const isOutdated = true;

          context('when user has an acquired certification for this badge', function () {
            it('should not be added in the eligibilities of the model', async function () {
              // given
              complementaryCertificationBadgeWithOffsetVersionRepository.getAllWithSameTargetProfile.resolves([
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
              placementProfileService.getPlacementProfile.withArgs({ userId, limitDate }).resolves(
                domainBuilder.buildPlacementProfile.buildCertifiable({
                  profileDate: limitDate,
                  userId,
                }),
              );

              complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([
                domainBuilder.certification.enrolment.buildComplementaryCertificationCourseWithResults({
                  complementaryCertificationBadgeId,
                  results: [
                    {
                      source: ComplementaryCertificationCourseResult.sources.PIX,
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
                  isCertifiable: true,
                  doubleCertificationEligibility: null,
                }),
              );
            });
          });

          context('when user has not an acquired certification for this badge', function () {
            context('when badge is outdated by more than one version', function () {
              it('should not be added in the eligibilities of the model', async function () {
                // given
                complementaryCertificationBadgeWithOffsetVersionRepository.getAllWithSameTargetProfile.resolves([
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
                placementProfileService.getPlacementProfile.withArgs({ userId, limitDate }).resolves(
                  domainBuilder.buildPlacementProfile.buildCertifiable({
                    profileDate: limitDate,
                    userId,
                  }),
                );
                complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([]);
                complementaryCertificationBadgeWithOffsetVersionRepository.getAllWithSameTargetProfile.resolves([
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
                    isCertifiable: true,
                    doubleCertificationEligibility: null,
                  }),
                );
              });
            });

            context('when badge is outdated by exactly one version', function () {
              const offsetVersion = 1;

              it('returns a UserCertificationEligibility model with the outdated eligibility inside', async function () {
                // given
                complementaryCertificationBadgeWithOffsetVersionRepository.getAllWithSameTargetProfile.resolves([
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
                placementProfileService.getPlacementProfile.withArgs({ userId, limitDate }).resolves(
                  domainBuilder.buildPlacementProfile.buildCertifiable({
                    profileDate: limitDate,
                    userId,
                  }),
                );
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
                      offsetVersion,
                    }),
                  ]);

                // when
                const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

                // then
                expect(userCertificationEligibility).to.deep.equal(
                  domainBuilder.certification.enrolment.buildUserCertificationEligibility({
                    id: userId,
                    isCertifiable: true,
                    doubleCertificationEligibility: domainBuilder.certification.enrolment.buildCertificationEligibility(
                      {
                        label: 'monLabel',
                        imageUrl: 'monImageUrl',
                        validatedDoubleCertification: false,
                        isBadgeValid: false,
                      },
                    ),
                  }),
                );
              });
            });
          });
        });

        context('when acquired badge is not outdated', function () {
          const isOutdated = false;

          it('returns a UserCertificationEligibility model with the corresponding eligibility', async function () {
            // given
            complementaryCertificationBadgeWithOffsetVersionRepository.getAllWithSameTargetProfile.resolves([
              domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
                id: complementaryCertificationBadgeId,
                requiredPixScore,
                offsetVersion: 0,
              }),
            ]);
            placementProfileService.getPlacementProfile.withArgs({ userId, limitDate }).resolves(
              domainBuilder.buildPlacementProfile.buildCertifiable({
                profileDate: limitDate,
                userId,
              }),
            );
            complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([
              domainBuilder.certification.enrolment.buildComplementaryCertificationCourseWithResults({
                complementaryCertificationBadgeId,
                results: [
                  {
                    source: ComplementaryCertificationCourseResult.sources.PIX,
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
                isCertifiable: true,
                doubleCertificationEligibility: domainBuilder.certification.enrolment.buildCertificationEligibility({
                  label: 'monLabel',
                  imageUrl: 'monImageUrl',
                  validatedDoubleCertification: true,
                  isBadgeValid: true,
                }),
              }),
            );
          });
        });
      });
    });
  });
});
