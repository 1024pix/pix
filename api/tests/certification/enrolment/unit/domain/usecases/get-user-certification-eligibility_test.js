import { getUserCertificationEligibility } from '../../../../../../src/certification/enrolment/domain/usecases/get-user-certification-eligibility.js';
import { sources } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Usecases | get-user-certification-eligibility', function () {
  const userId = 123;
  const limitDate = new Date('2024-09-06');
  let dependencies;
  const placementProfileService = {};
  const certificationBadgesService = {};
  const complementaryCertificationCourseRepository = {};

  beforeEach(function () {
    placementProfileService.getPlacementProfile = sinon.stub();
    certificationBadgesService.findLatestBadgeAcquisitions = sinon.stub();
    complementaryCertificationCourseRepository.findByUserId = sinon.stub();
    dependencies = {
      userId,
      limitDate,
      placementProfileService,
      certificationBadgesService,
      complementaryCertificationCourseRepository,
    };
  });

  context('certificability', function () {
    beforeEach(function () {
      certificationBadgesService.findLatestBadgeAcquisitions.resolves([]);
      complementaryCertificationCourseRepository.findByUserId.resolves([]);
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
    const isCertifiable = true;
    beforeEach(function () {
      placementProfileService.getPlacementProfile.withArgs({ userId, limitDate }).resolves(
        domainBuilder.buildPlacementProfile.buildCertifiable({
          profileDate: limitDate,
          userId,
        }),
      );
    });

    context('when user has not acquired any certifiable badge', function () {
      it('returns a UserCertificationEligibility model with no eligibilities  ', async function () {
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
            isCertifiable,
            certificationEligibilities: [],
          }),
        );
      });
    });

    context('when user has acquired a badge', function () {
      context('when acquired badge is outdated', function () {
        context('when user has an acquired certification for this badge', function () {
          it('should not be added in the eligibilities of the model', async function () {});
        });
        context('when user has not an acquired certification for this badge', function () {
          context('when badge is outdated by more than one version', function () {
            it('should not be added in the eligibilities of the model', async function () {});
          });
          context('when badge is outdated by exactly one version', function () {
            it('returns a UserCertificationEligibility model with the outdated eligibility inside', async function () {});
          });
        });
      });
      context('when acquired badge is not outdated', function () {
        const complementaryCertificationBadgeId = 123;
        context('when user has acquired a certification for this badge', function () {
          it('returns a UserCertificationEligibility model with the corresponding eligibility', async function () {
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
                certificationEligibilities: [
                  domainBuilder.certification.enrolment.buildV3CertificationEligibility({
                    label: 'monLabel',
                    imageUrl: 'monImageUrl',
                    isOutdated: false,
                    isAcquiredExpectedLevel: true,
                  }),
                ],
              }),
            );
          });
        });
        context('when user has not acquired a certification for this badge', function () {
          it('returns a UserCertificationEligibility model with the corresponding eligibility', async function () {
            complementaryCertificationCourseRepository.findByUserId.withArgs({ userId }).resolves([
              domainBuilder.certification.enrolment.buildComplementaryCertificationCourseWithResults({
                complementaryCertificationBadgeId,
                results: [
                  {
                    source: sources.PIX,
                    acquired: true,
                    complementaryCertificationBadgeId: 'someOtherBadgeId',
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
                certificationEligibilities: [
                  domainBuilder.certification.enrolment.buildV3CertificationEligibility({
                    label: 'monLabel',
                    imageUrl: 'monImageUrl',
                    isOutdated: false,
                    isAcquiredExpectedLevel: false,
                  }),
                ],
              }),
            );
          });
        });
      });
    });
  });
});
