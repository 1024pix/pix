const {
  sinon,
  expect,
  catchErr,
  domainBuilder,
} = require('../../../test-helper');

const finalizeSession = require('../../../../lib/domain/usecases/finalize-session');
const { SessionAlreadyFinalizedError, InvalidCertificationReportForFinalization } = require('../../../../lib/domain/errors');
const SessionFinalized = require('../../../../lib/domain/events/SessionFinalized');

describe('Unit | UseCase | finalize-session', () => {

  let sessionId;
  let updatedSession;
  let examinerGlobalComment;
  let sessionRepository;
  let certificationReportRepository;

  beforeEach(async () => {
    sessionId = 'dummy session id';
    updatedSession = domainBuilder.buildSession({
      id: sessionId,
      examinerGlobalComment,
      finalizedAt: new Date(),
    });
    examinerGlobalComment = 'It was a fine session my dear.';
    sessionRepository = {
      finalize: sinon.stub(),
      isFinalized: sinon.stub(),
    };
    certificationReportRepository = {
      finalizeAll: sinon.stub(),
    };
  });

  context('When the session status is already finalized', () => {

    beforeEach(() => {
      sessionRepository.isFinalized.withArgs(sessionId).resolves(true);
    });

    it('should throw a SessionAlreadyFinalizedError error', async () => {
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

  context('When the session status is not finalized yet ', () => {
    let certificationReports;
    context('When the certificationReports are not valid', () => {
      beforeEach(() => {
        const courseWithoutHasSeenLastScreen = domainBuilder.buildCertificationReport();
        delete courseWithoutHasSeenLastScreen.hasSeenEndTestScreen;
        certificationReports = [courseWithoutHasSeenLastScreen];
      });

      it('should throw an InvalidCertificationReportForFinalization error', async () => {
        // when
        const err = await catchErr(finalizeSession)({
          sessionId,
          examinerGlobalComment,
          sessionRepository,
          certificationReports,
          certificationReportRepository,
        });

        // then
        expect(err).to.be.instanceOf(InvalidCertificationReportForFinalization);
      });
    });

    context('When the certificationReports are valid', () => {
      const now = new Date('2019-01-01T05:06:07Z');
      let clock;

      beforeEach(() => {
        clock = sinon.useFakeTimers(now);
        const validReportForFinalization = domainBuilder.buildCertificationReport({
          examinerComment: 'signalement sur le candidat',
          hasSeenEndTestScreen: false,
        });
        certificationReports = [validReportForFinalization];
        sessionRepository.isFinalized.withArgs(sessionId).resolves(false);
        certificationReportRepository.finalizeAll.withArgs(certificationReports).resolves();
        sessionRepository.finalize.withArgs({
          id: sessionId,
          examinerGlobalComment,
          finalizedAt: now,
        }).resolves(updatedSession);
      });

      afterEach(() => {
        clock.restore();
      });

      it('should finalize session with expected arguments', async () => {
        // given
        clock = sinon.useFakeTimers(now);
        const validReportForFinalization = domainBuilder.buildCertificationReport({
          examinerComment: 'signalement sur le candidat',
          hasSeenEndTestScreen: false,
        });
        certificationReports = [validReportForFinalization];
        sessionRepository.isFinalized.withArgs(sessionId).resolves(false);
        certificationReportRepository.finalizeAll.withArgs(certificationReports).resolves();
        sessionRepository.finalize.withArgs({
          id: sessionId,
          examinerGlobalComment,
          finalizedAt: now,
        }).resolves(updatedSession);

        // when
        await finalizeSession({
          sessionId,
          examinerGlobalComment,
          sessionRepository,
          certificationReports,
          certificationReportRepository,
        });

        // then
        expect(sessionRepository.finalize.calledWithExactly({
          id: sessionId,
          examinerGlobalComment,
          finalizedAt: now,
        })).to.be.true;
      });

      it('raises a session finalized event', async () => {
        // given
        clock = sinon.useFakeTimers(now);
        const validReportForFinalization = domainBuilder.buildCertificationReport({
          examinerComment: 'signalement sur le candidat',
          hasSeenEndTestScreen: false,
        });
        certificationReports = [validReportForFinalization];
        sessionRepository.isFinalized.withArgs(sessionId).resolves(false);
        certificationReportRepository.finalizeAll.withArgs(certificationReports).resolves();
        sessionRepository.finalize.withArgs({
          id: sessionId,
          examinerGlobalComment,
          finalizedAt: now,
        }).resolves(updatedSession);

        // when
        const event = await finalizeSession({
          sessionId,
          examinerGlobalComment,
          sessionRepository,
          certificationReports,
          certificationReportRepository,
        });

        // then
        expect(event).to.be.an.instanceof(SessionFinalized);
        expect(event).to.deep.equal(new SessionFinalized({
          sessionId,
          finalizedAt: updatedSession.finalizedAt,
          hasExaminerGlobalComment: Boolean(examinerGlobalComment),
          certificationCenterName: updatedSession.certificationCenterName,
          sessionDate: updatedSession.date,
          sessionTime: updatedSession.time,
        }));
      });
    });
  });
});
