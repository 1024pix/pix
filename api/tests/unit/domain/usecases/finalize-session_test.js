const {
  sinon,
  expect,
  catchErr,
} = require('../../../test-helper');

const finalizeSession = require('../../../../lib/domain/usecases/finalize-session');
const { SessionAlreadyFinalizedError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | finalize-session', () => {

  let sessionId, sessionRepository, updatedSession, examinerComment;

  beforeEach(async () => {
    sessionId = 'dummy session id';
    updatedSession = Symbol('updated session');
    examinerComment = 'It was a fine session my dear.';
    sessionRepository = {
      updateStatusAndExaminerComment: sinon.stub(),
      isFinalized: sinon.stub(),
    };

  });

  context('When the session status is already finalized', () => {

    beforeEach(() => {
      sessionRepository.isFinalized.withArgs(sessionId).resolves(true);
    });

    it('should throw a SessionAlreadyFinalizedError error', async () => {
      // when
      const err = await catchErr(finalizeSession)({ sessionId, examinerComment, sessionRepository });

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
      const res = await finalizeSession({ sessionId, examinerComment, sessionRepository });

      // then
      expect(res).to.deep.equal(updatedSession);
    });
  });
});
