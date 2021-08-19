const {
  sinon,
  expect,
  catchErr,
  domainBuilder,
} = require('../../../test-helper');

const finalizeSession = require('../../../../lib/domain/usecases/finalize-session');
const { SessionAlreadyFinalizedError, InvalidCertificationReportForFinalization } = require('../../../../lib/domain/errors');
const SessionFinalized = require('../../../../lib/domain/events/SessionFinalized');

describe('Unit | UseCase | finalize-session', function() {

  let sessionId;
  let updatedSession;
  let examinerGlobalComment;
  let sessionRepository;
  let certificationReportRepository;

  beforeEach(async function() {
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

  context('When the session status is already finalized', function() {

    beforeEach(function() {
      sessionRepository.isFinalized.withArgs(sessionId).resolves(true);
    });

    it('should throw a SessionAlreadyFinalizedError error', async function() {
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

  context('When the session status is not finalized yet ', function() {
    let certificationReports;
    context('When the certificationReports are not valid', function() {
      beforeEach(function() {
        const courseWithoutHasSeenLastScreen = domainBuilder.buildCertificationReport();
        delete courseWithoutHasSeenLastScreen.hasSeenEndTestScreen;
        certificationReports = [courseWithoutHasSeenLastScreen];
      });

      it('should throw an InvalidCertificationReportForFinalization error', async function() {
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

    context('When the certificationReports are valid', function() {
      const now = new Date('2019-01-01T05:06:07Z');
      let clock;

      beforeEach(function() {
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

      afterEach(function() {
        clock.restore();
      });

      it('should finalize session with expected arguments', async function() {
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

      it('raises a session finalized event', async function() {
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
          finalizedAt: new Date('2020-01-01T14:00:00Z'),
          hasExaminerGlobalComment: true,
          certificationCenterName: 'a certification center name',
          sessionDate: '2019-12-12',
          sessionTime: '16:00:00',
        }));
      });
    });
  });
});
