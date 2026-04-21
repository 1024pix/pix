import sinon from 'sinon';

import { CertificationJuryDone } from '../../../../../../src/certification/session-management/domain/events/CertificationJuryDone.js';
import { processAutoJury } from '../../../../../../src/certification/session-management/domain/usecases/process-auto-jury.js';
import { ABORT_REASONS } from '../../../../../../src/certification/shared/domain/constants/abort-reasons.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import {
  CertificationIssueReportCategory,
  CertificationIssueReportSubcategories,
} from '../../../../../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';
import { AnswerStatus } from '../../../../../../src/shared/domain/models/AnswerStatus.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | UseCase | process-auto-jury', function () {
  describe('when certification is V2', function () {
    let certificationIssueReportRepository,
      certificationAssessmentRepository,
      certificationEvaluationRepository,
      challengeRepository;

    beforeEach(function () {
      certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      certificationEvaluationRepository = { rescoreV2Certification: sinon.stub() };
      challengeRepository = { get: sinon.stub() };
    });

    it('auto neutralizes challenges', async function () {
      // given
      const challengeToBeNeutralized1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'recChal123',
        isNeutralized: false,
      });
      const challengeToBeNeutralized2 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'recChal456',
        isNeutralized: false,
      });
      const challengeNotToBeNeutralized = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'recChal789',
        isNeutralized: false,
      });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationAnswersByDate: [
          domainBuilder.buildAnswer({ challengeId: 'recChal123', result: AnswerStatus.SKIPPED }),
          domainBuilder.buildAnswer({ challengeId: 'recChal456', result: AnswerStatus.KO }),
          domainBuilder.buildAnswer({ challengeId: 'recChal789', result: AnswerStatus.OK }),
        ],
        certificationChallenges: [challengeToBeNeutralized1, challengeToBeNeutralized2, challengeNotToBeNeutralized],
      });
      const certificationCourse = domainBuilder.certification.sessionManagement.buildCertificationCourse({
        version: AlgorithmEngineVersion.V2,
      });
      const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
        category: CertificationIssueReportCategory.IN_CHALLENGE,
        subcategory: CertificationIssueReportSubcategories.WEBSITE_BLOCKED,
        questionNumber: 1,
      });
      const certificationIssueReport2 = domainBuilder.buildCertificationIssueReport({
        category: CertificationIssueReportCategory.FRAUD,
        subcategory: undefined,
        questionNumber: 1,
      });

      certificationIssueReportRepository.findByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.id })
        .resolves([certificationIssueReport, certificationIssueReport2]);
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.id })
        .resolves(certificationAssessment);
      certificationAssessmentRepository.save.resolves();
      const session = domainBuilder.certification.sessionManagement.buildSession({
        certificationCourses: [certificationCourse],
      });

      // when
      await processAutoJury({
        session,
        certificationIssueReportRepository,
        certificationAssessmentRepository,
        challengeRepository,
        certificationEvaluationRepository,
      });

      // then
      expect(certificationIssueReport.isResolved()).to.be.true;
      expect(certificationIssueReport.hasBeenAutomaticallyResolved).to.be.true;
      expect(certificationAssessmentRepository.save).to.have.been.calledWithExactly(certificationAssessment);
    });

    it('scores the certification', async function () {
      // given
      const challengeToBeNeutralized1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'recChal123',
        isNeutralized: false,
      });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationAnswersByDate: [
          domainBuilder.buildAnswer({ challengeId: 'recChal123', result: AnswerStatus.SKIPPED }),
        ],
        certificationChallenges: [challengeToBeNeutralized1],
      });
      const certificationCourse = domainBuilder.certification.sessionManagement.buildCertificationCourse({
        version: AlgorithmEngineVersion.V2,
      });
      const certificationIssueReport1 = domainBuilder.buildCertificationIssueReport({
        category: CertificationIssueReportCategory.IN_CHALLENGE,
        subcategory: CertificationIssueReportSubcategories.WEBSITE_BLOCKED,
        questionNumber: 1,
      });
      certificationIssueReportRepository.findByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.id })
        .resolves([certificationIssueReport1]);
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.id })
        .resolves(certificationAssessment);
      certificationAssessmentRepository.save.resolves();
      const session = domainBuilder.certification.sessionManagement.buildSession({
        certificationCourses: [certificationCourse],
      });

      // when
      await processAutoJury({
        session,
        certificationIssueReportRepository,
        certificationAssessmentRepository,
        certificationEvaluationRepository,
      });

      // then
      expect(certificationEvaluationRepository.rescoreV2Certification).to.have.been.calledOnceWithExactly({
        event: new CertificationJuryDone({
          certificationCourseId: certificationCourse.id,
        }),
      });
    });

    describe('when the certification is not completed', function () {
      it('publishes a CertificationJuryDone event', async function () {
        // given
        const certificationAssessment = domainBuilder.buildCertificationAssessment({ certificationCourseId: 4567 });
        const certificationCourse = domainBuilder.certification.sessionManagement.buildCertificationCourse({
          version: AlgorithmEngineVersion.V2,
          id: 4567,
          completedAt: null,
          abortReason: ABORT_REASONS.CANDIDATE,
        });
        certificationIssueReportRepository.findByCertificationCourseId
          .withArgs({ certificationCourseId: certificationCourse.id })
          .resolves([]);
        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: certificationCourse.id })
          .resolves(certificationAssessment);
        certificationAssessmentRepository.save.resolves();
        const session = domainBuilder.certification.sessionManagement.buildSession({
          certificationCourses: [certificationCourse],
        });

        // when
        await processAutoJury({
          session,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationEvaluationRepository,
        });

        // then
        expect(certificationEvaluationRepository.rescoreV2Certification).to.have.been.calledOnceWithExactly({
          event: new CertificationJuryDone({
            certificationCourseId: certificationCourse.id,
          }),
        });
      });

      describe('when abort reason is candidate', function () {
        it('should skip unpassed challenges', async function () {
          // given
          const challengeToBeConsideredAsSkipped = domainBuilder.buildCertificationChallengeWithType({
            challengeId: 'recChal123',
            isNeutralized: false,
            hasBeenSkippedAutomatically: false,
          });
          const challengeNotToBeConsideredAsSkipped = domainBuilder.buildCertificationChallengeWithType({
            challengeId: 'recChal456',
            isNeutralized: false,
            hasBeenSkippedAutomatically: false,
          });
          const answeredChallenge = domainBuilder.buildAnswer({
            challengeId: challengeNotToBeConsideredAsSkipped.challengeId,
          });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            certificationAnswersByDate: [answeredChallenge],
            certificationChallenges: [challengeToBeConsideredAsSkipped, challengeNotToBeConsideredAsSkipped],
          });
          const certificationCourse = domainBuilder.certification.sessionManagement.buildCertificationCourse({
            version: AlgorithmEngineVersion.V2,
            completedAt: null,
            abortReason: ABORT_REASONS.CANDIDATE,
          });
          certificationIssueReportRepository.findByCertificationCourseId
            .withArgs({ certificationCourseId: certificationCourse.id })
            .resolves([]);
          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: certificationCourse.id })
            .resolves(certificationAssessment);
          certificationAssessmentRepository.save.resolves();
          const session = domainBuilder.certification.sessionManagement.buildSession({
            certificationCourses: [certificationCourse],
          });

          // when
          await processAutoJury({
            session,
            certificationIssueReportRepository,
            certificationAssessmentRepository,
            certificationEvaluationRepository,
          });

          // then
          expect(
            certificationAssessment.certificationChallenges.find(
              (certificationChallenge) => certificationChallenge.challengeId === 'recChal123',
            ).hasBeenSkippedAutomatically,
          ).to.be.true;
          expect(
            certificationAssessment.certificationChallenges.find(
              (certificationChallenge) => certificationChallenge.challengeId === 'recChal456',
            ).hasBeenSkippedAutomatically,
          ).to.be.false;
        });
      });

      describe('when abort reason is technical', function () {
        it('should neutralize unpassed challenges', async function () {
          // given
          const challengeToBeConsideredAsSkipped = domainBuilder.buildCertificationChallengeWithType({
            challengeId: 'recChal123',
            isNeutralized: false,
            hasBeenSkippedAutomatically: false,
          });
          const challengeNotToBeConsideredAsSkipped = domainBuilder.buildCertificationChallengeWithType({
            challengeId: 'recChal456',
            isNeutralized: false,
            hasBeenSkippedAutomatically: false,
          });
          const answeredChallenge = domainBuilder.buildAnswer({
            challengeId: challengeNotToBeConsideredAsSkipped.challengeId,
          });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            certificationAnswersByDate: [answeredChallenge],
            certificationChallenges: [challengeToBeConsideredAsSkipped, challengeNotToBeConsideredAsSkipped],
          });
          const certificationCourse = domainBuilder.certification.sessionManagement.buildCertificationCourse({
            version: AlgorithmEngineVersion.V2,
            completedAt: null,
            abortReason: ABORT_REASONS.TECHNICAL,
          });
          certificationIssueReportRepository.findByCertificationCourseId
            .withArgs({ certificationCourseId: certificationCourse.id })
            .resolves([]);
          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: certificationCourse.id })
            .resolves(certificationAssessment);
          certificationAssessmentRepository.save.resolves();
          const session = domainBuilder.certification.sessionManagement.buildSession({
            certificationCourses: [certificationCourse],
          });

          // when
          await processAutoJury({
            session,
            certificationIssueReportRepository,
            certificationAssessmentRepository,
            certificationEvaluationRepository,
          });

          // then
          expect(certificationAssessment.certificationChallenges[0].isNeutralized).to.be.true;
          expect(certificationAssessment.certificationChallenges[0].challengeId).to.equal('recChal123');
          expect(certificationAssessment.certificationChallenges[1].isNeutralized).to.be.false;
        });
      });

      it('should save certification assessment', async function () {
        // given
        const challengeToBeConsideredAsSkipped = domainBuilder.buildCertificationChallengeWithType({
          id: 123,
          associatedSkillName: 'cueillir des fleurs',
          challengeId: 'recChal123',
          type: 'QCU',
          competenceId: 'recCOMP',
          isNeutralized: false,
          hasBeenSkippedAutomatically: true,
          certifiableBadgeKey: null,
          createdAt: new Date('2020-01-01'),
        });
        const challengeNotToBeConsideredAsSkipped = domainBuilder.buildCertificationChallengeWithType({
          id: 123,
          associatedSkillName: 'cueillir des fleurs',
          challengeId: 'recChal456',
          type: 'QCU',
          competenceId: 'recCOMP',
          isNeutralized: false,
          hasBeenSkippedAutomatically: false,
          certifiableBadgeKey: null,
          createdAt: new Date('2020-01-02'),
        });
        const answeredChallenge = domainBuilder.buildAnswer({
          createdAt: new Date('2020-01-01'),
          challengeId: challengeNotToBeConsideredAsSkipped.challengeId,
        });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationAnswersByDate: [answeredChallenge],
          certificationChallenges: [challengeToBeConsideredAsSkipped, challengeNotToBeConsideredAsSkipped],
        });
        const certificationCourse = domainBuilder.certification.sessionManagement.buildCertificationCourse({
          version: AlgorithmEngineVersion.V2,
          completedAt: null,
          abortReason: ABORT_REASONS.CANDIDATE,
        });
        certificationIssueReportRepository.findByCertificationCourseId.resolves([]);
        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: certificationCourse.id })
          .resolves(certificationAssessment);
        const session = domainBuilder.certification.sessionManagement.buildSession({
          certificationCourses: [certificationCourse],
        });

        // when
        await processAutoJury({
          session,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationEvaluationRepository,
        });

        // then
        const expectedCertificationAssessment = domainBuilder.buildCertificationAssessment({
          id: 123,
          userId: 123,
          certificationCourseId: 123,
          createdAt: new Date('2020-01-01T00:00:00Z'),
          completedAt: new Date('2020-01-01T00:00:00Z'),
          endedAt: challengeNotToBeConsideredAsSkipped.createdAt,
          state: 'endedDueToFinalization',
          version: 2,
          certificationChallenges: [
            domainBuilder.buildCertificationChallengeWithType({
              ...challengeToBeConsideredAsSkipped,
              hasBeenSkippedAutomatically: true,
            }),
            challengeNotToBeConsideredAsSkipped,
          ],
          certificationAnswersByDate: [
            domainBuilder.buildAnswer({
              id: 123,
              createdAt: new Date('2020-01-01'),
              result: 'ok',
              resultDetails: null,
              timeout: null,
              focusedOut: false,
              value: '1',
              levelup: undefined,
              assessmentId: 456,
              challengeId: 'recChal456',
              timeSpent: 20,
            }),
          ],
        });
        expect(certificationAssessmentRepository.save).to.have.been.calledWithExactly(expectedCertificationAssessment);
      });
    });

    describe('when a resolution throws an exception', function () {
      it('should go on and try to resolve the others certification issue reports', async function () {
        // given
        const challengeToBeNeutralized1 = domainBuilder.buildCertificationChallengeWithType({
          challengeId: 'recChal123',
          isNeutralized: false,
        });
        const challengeToBeNeutralized2 = domainBuilder.buildCertificationChallengeWithType({
          challengeId: 'recChal456',
          isNeutralized: false,
        });
        const challengeNotToBeNeutralized = domainBuilder.buildCertificationChallengeWithType({
          challengeId: 'recChal789',
          isNeutralized: false,
        });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationCourseId: 4567,
          certificationAnswersByDate: [
            domainBuilder.buildAnswer({ challengeId: 'recChal123', result: AnswerStatus.SKIPPED }),
            domainBuilder.buildAnswer({ challengeId: 'recChal456', result: AnswerStatus.KO }),
            domainBuilder.buildAnswer({ challengeId: 'recChal789', result: AnswerStatus.OK }),
          ],
          certificationChallenges: [challengeToBeNeutralized1, challengeToBeNeutralized2, challengeNotToBeNeutralized],
        });
        const certificationCourse = domainBuilder.certification.sessionManagement.buildCertificationCourse({
          id: 4567,
          version: AlgorithmEngineVersion.V2,
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          category: CertificationIssueReportCategory.IN_CHALLENGE,
          subcategory: CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
          questionNumber: 1,
        });
        const certificationIssueReport2 = domainBuilder.buildCertificationIssueReport({
          category: CertificationIssueReportCategory.IN_CHALLENGE,
          subcategory: CertificationIssueReportSubcategories.WEBSITE_BLOCKED,
          questionNumber: 1,
        });
        const challengeRepository = {
          get: sinon.stub(),
        };
        const anError = new Error('something bad happened');
        challengeRepository.get.rejects(anError);
        certificationIssueReportRepository.findByCertificationCourseId
          .withArgs({ certificationCourseId: certificationCourse.id })
          .resolves([certificationIssueReport, certificationIssueReport2]);
        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: certificationCourse.id })
          .resolves(certificationAssessment);
        certificationAssessmentRepository.save.resolves();
        const session = domainBuilder.certification.sessionManagement.buildSession({
          certificationCourses: [certificationCourse],
        });

        // when
        await processAutoJury({
          session,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          challengeRepository,
          certificationEvaluationRepository,
        });

        // then
        expect(certificationIssueReport.isResolved()).to.be.false;
        expect(certificationIssueReport2.isResolved()).to.be.true;
      });
    });
  });
});
