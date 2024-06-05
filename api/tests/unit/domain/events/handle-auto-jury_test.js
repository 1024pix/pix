import { AutoJuryDone } from '../../../../lib/domain/events/AutoJuryDone.js';
import { CertificationJuryDone } from '../../../../lib/domain/events/CertificationJuryDone.js';
import { handleAutoJury } from '../../../../lib/domain/events/handle-auto-jury.js';
import { SessionFinalized } from '../../../../lib/domain/events/SessionFinalized.js';
import { CertificationAssessment } from '../../../../src/certification/session-management/domain/models/CertificationAssessment.js';
import { ABORT_REASONS } from '../../../../src/certification/shared/domain/models/CertificationCourse.js';
import {
  CertificationIssueReportCategory,
  CertificationIssueReportSubcategories,
} from '../../../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';
import { AnswerStatus } from '../../../../src/shared/domain/models/AnswerStatus.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | Domain | Events | handle-auto-jury', function () {
  describe('when certification is V2', function () {
    it('fails when event is not of correct type', async function () {
      // given
      const event = 'not an event of the correct type';

      // when
      const error = await catchErr(handleAutoJury)(event);

      // / then
      expect(error).not.to.be.null;
    });

    it('auto neutralizes challenges', async function () {
      // given
      const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
      const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      const challengeRepository = { get: sinon.stub() };
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
      const certificationCourse = domainBuilder.buildCertificationCourse();
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
      const event = new SessionFinalized({
        sessionId: 1234,
        finalizedAt: new Date(),
        hasExaminerGlobalComment: false,
        certificationCenterName: 'A certification center name',
        sessionDate: '2021-01-29',
        sessionTime: '14:00',
      });

      // when
      await handleAutoJury({
        event,
        certificationIssueReportRepository,
        certificationAssessmentRepository,
        certificationCourseRepository,
        challengeRepository,
      });

      // then
      expect(certificationIssueReport.isResolved()).to.be.true;
      expect(certificationIssueReport.hasBeenAutomaticallyResolved).to.be.true;
      expect(certificationAssessmentRepository.save).to.have.been.calledWithExactly(certificationAssessment);
    });

    it('returns an AutoJuryDone event as last event', async function () {
      // given
      const now = Date.now();
      const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
      const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub() };
      const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationAnswersByDate: [
          domainBuilder.buildAnswer({ challengeId: 'recChal123', result: AnswerStatus.SKIPPED }),
          domainBuilder.buildAnswer({ challengeId: 'recChal456', result: AnswerStatus.KO }),
          domainBuilder.buildAnswer({ challengeId: 'recChal789', result: AnswerStatus.OK }),
        ],
        certificationChallenges: [
          domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal123' }),
          domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal456' }),
          domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal789' }),
        ],
      });

      const certificationCourse = domainBuilder.buildCertificationCourse();
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.getId() })
        .resolves(certificationAssessment);
      certificationCourseRepository.findCertificationCoursesBySessionId
        .withArgs({ sessionId: 1234 })
        .resolves([certificationCourse]);
      certificationIssueReportRepository.findByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.getId() })
        .resolves([]);

      const event = new SessionFinalized({
        sessionId: 1234,
        finalizedAt: now,
        hasExaminerGlobalComment: false,
        certificationCenterName: 'A certification center name',
        sessionDate: '2021-01-29',
        sessionTime: '14:00',
      });

      // when
      const resultEvents = await handleAutoJury({
        event,
        certificationIssueReportRepository,
        certificationAssessmentRepository,
        certificationCourseRepository,
      });

      // then
      const autoJuryDoneEvent = resultEvents[resultEvents.length - 1];
      expect(autoJuryDoneEvent).to.be.an.instanceof(AutoJuryDone);
      expect(autoJuryDoneEvent).to.deep.equal(
        new AutoJuryDone({
          sessionId: 1234,
          finalizedAt: now,
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        }),
      );
    });

    it('returns a CertificationJuryDone event first in returned collection', async function () {
      // given
      const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
      const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
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
      const certificationCourse = domainBuilder.buildCertificationCourse();
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
      const event = new SessionFinalized({
        sessionId: 1234,
        finalizedAt: new Date(),
        hasExaminerGlobalComment: false,
        certificationCenterName: 'A certification center name',
        sessionDate: '2021-01-29',
        sessionTime: '14:00',
      });

      // when
      const events = await handleAutoJury({
        event,
        certificationIssueReportRepository,
        certificationAssessmentRepository,
        certificationCourseRepository,
      });

      // then
      expect(events[0]).to.be.an.instanceof(CertificationJuryDone);
      expect(events[0]).to.deep.equal(
        new CertificationJuryDone({
          certificationCourseId: certificationCourse.getId(),
        }),
      );
    });

    describe('when the certification is not completed', function () {
      it('returns a CertificationJuryDone event first in returned collection', async function () {
        // given
        const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
        const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
        const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
        const certificationAssessment = domainBuilder.buildCertificationAssessment({ certificationCourseId: 4567 });
        const certificationCourse = domainBuilder.buildCertificationCourse({
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
        const event = new SessionFinalized({
          sessionId: 1234,
          finalizedAt: new Date(),
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        });

        // when
        const events = await handleAutoJury({
          event,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationCourseRepository,
        });

        // then
        expect(events[0]).to.deepEqualInstance(
          new CertificationJuryDone({
            certificationCourseId: certificationCourse.getId(),
          }),
        );
      });

      describe('when abort reason is candidate', function () {
        it('should skip unpassed challenges', async function () {
          // given
          const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
          const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
          const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
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
          const event = new SessionFinalized({
            sessionId: 1234,
            finalizedAt: new Date(),
            hasExaminerGlobalComment: false,
            certificationCenterName: 'A certification center name',
            sessionDate: '2021-01-29',
            sessionTime: '14:00',
          });

          // when
          await handleAutoJury({
            event,
            certificationIssueReportRepository,
            certificationAssessmentRepository,
            certificationCourseRepository,
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
          const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
          const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
          const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
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
          const event = new SessionFinalized({
            sessionId: 1234,
            finalizedAt: new Date(),
            hasExaminerGlobalComment: false,
            certificationCenterName: 'A certification center name',
            sessionDate: '2021-01-29',
            sessionTime: '14:00',
          });

          // when
          await handleAutoJury({
            event,
            certificationIssueReportRepository,
            certificationAssessmentRepository,
            certificationCourseRepository,
          });

          // then
          expect(certificationAssessment.certificationChallenges[0].isNeutralized).to.be.true;
          expect(certificationAssessment.certificationChallenges[0].challengeId).to.equal('recChal123');
          expect(certificationAssessment.certificationChallenges[1].isNeutralized).to.be.false;
        });
      });

      it('should save certification assessment', async function () {
        // given
        const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
        const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
        const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
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
        });
        certificationCourseRepository.findCertificationCoursesBySessionId
          .withArgs({ sessionId: 1234 })
          .resolves([certificationCourse]);
        certificationIssueReportRepository.findByCertificationCourseId.resolves([]);
        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: certificationCourse.getId() })
          .resolves(certificationAssessment);
        const event = new SessionFinalized({
          sessionId: 1234,
          finalizedAt: new Date(),
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        });

        // when
        await handleAutoJury({
          event,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationCourseRepository,
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

    describe('when certificationCourse is completed', function () {
      it('should not return a CertificationJuryDone', async function () {
        // given
        const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
        const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
        const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationCourseId: 4567,
        });
        const certificationCourse = domainBuilder.buildCertificationCourse({
          id: 4567,
          sessionId: 1234,
          completedAt: '2010-01-01',
          abortReason: null,
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
        const event = new SessionFinalized({
          sessionId: 1234,
          finalizedAt: new Date(),
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        });

        // when
        const events = await handleAutoJury({
          event,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationCourseRepository,
        });

        // then
        expect(events[0]).not.to.be.an.instanceof(CertificationJuryDone);
        expect(events.length).to.equal(1);
      });
    });

    describe('when there is no certification issue report', function () {
      it('does not return a CertificationJuryDone event', async function () {
        // given
        const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
        const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub() };
        const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationCourseId: 4567,
          certificationAnswersByDate: [
            domainBuilder.buildAnswer({ challengeId: 'recChal123', result: AnswerStatus.SKIPPED }),
            domainBuilder.buildAnswer({ challengeId: 'recChal456', result: AnswerStatus.KO }),
            domainBuilder.buildAnswer({ challengeId: 'recChal789', result: AnswerStatus.OK }),
          ],
          certificationChallenges: [
            domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal123' }),
            domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal456' }),
            domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal789' }),
          ],
        });

        const certificationCourse = domainBuilder.buildCertificationCourse({ id: 4567, sessionId: 1234 });
        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: certificationCourse.getId() })
          .resolves(certificationAssessment);
        certificationCourseRepository.findCertificationCoursesBySessionId
          .withArgs({ sessionId: 1234 })
          .resolves([certificationCourse]);
        certificationIssueReportRepository.findByCertificationCourseId
          .withArgs({ certificationCourseId: certificationCourse.getId() })
          .resolves([]);
        const event = new SessionFinalized({
          sessionId: 1234,
          finalizedAt: new Date(),
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        });

        // when
        const events = await handleAutoJury({
          event,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationCourseRepository,
        });

        // then
        expect(events.length).to.equal(1);
        expect(events[0]).not.to.be.an.instanceOf(CertificationJuryDone);
      });
    });

    describe('when there is no impacted certification', function () {
      it('does not return a CertificationJuryDone event', async function () {
        // given
        const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
        const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub() };
        const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
        const challenge = domainBuilder.buildCertificationChallengeWithType({
          challengeId: 'recChal123',
          isNeutralized: false,
        });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationCourseId: 4567,
          certificationAnswersByDate: [
            domainBuilder.buildAnswer({ challengeId: 'recChal123', result: AnswerStatus.OK }),
          ],
          certificationChallenges: [challenge],
        });
        const certificationCourse = domainBuilder.buildCertificationCourse({ id: 4567, sessionId: 1234 });
        const certificationIssueReport1 = domainBuilder.buildCertificationIssueReport({
          category: CertificationIssueReportCategory.FRAUD,
          subcategory: null,
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
        const event = new SessionFinalized({
          sessionId: 1234,
          finalizedAt: new Date(),
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        });

        // when
        const events = await handleAutoJury({
          event,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationCourseRepository,
        });

        // then
        expect(events.length).to.equal(1);
        expect(events[0]).not.to.be.an.instanceOf(CertificationJuryDone);
      });
    });

    describe('when a resolution throws an exception', function () {
      it('should go on and try to resolve the others certification issue reports', async function () {
        // given
        const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
        const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
        const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
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
        const certificationCourse = domainBuilder.buildCertificationCourse({ id: 4567, sessionId: 1234 });
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
        const event = new SessionFinalized({
          sessionId: 1234,
          finalizedAt: new Date(),
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        });
        const logger = {
          error: sinon.stub(),
        };

        // when
        await handleAutoJury({
          event,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationCourseRepository,
          challengeRepository,
          logger,
        });

        // then
        expect(certificationIssueReport2.isResolved()).to.be.true;
        expect(logger.error).to.have.been.calledWithExactly(anError);
      });
    });
  });

  describe('when certification is V3', function () {
    let certificationCourseRepository, certificationIssueReportRepository, certificationAssessmentRepository;

    beforeEach(function () {
      certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
      certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
    });

    it('fails when event is not of correct type', async function () {
      // given
      const event = 'not an event of the correct type';

      // when
      const error = await catchErr(handleAutoJury)(event);

      // / then
      expect(error).not.to.be.null;
    });

    it('returns an AutoJuryDone event as last event', async function () {
      // given
      const now = Date.now();

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        version: 3,
        certificationAnswersByDate: [
          domainBuilder.buildAnswer({ challengeId: 'recChal123', result: AnswerStatus.SKIPPED }),
          domainBuilder.buildAnswer({ challengeId: 'recChal456', result: AnswerStatus.KO }),
          domainBuilder.buildAnswer({ challengeId: 'recChal789', result: AnswerStatus.OK }),
        ],
        certificationChallenges: [
          domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal123' }),
          domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal456' }),
          domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal789' }),
        ],
      });

      const certificationCourse = domainBuilder.buildCertificationCourse({ version: 3 });
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.getId() })
        .resolves(certificationAssessment);
      certificationCourseRepository.findCertificationCoursesBySessionId
        .withArgs({ sessionId: 1234 })
        .resolves([certificationCourse]);
      certificationIssueReportRepository.findByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.getId() })
        .resolves([]);

      const event = new SessionFinalized({
        sessionId: 1234,
        finalizedAt: now,
        hasExaminerGlobalComment: false,
        certificationCenterName: 'A certification center name',
        sessionDate: '2021-01-29',
        sessionTime: '14:00',
      });

      // when
      const resultEvents = await handleAutoJury({
        event,
        certificationIssueReportRepository,
        certificationAssessmentRepository,
        certificationCourseRepository,
      });

      // then
      const autoJuryDoneEvent = resultEvents[resultEvents.length - 1];
      expect(autoJuryDoneEvent).to.be.an.instanceof(AutoJuryDone);
      expect(autoJuryDoneEvent).to.deep.equal(
        new AutoJuryDone({
          sessionId: 1234,
          finalizedAt: now,
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        }),
      );
    });

    it('returns a CertificationJuryDone event first in returned collection', async function () {
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
      const event = new SessionFinalized({
        sessionId: 1234,
        finalizedAt: new Date(),
        hasExaminerGlobalComment: false,
        certificationCenterName: 'A certification center name',
        sessionDate: '2021-01-29',
        sessionTime: '14:00',
      });

      // when
      const events = await handleAutoJury({
        event,
        certificationIssueReportRepository,
        certificationAssessmentRepository,
        certificationCourseRepository,
      });

      // then
      expect(events[0]).to.be.an.instanceof(CertificationJuryDone);
      expect(events[0]).to.deep.equal(
        new CertificationJuryDone({
          certificationCourseId: certificationCourse.getId(),
        }),
      );
    });

    describe('when the certification is started', function () {
      it('returns a CertificationJuryDone event first in returned collection', async function () {
        // given
        const { certificationCourse } = _initializeV3CourseAndAssessment({
          certificationState: CertificationAssessment.states.STARTED,
          certificationAssessmentRepository,
          certificationCourseRepository,
          certificationIssueReportRepository,
        });
        const event = new SessionFinalized({
          sessionId: 1234,
          finalizedAt: new Date(),
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        });

        // when
        const events = await handleAutoJury({
          event,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationCourseRepository,
        });

        // then
        expect(events[0]).to.deepEqualInstance(
          new CertificationJuryDone({
            certificationCourseId: certificationCourse.getId(),
          }),
        );
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

        const event = new SessionFinalized({
          sessionId: 1234,
          finalizedAt: new Date(),
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        });

        // when
        await handleAutoJury({
          event,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationCourseRepository,
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

    describe('when the certification was ended by the supervisor', function () {
      it('returns a CertificationJuryDone event first in returned collection', async function () {
        // given
        const { certificationCourse } = _initializeV3CourseAndAssessment({
          certificationState: CertificationAssessment.states.ENDED_BY_SUPERVISOR,
          certificationAssessmentRepository,
          certificationCourseRepository,
          certificationIssueReportRepository,
        });

        const event = new SessionFinalized({
          sessionId: 1234,
          finalizedAt: new Date(),
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        });

        // when
        const events = await handleAutoJury({
          event,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationCourseRepository,
        });

        // then
        expect(events[0]).to.deepEqualInstance(
          new CertificationJuryDone({
            certificationCourseId: certificationCourse.getId(),
          }),
        );
      });
    });

    describe('when the certification was ended due to finalization', function () {
      it('does not return a CertificationJuryDone event', async function () {
        // given
        _initializeV3CourseAndAssessment({
          certificationState: CertificationAssessment.states.ENDED_DUE_TO_FINALIZATION,
          certificationAssessmentRepository,
          certificationCourseRepository,
          certificationIssueReportRepository,
        });
        const event = new SessionFinalized({
          sessionId: 1234,
          finalizedAt: new Date(),
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        });

        // when
        const events = await handleAutoJury({
          event,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationCourseRepository,
        });

        // then
        expect(events[0]).to.be.instanceOf(AutoJuryDone);
      });
    });

    describe('when certificationCourse is completed', function () {
      it('should not return a CertificationJuryDone', async function () {
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
        const event = new SessionFinalized({
          sessionId: 1234,
          finalizedAt: new Date(),
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        });

        // when
        const events = await handleAutoJury({
          event,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationCourseRepository,
        });

        // then
        expect(events[0]).not.to.be.an.instanceof(CertificationJuryDone);
        expect(events.length).to.equal(1);
      });
    });

    describe('when there is no impacted certification', function () {
      it('does not return a CertificationJuryDone event', async function () {
        // given
        const challenge = domainBuilder.buildCertificationChallengeWithType({
          challengeId: 'recChal123',
          isNeutralized: false,
        });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          version: 3,
          certificationCourseId: 4567,
          certificationAnswersByDate: [
            domainBuilder.buildAnswer({ challengeId: 'recChal123', result: AnswerStatus.OK }),
          ],
          certificationChallenges: [challenge],
        });
        const certificationCourse = domainBuilder.buildCertificationCourse({ id: 4567, sessionId: 1234, version: 3 });
        certificationCourseRepository.findCertificationCoursesBySessionId
          .withArgs({ sessionId: 1234 })
          .resolves([certificationCourse]);

        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: certificationCourse.getId() })
          .resolves(certificationAssessment);
        certificationAssessmentRepository.save.resolves();

        const event = new SessionFinalized({
          sessionId: 1234,
          finalizedAt: new Date(),
          hasExaminerGlobalComment: false,
          certificationCenterName: 'A certification center name',
          sessionDate: '2021-01-29',
          sessionTime: '14:00',
        });

        // when
        const events = await handleAutoJury({
          event,
          certificationIssueReportRepository,
          certificationAssessmentRepository,
          certificationCourseRepository,
        });

        // then
        expect(events.length).to.equal(2);
        expect(events[0]).to.be.an.instanceOf(CertificationJuryDone);
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
