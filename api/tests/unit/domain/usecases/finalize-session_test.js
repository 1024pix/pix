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
  let examinerGlobalComment;
  let certificationCandidates;
  let sessionRepository;
  let certificationCandidateRepository;

  beforeEach(async () => {
    sessionId = 'dummy session id';
    updatedSession = Symbol('updated session');
    examinerGlobalComment = 'It was a fine session my dear.';
    certificationCandidates = Symbol('certificationCandidates');
    sessionRepository = {
      updateStatusAndExaminerGlobalComment: sinon.stub(),
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
        examinerGlobalComment,
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
      sessionRepository.updateStatusAndExaminerGlobalComment.withArgs({
        id: sessionId,
        status: 'finalized',
        examinerGlobalComment,
      }).resolves(updatedSession);
    });

    it('should return the updated session', async () => {
      // when
      const res = await finalizeSession({
        sessionId,
        examinerGlobalComment,
        sessionRepository,
        certificationCandidates,
        certificationCandidateRepository,
      });

      // then
      expect(res).to.deep.equal(updatedSession);
    });

  });

});
