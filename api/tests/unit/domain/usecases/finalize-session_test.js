const {
  sinon,
  expect,
  catchErr,
  testErr,
} = require('../../../test-helper');

const finalizeSession = require('../../../../lib/domain/usecases/finalize-session');
const { ForbiddenAccess } = require('../../../../lib/domain/errors');

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

    beforeEach(async () => {
      sessionRepository.ensureUserHasAccessToSession.withArgs(userId, sessionId).resolves();
      sessionRepository.updateStatus.withArgs({ sessionId, status: 'finalized' }).resolves();
      sessionRepository.get.withArgs(sessionId).resolves(updatedSession);
    });

    it('should return the updated session', async () => {
      const res = await finalizeSession({ userId, sessionId, sessionRepository });
      expect(res).to.deep.equal(updatedSession);
    });
  });
});
