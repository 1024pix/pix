import { NotFoundError } from '../../../../lib/domain/errors.js';
import { flagSessionResultsAsSentToPrescriber } from '../../../../lib/domain/usecases/flag-session-results-as-sent-to-prescriber.js';
import { Session } from '../../../../src/certification/enrolment/domain/models/Session.js';
import { catchErr, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | flag-session-results-as-sent-to-prescriber', function () {
  let sessionId;
  let sessionRepository;

  beforeEach(function () {
    sessionRepository = { flagResultsAsSentToPrescriber: sinon.stub(), get: sinon.stub() };
  });

  context('when session id is not a number', function () {
    it('should throw a NotFound error', async function () {
      // given
      sessionId = 'notANumber';

      // when
      const error = await catchErr(flagSessionResultsAsSentToPrescriber)({ sessionId, sessionRepository });

      // then
      expect(error).to.be.an.instanceOf(NotFoundError);
    });
  });

  context('when session id is a number', function () {
    beforeEach(function () {
      sessionId = 1;
    });

    context('when results are already flagged as sent', function () {
      const alreadyFlaggedResultsAsSentSession = new Session({ resultsSentToPrescriberAt: new Date() });

      it('should return a NON updated session with a flag to indicate that results has already been sent', async function () {
        // given
        sessionRepository.get.withArgs({ id: sessionId }).resolves(alreadyFlaggedResultsAsSentSession);

        // when
        const { resultsFlaggedAsSent, session } = await flagSessionResultsAsSentToPrescriber({
          sessionId,
          sessionRepository,
        });

        // then
        expect(resultsFlaggedAsSent).to.be.false;
        expect(session).to.equal(alreadyFlaggedResultsAsSentSession);
      });
    });

    context('when results are not flagged as sent yet', function () {
      let notFlaggedSession, updatedSession;
      const now = new Date('2019-01-01T05:06:07Z');
      let clock;

      beforeEach(function () {
        updatedSession = Symbol('updatedSession');
        clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
<<<<<<< HEAD
        notFlaggedSession = new Session({ resultsSentToPrescriberAt: null });
        sessionEnrolmentRepository.get.withArgs({ id: sessionId }).resolves(notFlaggedSession);
=======
        notFlaggedSession = new SessionManagement({ resultsSentToPrescriberAt: null });
        sessionRepository.get.withArgs({ id: sessionId }).resolves(notFlaggedSession);
>>>>>>> b11622406a (fixup! :truck: api: Split session-repo in session and enrolment)
      });

      afterEach(function () {
        clock.restore();
      });

      it('should return an updated session with a flag to indicate that the flagging has been done', async function () {
        // given
        sessionRepository.flagResultsAsSentToPrescriber
          .withArgs({ id: sessionId, resultsSentToPrescriberAt: now })
          .resolves(updatedSession);

        // when
        const { resultsFlaggedAsSent, session } = await flagSessionResultsAsSentToPrescriber({
          sessionId,
          sessionRepository,
        });

        // then
        expect(resultsFlaggedAsSent).to.be.true;
        expect(session).to.equal(updatedSession);
      });
    });
  });
});
