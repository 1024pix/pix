const {
  sinon,
  expect,
  catchErr,
  testErr,
} = require('../../../test-helper');

const finalizeSession = require('../../../../lib/domain/usecases/finalize-session');
const { ForbiddenAccess, SessionAlreadyFinalizedError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | finalize-session', () => {

  let userId, sessionId, sessionRepository, updatedSession;

  beforeEach(async () => {

    userId = 'dummy user id';
    sessionId = 'dummy session id';
    updatedSession = 'updated session';
    sessionRepository = {
      get: sinon.stub(),
      updateStatus: sinon.stub(),
      ensureUserHasAccessToSession: sinon.stub(),
      isFinalized: sinon.stub(),
    };

  });
  context('When the user does not have the right to finalize the session', () => {

    beforeEach(async () => {
      sessionRepository.ensureUserHasAccessToSession.withArgs(userId, sessionId).rejects(testErr);
    });

    it('should throw a ForbiddenAccess error', async () => {
      const err = await catchErr(finalizeSession)({ userId, sessionId, sessionRepository });
      expect(err).to.be.instanceOf(ForbiddenAccess);
    });
  });
  context('When the user has the rights', () => {

    beforeEach(() => {
      sessionRepository.ensureUserHasAccessToSession.withArgs(userId, sessionId).resolves();
    });

    context('When the session status is already finalized', () => {

      beforeEach(() => {
        sessionRepository.isFinalized.withArgs(sessionId).resolves(true);
      });

      it('should throw a SessionAlreadyFinalizedError error', async () => {
        // when
        const err = await catchErr(finalizeSession)({ userId, sessionId, sessionRepository });

        // then
        expect(err).to.be.instanceOf(SessionAlreadyFinalizedError);
      });
    });

    context('When the session status is not finalized yet ', () => {

      beforeEach(() => {
        sessionRepository.isFinalized.withArgs(sessionId).resolves(false);
        sessionRepository.updateStatus.withArgs({ sessionId, status: 'finalized' }).resolves();
        sessionRepository.get.withArgs(sessionId).resolves(updatedSession);
      });

      it('should return the updated session', async () => {
        // when
        const res = await finalizeSession({ userId, sessionId, sessionRepository });

        // then
        expect(res).to.deep.equal(updatedSession);
      });
    });
  });
});
