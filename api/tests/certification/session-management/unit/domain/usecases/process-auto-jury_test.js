import { CertificationJuryDone } from '../../../../../../src/certification/session-management/domain/events/CertificationJuryDone.js';
import { SessionFinalized } from '../../../../../../src/certification/session-management/domain/read-models/SessionFinalized.js';
import { processAutoJury } from '../../../../../../src/certification/session-management/domain/usecases/process-auto-jury.js';
import { ABORT_REASONS } from '../../../../../../src/certification/shared/domain/constants/abort-reasons.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import {
  CertificationIssueReportCategory,
  CertificationIssueReportSubcategories,
} from '../../../../../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { AnswerStatus } from '../../../../../../src/shared/domain/models/AnswerStatus.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | process-auto-jury', function () {
  describe('when certification is V2', function () {
    let certificationCourseRepository,
      certificationIssueReportRepository,
      certificationAssessmentRepository,
      certificationRescoringRepository,
      challengeRepository;

    beforeEach(function () {
      certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
      certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      certificationRescoringRepository = { rescoreV2Certification: sinon.stub() };
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
      const certificationCourse = domainBuilder.buildCertificationCourse({ version: AlgorithmEngineVersion.V2 });
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

      certificationCourseRepository.findCertificationCoursesBySessionId
        .withArgs({ sessionId: 1234 })
        .resolves([certificationCourse]);
      certificationIssueReportRepository.findByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.getId() })
        .resolves([certificationIssueReport, certificationIssueReport2]);
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.getId() })
        .resolves(certificationAssessment);
      certificationAssessmentRepository.save.resolves();
      const { sessionId } = new SessionFinalized({
        sessionId: 1234,
        finalizedAt: new Date(),
        hasExaminerGlobalComment: false,
        certificationCenterName: 'A certification center name',
        sessionDate: '2021-01-29',
        sessionTime: '14:00',
      });

      // when
      await processAutoJury({
        sessionId,
        certificationIssueReportRepository,
        certificationAssessmentRepository,
        certificationCourseRepository,
        challengeRepository,
        certificationRescoringRepository,
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
      const certificationCourse = domainBuilder.buildCertificationCourse({ version: AlgorithmEngineVersion.V2 });
      const certificationIssueReport1 = domainBuilder.buildCertificationIssueReport({
        category: CertificationIssueReportCategory.IN_CHALLENGE,
        subcategory: CertificationIssueReportSubcategories.WEBSITE_BLOCKED,
        questionNumber: 1,
      });
      certificationCourseRepository.findCertificationCoursesBySessionId
        .withArgs({ sessionId: 1234 })
        .resolves([certificationCourse]);
      certificationIssueReportRepository.findByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.getId() })
        .resolves([certificationIssueReport1]);
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.getId() })
        .resolves(certificationAssessment);
      certificationAssessmentRepository.save.resolves();
      const { sessionId } = new SessionFinalized({
        sessionId: 1234,
        finalizedAt: new Date(),
        hasExaminerGlobalComment: false,
        certificationCenterName: 'A certification center name',
        sessionDate: '2021-01-29',
        sessionTime: '14:00',
      });

      // when
      await processAutoJury({
        sessionId,
        certificationIssueReportRepository,
        certificationAssessmentRepository,
        certificationCourseRepository,
        certificationRescoringRepository,
      });

      // then
      expect(certificationRescoringRepository.rescoreV2Certification).to.have.been.calledOnceWithExactly({
        event: new CertificationJuryDone({
          certificationCourseId: certificationCourse.getId(),
        }),
      });
    });

    describe('when the certification is not completed', function () {
      it('publishes a CertificationJuryDone event', async function () {
        // given
        const certificationAssessment = domainBuilder.buildCertificationAssessment({ certificationCourseId: 4567 });
        const certificationCourse = domainBuilder.buildCertificationCourse({
          sessionId: 1234,
          id: 4567,
          completedAt: null,
          abortReason: ABORT_REASONS.CANDIDATE,
          version: AlgorithmEngineVersion.V2,
        });
        certificationCourseRepository.findCertificationCoursesBySessionId
          .withArgs({ sessionId: 1234 })
          .resolves([certificationCourse]);
        certificationIssueReportRepository.findByCertificationCourseId
          .withArgs({ certificationCourseId: certificationCourse.getId() })
          .resolves([]);
        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: certificationCourse.getId() })
          .resolves(certificationAssessment);
        certificationAssessmentRepository.save.resolves();
        const { sessionId } = new SessionFinalized({
          sessionId: 1234,
          finalizedAt: new Date(),
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        });

        // when
        await processAutoJury({
          sessionId,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationCourseRepository,
          certificationRescoringRepository,
        });

        // then
        expect(certificationRescoringRepository.rescoreV2Certification).to.have.been.calledOnceWithExactly({
          event: new CertificationJuryDone({
            certificationCourseId: certificationCourse.getId(),
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
          const certificationCourse = domainBuilder.buildCertificationCourse({
            completedAt: null,
            abortReason: ABORT_REASONS.CANDIDATE,
            version: AlgorithmEngineVersion.V2,
          });
          certificationCourseRepository.findCertificationCoursesBySessionId
            .withArgs({ sessionId: 1234 })
            .resolves([certificationCourse]);
          certificationIssueReportRepository.findByCertificationCourseId
            .withArgs({ certificationCourseId: certificationCourse.getId() })
            .resolves([]);
          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: certificationCourse.getId() })
            .resolves(certificationAssessment);
          certificationAssessmentRepository.save.resolves();
          const { sessionId } = new SessionFinalized({
            sessionId: 1234,
            finalizedAt: new Date(),
            hasExaminerGlobalComment: false,
            certificationCenterName: 'A certification center name',
            sessionDate: '2021-01-29',
            sessionTime: '14:00',
          });

          // when
          await processAutoJury({
            sessionId,
            certificationIssueReportRepository,
            certificationAssessmentRepository,
            certificationCourseRepository,
            certificationRescoringRepository,
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
          const certificationCourse = domainBuilder.buildCertificationCourse({
            completedAt: null,
            abortReason: ABORT_REASONS.TECHNICAL,
            version: AlgorithmEngineVersion.V2,
          });
          certificationCourseRepository.findCertificationCoursesBySessionId
            .withArgs({ sessionId: 1234 })
            .resolves([certificationCourse]);
          certificationIssueReportRepository.findByCertificationCourseId
            .withArgs({ certificationCourseId: certificationCourse.getId() })
            .resolves([]);
          certificationAssessmentRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId: certificationCourse.getId() })
            .resolves(certificationAssessment);
          certificationAssessmentRepository.save.resolves();
          const { sessionId } = new SessionFinalized({
            sessionId: 1234,
            finalizedAt: new Date(),
            hasExaminerGlobalComment: false,
            certificationCenterName: 'A certification center name',
            sessionDate: '2021-01-29',
            sessionTime: '14:00',
          });

          // when
          await processAutoJury({
            sessionId,
            certificationIssueReportRepository,
            certificationAssessmentRepository,
            certificationCourseRepository,
            certificationRescoringRepository,
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
          challengeId: challengeNotToBeConsideredAsSkipped.challengeId,
        });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationAnswersByDate: [answeredChallenge],
          certificationChallenges: [challengeToBeConsideredAsSkipped, challengeNotToBeConsideredAsSkipped],
        });
        const certificationCourse = domainBuilder.buildCertificationCourse({
          completedAt: null,
          abortReason: ABORT_REASONS.CANDIDATE,
          version: AlgorithmEngineVersion.V2,
        });
        certificationCourseRepository.findCertificationCoursesBySessionId
          .withArgs({ sessionId: 1234 })
          .resolves([certificationCourse]);
        certificationIssueReportRepository.findByCertificationCourseId.resolves([]);
        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: certificationCourse.getId() })
          .resolves(certificationAssessment);
        const { sessionId } = new SessionFinalized({
          sessionId: 1234,
          finalizedAt: new Date(),
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        });

        // when
        await processAutoJury({
          sessionId,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationCourseRepository,
          certificationRescoringRepository,
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
        const certificationCourse = domainBuilder.buildCertificationCourse({
          id: 4567,
          sessionId: 1234,
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
        certificationCourseRepository.findCertificationCoursesBySessionId
          .withArgs({ sessionId: 1234 })
          .resolves([certificationCourse]);
        certificationIssueReportRepository.findByCertificationCourseId
          .withArgs({ certificationCourseId: certificationCourse.getId() })
          .resolves([certificationIssueReport, certificationIssueReport2]);
        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: certificationCourse.getId() })
          .resolves(certificationAssessment);
        certificationAssessmentRepository.save.resolves();
        const { sessionId } = new SessionFinalized({
          sessionId: 1234,
          finalizedAt: new Date(),
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        });

        // when
        await processAutoJury({
          sessionId,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationCourseRepository,
          challengeRepository,
          certificationRescoringRepository,
        });

        // then
        expect(certificationIssueReport.isResolved()).to.be.false;
        expect(certificationIssueReport2.isResolved()).to.be.true;
      });
    });
  });

  describe('when certification is V3', function () {
    let certificationCourseRepository,
      certificationIssueReportRepository,
      certificationAssessmentRepository,
      certificationRescoringRepository;

    beforeEach(function () {
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });
      certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
      certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      certificationRescoringRepository = { rescoreV3Certification: sinon.stub() };
    });

    it('triggers a CertificationJuryDone rescoring event', async function () {
      // given
      const challenge = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'recChal123',
      });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        version: 3,
        certificationAnswersByDate: [
          domainBuilder.buildAnswer({ challengeId: 'recChal123', result: AnswerStatus.SKIPPED }),
        ],
        certificationChallenges: [challenge],
      });
      const certificationCourse = domainBuilder.buildCertificationCourse({ version: 3 });
      certificationCourseRepository.findCertificationCoursesBySessionId
        .withArgs({ sessionId: 1234 })
        .resolves([certificationCourse]);
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.getId() })
        .resolves(certificationAssessment);
      certificationAssessmentRepository.save.resolves();
      certificationRescoringRepository.rescoreV3Certification.resolves();

      const { sessionId } = new SessionFinalized({
        sessionId: 1234,
        finalizedAt: new Date(),
        hasExaminerGlobalComment: false,
        certificationCenterName: 'A certification center name',
        sessionDate: '2021-01-29',
        sessionTime: '14:00',
      });

      // when
      await processAutoJury({
        sessionId,
        certificationIssueReportRepository,
        certificationAssessmentRepository,
        certificationCourseRepository,
        certificationRescoringRepository,
      });

      // then
      expect(certificationRescoringRepository.rescoreV3Certification).to.have.been.calledOnceWithExactly({
        event: new CertificationJuryDone({
          certificationCourseId: certificationCourse.getId(),
        }),
      });
    });

    describe('when the certification is started', function () {
      it('triggers a CertificationJuryDone rescoring event', async function () {
        // given
        const { certificationCourse } = _initializeV3CourseAndAssessment({
          certificationState: Assessment.states.STARTED,
          certificationAssessmentRepository,
          certificationCourseRepository,
          certificationIssueReportRepository,
        });
        const { sessionId } = new SessionFinalized({
          sessionId: 1234,
          finalizedAt: new Date(),
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        });

        // when
        await processAutoJury({
          sessionId,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationCourseRepository,
          certificationRescoringRepository,
        });

        // then
        expect(certificationRescoringRepository.rescoreV3Certification).to.have.been.calledOnceWithExactly({
          event: new CertificationJuryDone({
            certificationCourseId: certificationCourse.getId(),
          }),
        });
      });

      it('should save certification assessment', async function () {
        // given
        const challenge = domainBuilder.buildCertificationChallengeWithType({
          id: 123,
          associatedSkillName: 'cueillir des fleurs',
          challengeId: 'recChal456',
          type: 'QCU',
          competenceId: 'recCOMP',
          isNeutralized: false,
          hasBeenSkippedAutomatically: false,
          certifiableBadgeKey: null,
          createdAt: new Date('2020-01-01'),
        });
        const answeredChallenge = domainBuilder.buildAnswer({
          challengeId: challenge.challengeId,
        });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          version: 3,
          certificationAnswersByDate: [answeredChallenge],
          certificationChallenges: [challenge],
        });
        const certificationCourse = domainBuilder.buildCertificationCourse({
          version: 3,
          completedAt: null,
          abortReason: ABORT_REASONS.CANDIDATE,
        });
        certificationCourseRepository.findCertificationCoursesBySessionId
          .withArgs({ sessionId: 1234 })
          .resolves([certificationCourse]);

        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: certificationCourse.getId() })
          .resolves(certificationAssessment);

        const { sessionId } = new SessionFinalized({
          sessionId: 1234,
          finalizedAt: new Date(),
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        });

        // when
        await processAutoJury({
          sessionId,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationCourseRepository,
          certificationRescoringRepository,
        });

        // then
        const expectedCertificationAssessment = domainBuilder.buildCertificationAssessment({
          id: 123,
          userId: 123,
          certificationCourseId: 123,
          createdAt: new Date('2020-01-01T00:00:00Z'),
          completedAt: new Date('2020-01-01T00:00:00Z'),
          endedAt: challenge.createdAt,
          state: 'endedDueToFinalization',
          version: 3,
          certificationChallenges: [challenge],
          certificationAnswersByDate: [
            domainBuilder.buildAnswer({
              id: 123,
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

    describe('when the certification was ended by the invigilator', function () {
      it('triggers a CertificationJuryDone rescoring event', async function () {
        // given
        const { certificationCourse } = _initializeV3CourseAndAssessment({
          certificationState: Assessment.states.ENDED_BY_INVIGILATOR,
          certificationAssessmentRepository,
          certificationCourseRepository,
          certificationIssueReportRepository,
        });

        const { sessionId } = new SessionFinalized({
          sessionId: 1234,
          finalizedAt: new Date(),
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        });

        // when
        await processAutoJury({
          sessionId,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationCourseRepository,
          certificationRescoringRepository,
        });

        // then
        expect(certificationRescoringRepository.rescoreV3Certification).to.have.been.calledOnceWithExactly({
          event: new CertificationJuryDone({
            certificationCourseId: certificationCourse.getId(),
          }),
        });
      });
    });

    describe('when the certification was ended due to finalization', function () {
      it('scores the certification', async function () {
        // given
        const { certificationCourse } = _initializeV3CourseAndAssessment({
          certificationState: Assessment.states.ENDED_DUE_TO_FINALIZATION,
          certificationAssessmentRepository,
          certificationCourseRepository,
          certificationIssueReportRepository,
        });

        const { sessionId } = new SessionFinalized({
          sessionId: 1234,
          finalizedAt: new Date(),
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        });

        // when
        await processAutoJury({
          sessionId,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationCourseRepository,
          certificationRescoringRepository,
        });

        // then
        expect(certificationRescoringRepository.rescoreV3Certification).to.have.been.calledOnceWithExactly({
          event: new CertificationJuryDone({
            certificationCourseId: certificationCourse.getId(),
          }),
        });
      });
    });

    describe('when certificationCourse is completed', function () {
      it('should not call rescoring', async function () {
        // given
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          version: 3,
          certificationCourseId: 4567,
          state: 'completed',
        });
        const certificationCourse = domainBuilder.buildCertificationCourse({
          version: 3,
          id: 4567,
          sessionId: 1234,
          completedAt: '2010-01-01',
          abortReason: null,
        });

        certificationCourseRepository.findCertificationCoursesBySessionId
          .withArgs({ sessionId: 1234 })
          .resolves([certificationCourse]);

        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: certificationCourse.getId() })
          .resolves(certificationAssessment);

        certificationAssessmentRepository.save.resolves();
        const { sessionId } = new SessionFinalized({
          sessionId: 1234,
          finalizedAt: new Date(),
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        });

        // when
        await processAutoJury({
          sessionId,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationCourseRepository,
          certificationRescoringRepository,
        });

        // then
        expect(certificationRescoringRepository.rescoreV3Certification).to.not.have.been.calledOnce;
      });
    });
  });
});

function _initializeV3CourseAndAssessment({
  certificationState,
  certificationAssessmentRepository,
  certificationCourseRepository,
  certificationIssueReportRepository,
}) {
  const certificationAssessment = domainBuilder.buildCertificationAssessment({
    certificationCourseId: 4567,
    version: 3,
    state: certificationState,
  });
  const certificationCourse = domainBuilder.buildCertificationCourse({
    version: 3,
    sessionId: 1234,
    id: 4567,
    completedAt: null,
    abortReason: ABORT_REASONS.CANDIDATE,
  });
  certificationCourseRepository.findCertificationCoursesBySessionId
    .withArgs({ sessionId: 1234 })
    .resolves([certificationCourse]);
  certificationIssueReportRepository.findByCertificationCourseId
    .withArgs({ certificationCourseId: certificationCourse.getId() })
    .resolves([]);
  certificationAssessmentRepository.getByCertificationCourseId
    .withArgs({ certificationCourseId: certificationCourse.getId() })
    .resolves(certificationAssessment);
  certificationAssessmentRepository.save.resolves();

  return {
    certificationCourse,
  };
}
