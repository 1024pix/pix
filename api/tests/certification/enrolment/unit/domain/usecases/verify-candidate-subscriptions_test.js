// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable mocha/no-setup-in-describe */
import { CertificationCandidateEligibilityError } from '../../../../../../src/certification/enrolment/domain/errors.js';
import { verifyCandidateSubscriptions } from '../../../../../../src/certification/enrolment/domain/usecases/verify-candidate-subscriptions.js';
import { CERTIFICATION_VERSIONS } from '../../../../../../src/certification/shared/domain/models/CertificationVersion.js';
import { UserNotAuthorizedToCertifyError } from '../../../../../../src/shared/domain/errors.js';
import { AssessmentResult } from '../../../../../../src/shared/domain/models/index.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Domain | UseCase | verify-candidate-subscriptions', function () {
  let session;
  const dependencies = {};

  context('when a candidate has subscribed to a core certification', function () {
    context('when user profile is not certifiable', function () {
      it('should throw an error', async function () {
        // given
        dependencies.sessionRepository = {
          get: sinon.stub(),
        };
        dependencies.placementProfileService = {
          getPlacementProfile: sinon.stub().resolves({ isCertifiable: sinon.stub().returns(false) }),
        };

        const candidate = domainBuilder.certification.enrolment.buildCandidate({
          userId: null,
          subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
        });

        // when
        const error = await catchErr(verifyCandidateSubscriptions)({
          userId: 2,
          candidate,
          ...dependencies,
        });

        //then
        expect(error).to.be.instanceOf(UserNotAuthorizedToCertifyError);
      });
    });
  });

  context('when session is v2', function () {
    it('should not check eligibility', async function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        userId: 100200,
        reconciledAt: new Date(),
        subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
      });
      session = domainBuilder.certification.enrolment.buildSession({ id: 1234, version: CERTIFICATION_VERSIONS.V2 });
      dependencies.sessionRepository = {
        get: sinon.stub().resolves(session),
      };
      dependencies.placementProfileService = {
        getPlacementProfile: sinon.stub().resolves({ isCertifiable: sinon.stub().returns(true) }),
      };
      dependencies.pixCertificationRepository = {
        findByUserId: sinon.stub(),
      };

      // when
      await verifyCandidateSubscriptions({
        candidate,
        ...dependencies,
      });

      // then
      expect(dependencies.placementProfileService.getPlacementProfile).to.have.been.calledWithExactly({
        userId: candidate.userId,
        limitDate: candidate.reconciledAt,
      });

      expect(dependencies.pixCertificationRepository.findByUserId).to.not.have.been.called;
    });
  });

  context('when session is v3', function () {
    beforeEach(function () {
      session = domainBuilder.certification.enrolment.buildSession({ id: 1234, version: CERTIFICATION_VERSIONS.V3 });
      dependencies.sessionRepository = {
        get: sinon.stub().resolves(session),
      };

      dependencies.pixCertificationRepository = {
        findByUserId: sinon.stub(),
      };

      dependencies.certificationBadgesService = {
        findLatestBadgeAcquisitions: sinon.stub(),
      };
      dependencies.placementProfileService = {
        getPlacementProfile: sinon.stub().resolves({ isCertifiable: sinon.stub().returns(true) }),
      };
      dependencies.complementaryCertificationBadgeRepository = {
        findAll: sinon.stub(),
      };
    });

    context('when candidate has only core subscriptions', function () {
      it('should resolve', async function () {
        // given
        const certificationCandidateId = 456;
        const candidate = domainBuilder.certification.enrolment.buildCandidate({
          id: certificationCandidateId,
          userId: null,
          subscriptions: [
            domainBuilder.certification.enrolment.buildCoreSubscription({
              certificationCandidateId,
            }),
          ],
        });

        // when
        // then
        expect(async () => {
          await verifyCandidateSubscriptions({
            userId: 2,
            candidate,
            ...dependencies,
          });
        }).not.to.throw(CertificationCandidateEligibilityError);
      });
    });

    context('when candidate has a core and complementary subscriptions', function () {
      it('should resolve', async function () {
        // given
        const certificationCandidateId = 456;
        const complementaryCertificationId = 123;
        const candidate = domainBuilder.certification.enrolment.buildCandidate({
          id: certificationCandidateId,
          userId: 1234,
          subscriptions: [
            domainBuilder.certification.enrolment.buildCoreSubscription({
              certificationCandidateId,
            }),
            domainBuilder.certification.enrolment.buildComplementarySubscription({
              certificationCandidateId,
              complementaryCertificationId,
            }),
          ],
        });

        // when
        //then
        expect(async () => {
          await verifyCandidateSubscriptions({
            userId: 2,
            candidate,
            ...dependencies,
          });
        }).not.to.throw(CertificationCandidateEligibilityError);
      });
    });

    context('when user has no validated PIX certification', function () {
      [
        domainBuilder.certification.enrolment.buildPixCertification({
          pixScore: 123,
          status: AssessmentResult.status.VALIDATED,
          isCancelled: true,
          isRejectedForFraud: false,
        }),
        domainBuilder.certification.enrolment.buildPixCertification({
          pixScore: 123,
          status: AssessmentResult.status.VALIDATED,
          isCancelled: false,
          isRejectedForFraud: true,
        }),
        domainBuilder.certification.enrolment.buildPixCertification({
          pixScore: 123,
          status: AssessmentResult.status.REJECTED,
          isCancelled: false,
          isRejectedForFraud: false,
        }),
      ].forEach((pixCertification) => {
        it('should throw CertificationCandidateEligibilityError', async function () {
          // given
          const certificationCandidateId = 456;
          const complementaryCertificationId = 789;
          const candidate = domainBuilder.certification.enrolment.buildCandidate({
            id: certificationCandidateId,
            userId: 1234,
            subscriptions: [
              domainBuilder.certification.enrolment.buildComplementarySubscription({
                certificationCandidateId,
                complementaryCertificationId,
              }),
            ],
          });

          dependencies.pixCertificationRepository.findByUserId.resolves([pixCertification]);

          // when
          const error = await catchErr(verifyCandidateSubscriptions)({
            userId: candidate.userId,
            candidate,
            limitDate: Date.now(),
            ...dependencies,
          });

          //then
          expect(error).to.be.instanceOf(CertificationCandidateEligibilityError);
        });
      });
    });

    context('when user has obtained a PIX core certification', function () {
      context('when subscribed complementary certification badge is outdated', function () {
        it('should throw CertificationCandidateEligibilityError', async function () {
          // given
          const certificationCandidateId = 456;
          const complementaryCertificationId = 789;
          const complementaryCertificationBadgeId = 4568;

          const candidate = domainBuilder.certification.enrolment.buildCandidate({
            id: certificationCandidateId,
            userId: 1234,
            subscriptions: [
              domainBuilder.certification.enrolment.buildComplementarySubscription({
                certificationCandidateId,
                complementaryCertificationId,
              }),
            ],
          });

          const complementaryCertificationBadges = [
            domainBuilder.certification.complementary.buildComplementaryCertificationBadge({
              id: complementaryCertificationBadgeId,
              complementaryCertificationId,
              level: 1,
              minimumEarnedPix: 200,
              detachedAt: Date.now(),
            }),
          ];

          dependencies.pixCertificationRepository.findByUserId.resolves([
            domainBuilder.certification.enrolment.buildPixCertification({
              pixScore: 250,
              status: AssessmentResult.status.VALIDATED,
              isCancelled: false,
              isRejectedForFraud: false,
            }),
          ]);

          dependencies.certificationBadgesService.findLatestBadgeAcquisitions.resolves([
            domainBuilder.buildCertifiableBadgeAcquisition({
              complementaryCertificationId,
              complementaryCertificationBadgeId: complementaryCertificationBadgeId,
            }),
          ]);

          dependencies.complementaryCertificationBadgeRepository.findAll.resolves([
            ...complementaryCertificationBadges,
            domainBuilder.certification.complementary.buildComplementaryCertificationBadge({
              id: 9865,
              level: 1,
              minimumEarnedPix: 300,
              complementaryCertificationId: 9865,
            }),
          ]);

          // when
          const error = await catchErr(verifyCandidateSubscriptions)({
            userId: candidate.userId,
            candidate,
            limitDate: Date.now(),
            ...dependencies,
          });

          //then
          expect(error).to.be.instanceOf(CertificationCandidateEligibilityError);
        });
      });
      context('when score is below lower level', function () {
        it('should throw CertificationCandidateEligibilityError', async function () {
          // given
          const certificationCandidateId = 456;
          const complementaryCertificationId = 789;
          const complementaryCertificationBadgeId1 = 4568;
          const complementaryCertificationBadgeId2 = 8798;
          const complementaryCertificationBadgeId3 = 91011;
          const candidate = domainBuilder.certification.enrolment.buildCandidate({
            id: certificationCandidateId,
            userId: 1234,
            subscriptions: [
              domainBuilder.certification.enrolment.buildComplementarySubscription({
                certificationCandidateId,
                complementaryCertificationId,
              }),
            ],
          });

          const complementaryCertificationBadges = [
            domainBuilder.certification.complementary.buildComplementaryCertificationBadge({
              id: complementaryCertificationBadgeId1,
              complementaryCertificationId,
              level: 1,
              minimumEarnedPix: 200,
            }),
            domainBuilder.certification.complementary.buildComplementaryCertificationBadge({
              id: complementaryCertificationBadgeId2,
              complementaryCertificationId,
              level: 2,
              minimumEarnedPix: 300,
            }),
            domainBuilder.certification.complementary.buildComplementaryCertificationBadge({
              id: complementaryCertificationBadgeId3,
              complementaryCertificationId,
              level: 3,
              minimumEarnedPix: 400,
            }),
          ];

          dependencies.pixCertificationRepository.findByUserId.resolves([
            domainBuilder.certification.enrolment.buildPixCertification({
              pixScore: 250,
              status: AssessmentResult.status.VALIDATED,
              isCancelled: false,
              isRejectedForFraud: false,
            }),
          ]);

          dependencies.certificationBadgesService.findLatestBadgeAcquisitions.resolves([
            domainBuilder.buildCertifiableBadgeAcquisition({
              complementaryCertificationId,
              complementaryCertificationBadgeId: complementaryCertificationBadgeId3,
            }),
          ]);

          dependencies.complementaryCertificationBadgeRepository.findAll.resolves([
            ...complementaryCertificationBadges,
            domainBuilder.certification.complementary.buildComplementaryCertificationBadge({
              id: 9865,
              level: 1,
              minimumEarnedPix: 300,
              complementaryCertificationId: 9865,
            }),
          ]);

          // when
          const error = await catchErr(verifyCandidateSubscriptions)({
            userId: candidate.userId,
            candidate,
            limitDate: Date.now(),
            ...dependencies,
          });

          //then
          expect(error).to.be.instanceOf(CertificationCandidateEligibilityError);
        });
      });

      context('when there is no lower level and score is below current level', function () {
        it('should throw CertificationCandidateEligibilityError', async function () {
          // given
          const certificationCandidateId = 456;
          const complementaryCertificationId = 789;
          const complementaryCertificationBadgeId = 4568;

          const candidate = domainBuilder.certification.enrolment.buildCandidate({
            id: certificationCandidateId,
            userId: 1234,
            subscriptions: [
              domainBuilder.certification.enrolment.buildComplementarySubscription({
                certificationCandidateId,
                complementaryCertificationId,
              }),
            ],
          });

          const complementaryCertificationBadges = [
            domainBuilder.certification.complementary.buildComplementaryCertificationBadge({
              id: complementaryCertificationBadgeId,
              complementaryCertificationId,
              level: 1,
              minimumEarnedPix: 200,
            }),
          ];

          dependencies.pixCertificationRepository.findByUserId.resolves([
            domainBuilder.certification.enrolment.buildPixCertification({
              pixScore: 100,
              status: AssessmentResult.status.VALIDATED,
              isCancelled: false,
              isRejectedForFraud: false,
            }),
          ]);

          dependencies.certificationBadgesService.findLatestBadgeAcquisitions.resolves([
            domainBuilder.buildCertifiableBadgeAcquisition({
              complementaryCertificationId,
              complementaryCertificationBadgeId,
            }),
          ]);

          dependencies.complementaryCertificationBadgeRepository.findAll.resolves([
            ...complementaryCertificationBadges,
            domainBuilder.certification.complementary.buildComplementaryCertificationBadge({
              id: 9865,
              level: 1,
              minimumEarnedPix: 300,
              complementaryCertificationId: 9865,
            }),
          ]);

          // when
          const error = await catchErr(verifyCandidateSubscriptions)({
            userId: candidate.userId,
            candidate,
            limitDate: Date.now(),
            ...dependencies,
          });

          //then
          expect(error).to.be.instanceOf(CertificationCandidateEligibilityError);
        });
      });

      context('when user pixScore is above current level', function () {
        it('should resolve', async function () {
          // given
          const certificationCandidateId = 456;
          const complementaryCertificationId = 789;
          const complementaryCertificationBadgeId = 4568;

          const candidate = domainBuilder.certification.enrolment.buildCandidate({
            id: certificationCandidateId,
            userId: 1234,
            subscriptions: [
              domainBuilder.certification.enrolment.buildComplementarySubscription({
                certificationCandidateId,
                complementaryCertificationId,
              }),
            ],
          });

          const complementaryCertificationBadges = [
            domainBuilder.certification.complementary.buildComplementaryCertificationBadge({
              id: complementaryCertificationBadgeId,
              complementaryCertificationId,
              level: 1,
              minimumEarnedPix: 200,
            }),
          ];

          dependencies.pixCertificationRepository.findByUserId.resolves([
            domainBuilder.certification.enrolment.buildPixCertification({
              pixScore: 300,
              status: AssessmentResult.status.VALIDATED,
              isCancelled: false,
              isRejectedForFraud: false,
            }),
          ]);

          dependencies.certificationBadgesService.findLatestBadgeAcquisitions.resolves([
            domainBuilder.buildCertifiableBadgeAcquisition({
              complementaryCertificationId,
              complementaryCertificationBadgeId,
            }),
          ]);

          dependencies.complementaryCertificationBadgeRepository.findAll.resolves([
            ...complementaryCertificationBadges,
            domainBuilder.certification.complementary.buildComplementaryCertificationBadge({
              id: 9865,
              level: 1,
              minimumEarnedPix: 300,
              complementaryCertificationId: 9865,
            }),
          ]);

          // when
          //then
          expect(async () => {
            await verifyCandidateSubscriptions({
              userId: candidate.userId,
              candidate,
              ...dependencies,
            });
          }).not.to.throw(CertificationCandidateEligibilityError);
        });
      });
    });
  });
});
