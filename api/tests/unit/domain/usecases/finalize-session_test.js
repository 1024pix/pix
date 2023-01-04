const { sinon, expect, catchErr, domainBuilder } = require('../../../test-helper');

const finalizeSession = require('../../../../lib/domain/usecases/finalize-session');
const {
  SessionAlreadyFinalizedError,
  SessionWithoutStartedCertificationError,
  SessionWithAbortReasonOnCompletedCertificationCourseError,
  SessionWithMissingAbortReasonError,
  InvalidCertificationReportForFinalization,
} = require('../../../../lib/domain/errors');
const SessionFinalized = require('../../../../lib/domain/events/SessionFinalized');

describe('Unit | UseCase | finalize-session', function () {
  let sessionId;
  let updatedSession;
  let examinerGlobalComment;
  let sessionRepository;
  let certificationReportRepository;
  let certificationCourseRepository;
  let hasIncident;
  let hasJoiningIssue;

  beforeEach(async function () {
    sessionId = 'dummy session id';
    updatedSession = domainBuilder.buildSession({
      id: sessionId,
      examinerGlobalComment,
      hasIncident,
      hasJoiningIssue,
      finalizedAt: new Date(),
    });
    examinerGlobalComment = 'It was a fine session my dear.';
    sessionRepository = {
      finalize: sinon.stub(),
      isFinalized: sinon.stub(),
      hasNoStartedCertification: sinon.stub(),
      countUncompletedCertifications: sinon.stub(),
    };
    certificationReportRepository = {
      finalizeAll: sinon.stub(),
    };

    certificationCourseRepository = {
      findCertificationCoursesBySessionId: sinon.stub(),
      update: sinon.stub(),
    };
  });

  context('When the session status is already finalized', function () {
    beforeEach(function () {
      sessionRepository.isFinalized.withArgs(sessionId).resolves(true);
    });

    it('should throw a SessionAlreadyFinalizedError error', async function () {
      // when
      const err = await catchErr(finalizeSession)({
        sessionId,
        examinerGlobalComment,
        sessionRepository,
        certificationReports: [],
        certificationReportRepository,
      });

      // then
      expect(err).to.be.instanceOf(SessionAlreadyFinalizedError);
    });
  });

  context('When the session has not started yet', function () {
    it('should throw a SessionWithoutStartedCertificationError error', async function () {
      // given
      sessionRepository.hasNoStartedCertification.withArgs(sessionId).resolves(true);

      // when
      const err = await catchErr(finalizeSession)({
        sessionId,
        examinerGlobalComment,
        sessionRepository,
        certificationReports: [],
        certificationReportRepository,
      });

      // then
      expect(err).to.be.instanceOf(SessionWithoutStartedCertificationError);
    });
  });

  context('When the session status is not finalized yet ', function () {
    let certificationReports;
    context('When the certificationReports are not valid', function () {
      beforeEach(function () {
        const courseWithoutHasSeenLastScreen = domainBuilder.buildCertificationReport();
        delete courseWithoutHasSeenLastScreen.hasSeenEndTestScreen;
        certificationReports = [courseWithoutHasSeenLastScreen];
      });

      it('should throw an InvalidCertificationReportForFinalization error', async function () {
        // when
        const err = await catchErr(finalizeSession)({
          sessionId,
          examinerGlobalComment,
          sessionRepository,
          certificationReports,
          certificationReportRepository,
          certificationCourseRepository,
        });

        // then
        expect(err).to.be.instanceOf(InvalidCertificationReportForFinalization);
      });
    });

    context('When there is an abort reason for completed certification course', function () {
      it('should throw an SessionWithAbortReasonOnCompletedCertificationCourseError error', async function () {
        // given
        const reportWithAbortReason = domainBuilder.buildCertificationReport({
          abortReason: 'candidate',
          certificationCourseId: 1234,
        });
        const certificationReports = [reportWithAbortReason];
        const completedCertificationCourse = domainBuilder.buildCertificationCourse({
          id: 1234,
          abortReason: 'candidate',
          completedAt: '2022-01-01',
        });
        sessionRepository.countUncompletedCertifications.withArgs(sessionId).resolves(0);
        certificationCourseRepository.findCertificationCoursesBySessionId
          .withArgs({ sessionId })
          .resolves([completedCertificationCourse]);

        certificationCourseRepository.update.resolves(
          domainBuilder.buildCertificationCourse({ ...completedCertificationCourse, abortReason: null })
        );

        // when
        const err = await catchErr(finalizeSession)({
          sessionId,
          examinerGlobalComment,
          sessionRepository,
          certificationReports,
          certificationReportRepository,
          certificationCourseRepository,
        });

        // then
        expect(certificationCourseRepository.update).to.have.been.calledOnce;
        expect(err).to.be.instanceOf(SessionWithAbortReasonOnCompletedCertificationCourseError);
      });
    });

    context('When there is no abort reason for uncompleted certification course', function () {
      it('should throw an SessionWithMissingAbortReasonError error', async function () {
        // given
        const certificationReports = [];
        const uncompletedCertificationCourse = domainBuilder.buildCertificationCourse({
          id: 1234,
          abortReason: null,
          completedAt: null,
        });
        sessionRepository.countUncompletedCertifications.withArgs(sessionId).resolves(1);
        certificationCourseRepository.findCertificationCoursesBySessionId
          .withArgs({ sessionId })
          .resolves([uncompletedCertificationCourse]);

        certificationCourseRepository.update.resolves(
          domainBuilder.buildCertificationCourse({ ...uncompletedCertificationCourse, abortReason: null })
        );

        // when
        const err = await catchErr(finalizeSession)({
          sessionId,
          examinerGlobalComment,
          sessionRepository,
          certificationReports,
          certificationReportRepository,
          certificationCourseRepository,
        });

        // then
        expect(certificationCourseRepository.update).not.to.have.been.calledOnce;
        expect(err).to.be.instanceOf(SessionWithMissingAbortReasonError);
      });
    });

    context('When the certificationReports are valid', function () {
      const now = new Date('2019-01-01T05:06:07Z');
      let clock;

      beforeEach(function () {
        const validReportForFinalization = domainBuilder.buildCertificationReport({
          examinerComment: 'signalement sur le candidat',
          hasSeenEndTestScreen: false,
        });
        certificationReports = [validReportForFinalization];
        sessionRepository.isFinalized.withArgs(sessionId).resolves(false);
        certificationReportRepository.finalizeAll.withArgs(certificationReports).resolves();
        sessionRepository.finalize
          .withArgs({
            id: sessionId,
            examinerGlobalComment,
            finalizedAt: now,
          })
          .resolves(updatedSession);
      });

      afterEach(function () {
        clock.restore();
      });

      it('should finalize session with expected arguments', async function () {
        // given
        clock = sinon.useFakeTimers(now);
        const validReportForFinalization = domainBuilder.buildCertificationReport({
          examinerComment: 'signalement sur le candidat',
          hasSeenEndTestScreen: false,
          isCompleted: true,
        });
        certificationReports = [validReportForFinalization];
        sessionRepository.isFinalized.withArgs(sessionId).resolves(false);
        certificationReportRepository.finalizeAll.withArgs(certificationReports).resolves();
        sessionRepository.finalize
          .withArgs({
            id: sessionId,
            examinerGlobalComment,
            hasIncident,
            hasJoiningIssue,
            finalizedAt: now,
          })
          .resolves(updatedSession);

        // when
        await finalizeSession({
          sessionId,
          examinerGlobalComment,
          hasIncident,
          hasJoiningIssue,
          sessionRepository,
          certificationReports,
          certificationReportRepository,
          certificationCourseRepository,
        });

        // then
        expect(
          sessionRepository.finalize.calledWithExactly({
            id: sessionId,
            examinerGlobalComment,
            hasIncident,
            hasJoiningIssue,
            finalizedAt: now,
          })
        ).to.be.true;
      });

      it('raises a session finalized event', async function () {
        // given
        const updatedSession = domainBuilder.buildSession({
          finalizedAt: new Date('2020-01-01T14:00:00Z'),
          examinerGlobalComment: 'an examiner comment',
          certificationCenter: 'a certification center name',
          date: '2019-12-12',
          time: '16:00:00',
        });
        clock = sinon.useFakeTimers(now);
        const validReportForFinalization = domainBuilder.buildCertificationReport({
          examinerComment: 'signalement sur le candidat',
          hasSeenEndTestScreen: false,
          isCompleted: true,
        });
        certificationReports = [validReportForFinalization];
        sessionRepository.isFinalized.withArgs(sessionId).resolves(false);
        certificationReportRepository.finalizeAll.withArgs(certificationReports).resolves();
        sessionRepository.finalize
          .withArgs({
            id: sessionId,
            examinerGlobalComment,
            hasIncident,
            hasJoiningIssue,
            finalizedAt: now,
          })
          .resolves(updatedSession);

        // when
        const event = await finalizeSession({
          sessionId,
          examinerGlobalComment,
          hasIncident,
          hasJoiningIssue,
          sessionRepository,
          certificationReports,
          certificationReportRepository,
          certificationCourseRepository,
        });

        // then
        expect(event).to.be.an.instanceof(SessionFinalized);
        expect(event).to.deep.equal(
          new SessionFinalized({
            sessionId,
            finalizedAt: new Date('2020-01-01T14:00:00Z'),
            hasExaminerGlobalComment: true,
            certificationCenterName: 'a certification center name',
            sessionDate: '2019-12-12',
            sessionTime: '16:00:00',
          })
        );
      });
    });
  });
});
