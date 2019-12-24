const {
  sinon,
  expect,
  catchErr,
} = require('../../../test-helper');

const finalizeSession = require('../../../../lib/domain/usecases/finalize-session');
const { SessionAlreadyFinalizedError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | finalize-session', () => {

  let sessionId;
  let updatedSession;
  let examinerComment;
  let certificationCandidates;
  let sessionRepository;
  let certificationCandidateRepository;

  beforeEach(async () => {
    sessionId = 'dummy session id';
    updatedSession = Symbol('updated session');
    examinerComment = 'It was a fine session my dear.';
    certificationCandidates = Symbol('certificationCandidates');
    sessionRepository = {
      updateStatusAndExaminerComment: sinon.stub(),
      isFinalized: sinon.stub(),
    };
    certificationCandidateRepository = {
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
        examinerComment,
        sessionRepository,
        certificationCandidates,
        certificationCandidateRepository
      });

      // then
      expect(err).to.be.instanceOf(SessionAlreadyFinalizedError);
    });

  });

  context('When the session status is not finalized yet ', () => {

    beforeEach(() => {
      sessionRepository.isFinalized.withArgs(sessionId).resolves(false);
      certificationCandidateRepository.finalizeAll.withArgs(certificationCandidates).resolves();
      sessionRepository.updateStatusAndExaminerComment.withArgs({
        id: sessionId,
        status: 'finalized',
        examinerComment,
      }).resolves(updatedSession);
    });

    it('should return the updated session', async () => {
      // when
      const res = await finalizeSession({
        sessionId,
        examinerComment,
        sessionRepository,
        certificationCandidates,
        certificationCandidateRepository,
      });

      // then
      expect(res).to.deep.equal(updatedSession);
    });

  });

});
