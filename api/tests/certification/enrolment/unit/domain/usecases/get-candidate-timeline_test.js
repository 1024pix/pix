import sinon from 'sinon';

import { CandidateCreatedEvent } from '../../../../../../src/certification/enrolment/domain/models/timeline/CandidateCreatedEvent.js';
import { CandidateDoubleCertificationEligibleEvent } from '../../../../../../src/certification/enrolment/domain/models/timeline/CandidateDoubleCertificationEligibleEvent.js';
import { CandidateEligibleButNotRegisteredToDoubleCertificationEvent } from '../../../../../../src/certification/enrolment/domain/models/timeline/CandidateEligibleButNotRegisteredToDoubleCertificationEvent.js';
import { CandidateNotCertifiableEvent } from '../../../../../../src/certification/enrolment/domain/models/timeline/CandidateNotCertifiableEvent.js';
import { CandidateNotEligibleEvent } from '../../../../../../src/certification/enrolment/domain/models/timeline/CandidateNotEligibleEvent.js';
import { CandidateReconciledEvent } from '../../../../../../src/certification/enrolment/domain/models/timeline/CandidateReconciledEvent.js';
import { CertificationStartedEvent } from '../../../../../../src/certification/enrolment/domain/models/timeline/CertificationStartedEvent.js';
import { LastAnsweredEvent } from '../../../../../../src/certification/enrolment/domain/models/timeline/LastAnsweredEvent.js';
import { UserCertificationEligibility } from '../../../../../../src/certification/enrolment/domain/read-models/UserCertificationEligibility.js';
import { getCandidateTimeline } from '../../../../../../src/certification/enrolment/domain/usecases/get-candidate-timeline.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Enrolment | Unit | Domain | UseCase | get-candidate-timeline', function () {
  let candidateRepository,
    certificationCourseRepository,
    placementProfileService,
    certificationBadgesService,
    eligibilityService,
    certificationAssessmentRepository,
    deps;

  beforeEach(function () {
    candidateRepository = {
      get: sinon.stub(),
    };

    certificationCourseRepository = {
      findOneCertificationCourseByUserIdAndSessionId: sinon.stub(),
    };

    placementProfileService = {
      getPlacementProfile: sinon.stub(),
    };

    certificationBadgesService = {
      findStillValidBadgeAcquisitions: sinon.stub(),
    };

    certificationAssessmentRepository = {
      getByCertificationCandidateId: sinon.stub(),
    };

    eligibilityService = {
      getUserCertificationEligibility: sinon.stub(),
    };

    deps = {
      candidateRepository,
      certificationCourseRepository,
      certificationBadgesService,
      placementProfileService,
      certificationAssessmentRepository,
      eligibilityService,
    };
  });

  context('candidate creation', function () {
    it('should add the creation event to the timeline', async function () {
      // given
      const sessionId = 1234;
      const certificationCandidateId = 4567;
      const candidate = domainBuilder.certification.enrolment.buildCandidate();
      candidateRepository.get.resolves(candidate);

      // when
      const candidateTimeline = await getCandidateTimeline({
        sessionId,
        certificationCandidateId,
        ...deps,
      });

      // then
      expect(candidateTimeline.events).to.deep.equal([new CandidateCreatedEvent({ when: candidate.createdAt })]);
    });
  });

  context('candidate reconciliation', function () {
    it('should add a reconciliation event', async function () {
      // given
      const sessionId = 1234;
      const certificationCandidateId = 4567;
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        userId: 222,
        reconciledAt: new Date(),
      });
      candidateRepository.get.resolves(candidate);
      placementProfileService.getPlacementProfile.resolves(domainBuilder.buildPlacementProfile());
      eligibilityService.getUserCertificationEligibility.resolves(
        domainBuilder.certification.enrolment.buildCertificationEligibility(),
      );

      // when
      const candidateTimeline = await getCandidateTimeline({
        sessionId,
        certificationCandidateId,
        ...deps,
      });

      // then
      expect(candidateTimeline.events).to.deep.includes(new CandidateReconciledEvent({ when: candidate.reconciledAt }));
    });

    context('when candidate stopped at reconciliation', function () {
      it('should detect if candidate is not certifiable', async function () {
        // given
        const sessionId = 1234;
        const certificationCandidateId = 4567;
        const candidate = domainBuilder.certification.enrolment.buildCandidate({
          userId: 222,
          reconciledAt: new Date(),
        });
        candidateRepository.get.resolves(candidate);
        certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId.resolves(null);
        const placementProfile = domainBuilder.buildPlacementProfile();
        placementProfileService.getPlacementProfile.resolves(placementProfile);
        eligibilityService.getUserCertificationEligibility.resolves(
          domainBuilder.certification.enrolment.buildUserCertificationEligibility({
            isCertifiable: false,
          }),
        );

        // when
        const candidateTimeline = await getCandidateTimeline({
          sessionId,
          certificationCandidateId,
          ...deps,
        });

        // then
        expect(candidateTimeline.events).to.deep.includes(
          new CandidateNotCertifiableEvent({ when: candidate.reconciledAt }),
        );
      });
    });
  });

  context('certification startup', function () {
    context('when has a CORE subscription', function () {
      it('should add a certification started event + certifiable event', async function () {
        // given
        const sessionId = 1234;
        const certificationCandidateId = 4567;
        candidateRepository.get.resolves(
          domainBuilder.certification.enrolment.buildCandidate({
            userId: 222,
            reconciledAt: new Date(),
          }),
        );
        const certifCourse = domainBuilder.buildCertificationCourse();
        const placementProfile = domainBuilder.buildPlacementProfile();
        placementProfileService.getPlacementProfile.resolves(placementProfile);
        certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId.resolves(certifCourse);
        certificationBadgesService.findStillValidBadgeAcquisitions.resolves([]);
        const assessment = domainBuilder.buildCertificationAssessment();
        certificationAssessmentRepository.getByCertificationCandidateId.resolves(assessment);
        eligibilityService.getUserCertificationEligibility.resolves(
          domainBuilder.certification.enrolment.buildUserCertificationEligibility({
            isCertifiable: true,
          }),
        );

        // when
        const candidateTimeline = await getCandidateTimeline({
          sessionId,
          certificationCandidateId,
          ...deps,
        });

        // then
        expect(candidateTimeline.events).to.deep.includes(
          new CertificationStartedEvent({ when: certifCourse.getStartDate() }),
          new CandidateDoubleCertificationEligibleEvent({ when: certifCourse.getStartDate() }),
        );
      });
    });

    context('when candidate is registered for a double certification', function () {
      context('when candidate is certifiable but not eligible to double certification', function () {
        it('should add a candidate not eligible event', async function () {
          // given
          const sessionId = 1234;
          const certificationCandidateId = 4567;
          const candidate = domainBuilder.certification.enrolment.buildCandidate({
            userId: 222,
            reconciledAt: new Date(),
            subscription: Frameworks.CLEA,
          });
          candidateRepository.get.resolves(candidate);
          const placementProfile = domainBuilder.buildPlacementProfile();
          placementProfileService.getPlacementProfile.resolves(placementProfile);
          certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId.resolves(null);
          certificationBadgesService.findStillValidBadgeAcquisitions.resolves([]);
          eligibilityService.getUserCertificationEligibility.resolves(
            // Utilisation de la classe à cause de la valeur par défaut dans le builder qui empêche d'avoir une valeur nulle
            new UserCertificationEligibility({
              isCertifiable: true,
              doubleCertificationEligibility: null,
            }),
          );

          // when
          const candidateTimeline = await getCandidateTimeline({
            sessionId,
            certificationCandidateId,
            ...deps,
          });

          // then
          expect(candidateTimeline.events).to.deep.includes(
            new CandidateNotEligibleEvent({ when: candidate.reconciledAt }),
          );
        });
      });

      context('when candidate is certifiable and eligible to double certification', function () {
        it('should add a candidate certifiable and eligible event', async function () {
          // given
          const sessionId = 1234;
          const certificationCandidateId = 4567;
          const candidate = domainBuilder.certification.enrolment.buildCandidate({
            userId: 222,
            reconciledAt: new Date(),
            subscription: Frameworks.CLEA,
          });
          candidateRepository.get.resolves(candidate);
          const placementProfile = domainBuilder.buildPlacementProfile();
          placementProfileService.getPlacementProfile.resolves(placementProfile);
          certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId.resolves(null);
          certificationBadgesService.findStillValidBadgeAcquisitions.resolves([]);
          eligibilityService.getUserCertificationEligibility.resolves(
            // Utilisation de la classe à cause de la valeur par défaut dans le builder qui empêche d'avoir une valeur nulle
            new UserCertificationEligibility({
              isCertifiable: true,
              doubleCertificationEligibility: domainBuilder.certification.enrolment.buildCertificationEligibility({
                isBadgeValid: true,
              }),
            }),
          );

          // when
          const candidateTimeline = await getCandidateTimeline({
            sessionId,
            certificationCandidateId,
            ...deps,
          });

          // then
          expect(candidateTimeline.events).to.deep.includes(
            new CandidateDoubleCertificationEligibleEvent({ when: candidate.reconciledAt }),
          );
        });
      });
    });

    context('when candidate is not registered for a double certification', function () {
      context('when candidate is certifiable and eligible to double certification', function () {
        it('should add a candidate not registered to double certification event', async function () {
          // given
          const sessionId = 1234;
          const certificationCandidateId = 4567;
          const candidate = domainBuilder.certification.enrolment.buildCandidate({
            userId: 222,
            reconciledAt: new Date(),
            subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
          });
          candidateRepository.get.resolves(candidate);
          const placementProfile = domainBuilder.buildPlacementProfile();
          placementProfileService.getPlacementProfile.resolves(placementProfile);
          certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId.resolves(null);
          certificationBadgesService.findStillValidBadgeAcquisitions.resolves([]);
          eligibilityService.getUserCertificationEligibility.resolves(
            new UserCertificationEligibility({
              isCertifiable: true,
              doubleCertificationEligibility: domainBuilder.certification.enrolment.buildCertificationEligibility({
                isBadgeValid: true,
              }),
            }),
          );

          // when
          const candidateTimeline = await getCandidateTimeline({
            sessionId,
            certificationCandidateId,
            ...deps,
          });

          // then
          expect(candidateTimeline.events).to.deep.includes(
            new CandidateEligibleButNotRegisteredToDoubleCertificationEvent({ when: candidate.reconciledAt }),
          );
        });
      });
    });

    context('certification ended', function () {
      context('when candidate sees end screen test', function () {
        it('should add a lastAnswer event', async function () {
          const sessionId = 1234;
          const certificationCandidateId = 4567;
          candidateRepository.get.resolves(
            domainBuilder.certification.enrolment.buildCandidate({
              userId: 222,
              reconciledAt: new Date(),
              subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
            }),
          );
          const certificationCourse = domainBuilder.buildCertificationCourse({
            lastAnswerAt: new Date('2024-04-21T13:56:00Z'),
          });
          certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId.resolves(certificationCourse);

          const assessment = domainBuilder.buildCertificationAssessment();
          certificationAssessmentRepository.getByCertificationCandidateId.resolves(assessment);
          eligibilityService.getUserCertificationEligibility.resolves(
            domainBuilder.certification.enrolment.buildUserCertificationEligibility({
              isCertifiable: true,
            }),
          );

          const candidateTimeline = await getCandidateTimeline({
            sessionId,
            certificationCandidateId,
            ...deps,
          });

          expect(candidateTimeline.events).to.deep.includes(
            new LastAnsweredEvent({
              when: certificationCourse.lastAnswerAt,
            }),
          );
        });
      });
    });
  });
});
