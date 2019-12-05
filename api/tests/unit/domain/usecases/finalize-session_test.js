const {
  sinon,
  expect,
  catchErr,
  testErr,
} = require('../../../test-helper');

const finalizeSession = require('../../../../lib/domain/usecases/finalize-session');
const { ForbiddenAccess, SessionAlreadyFinalizedError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | finalize-session', () => {

  let userId, sessionId, sessionRepository, updatedSession, examinerComment;

  beforeEach(async () => {

    userId = 'dummy user id';
    sessionId = 'dummy session id';
    updatedSession = Symbol('updated session');
    examinerComment = 'It was a fine session my dear.';
    sessionRepository = {
      updateStatusAndExaminerComment: sinon.stub(),
      ensureUserHasAccessToSession: sinon.stub(),
      isFinalized: sinon.stub(),
    };

  });
  context('When the user does not have the right to finalize the session', () => {

    beforeEach(async () => {
      sessionRepository.ensureUserHasAccessToSession.withArgs(userId, sessionId).rejects(testErr);
    });

    it('should throw a ForbiddenAccess error', async () => {
      const err = await catchErr(finalizeSession)({ userId, sessionId, sessionRepository, examinerComment });
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
        const err = await catchErr(finalizeSession)({ userId, sessionId, examinerComment, sessionRepository });

        // then
        expect(err).to.be.instanceOf(SessionAlreadyFinalizedError);
      });
    });

    context('When the session status is not finalized yet ', () => {

      beforeEach(() => {
        sessionRepository.isFinalized.withArgs(sessionId).resolves(false);
        sessionRepository.updateStatusAndExaminerComment.withArgs({ id: sessionId, status: 'finalized', examinerComment }).resolves(updatedSession);
      });

      it('should return the updated session', async () => {
        // when
        const res = await finalizeSession({ userId, sessionId, examinerComment, sessionRepository });

        // then
        expect(res).to.deep.equal(updatedSession);
      });
    });
  });
});
