const { expect, sinon, catchErr } = require('../../../test-helper');
const flagSessionResultsAsSentToPrescriber = require('../../../../lib/domain/usecases/flag-session-results-as-sent-to-prescriber');
const Session = require('../../../../lib/domain/models/Session');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | set-date-of-sending-results-to-prescriber', () => {
  let sessionId;
  let sessionRepository;

  beforeEach(() => {
    sessionRepository = { get: sinon.stub(), flagResultsAsSentToPrescriber: sinon.stub() };
  });

  context('when session id is not a number', () => {

    it('should throw a NotFound error', async () => {
      // given
      sessionId = 'notANumber';

      // when
      const error = await catchErr(flagSessionResultsAsSentToPrescriber)({ sessionId, sessionRepository });

      // then
      expect(error).to.be.an.instanceOf(NotFoundError);
    });
  });

  context('when session id is a number', () => {

    beforeEach(() => {
      sessionId = 1;
    });

    context('when results are already flagged as sent', () => {
      const alreadyFlaggedResultsAsSentSession = new Session({ resultsSentToPrescriberAt: new Date() });

      it('should return a NON updated session with a flag to indicate that results has already been sent', async () => {
        // given
        sessionRepository.get.withArgs(sessionId).resolves(alreadyFlaggedResultsAsSentSession);

        // when
        const { resultsFlaggedAsSent, session } = await flagSessionResultsAsSentToPrescriber({ sessionId, sessionRepository });

        // then
        expect(resultsFlaggedAsSent).to.be.false;
        expect(session).to.equal(alreadyFlaggedResultsAsSentSession);
      });
    });

    context('when results are not flagged as sent yet', () => {
      let notFlaggedSession;
      const updatedSession = Symbol('updatedSession');
      const now = new Date('2019-01-01T05:06:07Z');
      let clock;

      beforeEach(() => {
        clock = sinon.useFakeTimers(now);
        notFlaggedSession = new Session({ resultsSentToPrescriberAt: null });
        sessionRepository.get.withArgs(sessionId).resolves(notFlaggedSession);
      });

      afterEach(() => {
        clock.restore();
      });

      it('should return an updated session with a flag to indicate that the flagging has been done', async () => {
        // given
        sessionRepository.flagResultsAsSentToPrescriber.withArgs({ id: sessionId, resultsSentToPrescriberAt: now }).resolves(updatedSession);

        // when
        const { resultsFlaggedAsSent, session } = await flagSessionResultsAsSentToPrescriber({ sessionId, sessionRepository });

        // then
        expect(resultsFlaggedAsSent).to.be.true;
        expect(session).to.equal(updatedSession);
      });
    });
  });
});
