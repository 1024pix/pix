const { expect, sinon, catchErr } = require('../../../test-helper');
const assignUserToSession = require('../../../../lib/domain/usecases/assign-user-to-session');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | assign-user-to-session', () => {
  let sessionId;
  const userId = 'someUserId';
  let sessionRepository;

  beforeEach(() => {
    sessionRepository = { assignUser: sinon.stub(), get: sinon.stub() };
  });

  context('when session id is not a number', () => {

    it('should throw a NotFound error', async () => {
      // given
      sessionId = 'notANumber';

      // when
      const error = await catchErr(assignUserToSession)({ sessionId, userId, sessionRepository });

      // then
      expect(error).to.be.an.instanceOf(NotFoundError);
    });
  });

  context('when session id is a number', () => {
    const returnedSession = Symbol('returnedSession');

    beforeEach(() => {
      sessionId = 1;
    });

    context('when the session does not exist', () => {

      beforeEach(() => {
        sessionRepository.get.withArgs(sessionId).rejects();
        sessionRepository.assignUser.rejects();
      });

      it('should throw a NotFound error when getting the session', async () => {
        // when
        const error = await catchErr(assignUserToSession)({ sessionId, userId, sessionRepository });

        // then
        sinon.assert.calledOnce(sessionRepository.get);
        expect(error).to.be.an.instanceOf(NotFoundError);
      });
    });

    context('when the session exists', () => {

      beforeEach(() => {
        sessionRepository.get.withArgs(sessionId).resolves();
        sessionRepository.assignUser.withArgs({ id: sessionId, assignedUserId: userId }).resolves(returnedSession);
      });

      it('should return the session after assigningUser to it', async () => {
        // when
        const actualSession = await assignUserToSession({ sessionId, userId, sessionRepository });

        // then
        expect(actualSession).to.equal(returnedSession);
      });
    });
  });
});
