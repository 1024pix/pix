const { expect, sinon, catchErr } = require('../../../test-helper');
const flagSessionResultsAsSentToPrescriber = require('../../../../lib/domain/usecases/flag-session-results-as-sent-to-prescriber');
const Session = require('../../../../lib/domain/models/Session');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | flag-session-results-as-sent-to-prescriber', () => {
  let sessionId;
  let sessionRepository;

  beforeEach(() => {
    sessionRepository = { get: sinon.stub(), update: sinon.stub() };
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

    context('when session doesn\'t exist', () => {

      it('should throw a NotFound error', async () => {
        // given
        sessionRepository.get.withArgs(sessionId).rejects();

        // when
        const error = await catchErr(flagSessionResultsAsSentToPrescriber)({ sessionId, sessionRepository });

        // then
        expect(sessionRepository.get).to.have.been.calledOnce;
        expect(error).to.be.an.instanceOf(NotFoundError);
      });
    });

    context('when session exists', () => {

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

        beforeEach(() => {
          notFlaggedSession = new Session({ resultsSentToPrescriberAt: null });
          sessionRepository.get.withArgs(sessionId).resolves(notFlaggedSession);
        });

        it('should return an updated session with a flag to indicate that the flagging has been done', async () => {
          // given
          sessionRepository.update.withArgs(notFlaggedSession).resolves(updatedSession);

          // when
          const { resultsFlaggedAsSent, session } = await flagSessionResultsAsSentToPrescriber({ sessionId, sessionRepository });

          // then
          expect(resultsFlaggedAsSent).to.be.true;
          expect(session).to.equal(updatedSession);
        });

        it('should have set property resultsSentToPrescriberAt with now date', async () => {
          // given
          const now = new Date();
          const clock = sinon.useFakeTimers(now);
          sessionRepository.update.withArgs(notFlaggedSession).resolves(updatedSession);

          // when
          await flagSessionResultsAsSentToPrescriber({ sessionId, sessionRepository });
          clock.restore();

          // then
          expect(notFlaggedSession.resultsSentToPrescriberAt).to.deep.equal(now);
        });
      });
    });
  });
});
