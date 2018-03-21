const { expect, sinon } = require('../../../test-helper');
const AssessmentAuhorization = require('../../../../lib/application/preHandlers/assessment-authorization');
const tokenService = require('../../../../lib/domain/services/token-service');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');

describe('Unit | Pre-handler | Assessment Authorization', () => {

  describe('#verify', () => {

    let sandbox;
    let replyStub;
    let codeStub;
    const request = {
      headers: { authorization: 'VALID_TOKEN' },
      params: {
        id: 8
      }
    };

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(tokenService, 'extractTokenFromAuthChain');
      sandbox.stub(tokenService, 'extractUserId');
      sandbox.stub(assessmentRepository, 'getByUserIdAndAssessmentId');
      codeStub = sandbox.stub();
      replyStub = sandbox.stub().returns({
        code: codeStub
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should be a function', () => {
      // then
      expect(AssessmentAuhorization.verify).to.be.a('function');
    });

    it('should get userId from token', () => {
      // given
      tokenService.extractTokenFromAuthChain.returns('VALID_TOKEN');
      tokenService.extractUserId.returns('userId');
      assessmentRepository.getByUserIdAndAssessmentId.resolves();

      // when
      const promise = AssessmentAuhorization.verify(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(tokenService.extractUserId);
        sinon.assert.calledWith(tokenService.extractUserId, request.headers.authorization);
      });
    });

    describe('When assessment is linked to userId (userId exist)', () => {

      it('should reply with assessment', () => {
        // given
        const fetchedAssessment = {};
        const extractedUserId = 'userId';
        tokenService.extractUserId.returns(extractedUserId);
        assessmentRepository.getByUserIdAndAssessmentId.resolves(fetchedAssessment);

        // when
        const promise = AssessmentAuhorization.verify(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(assessmentRepository.getByUserIdAndAssessmentId);
          sinon.assert.calledWith(assessmentRepository.getByUserIdAndAssessmentId, request.params.id, extractedUserId);
          sinon.assert.calledOnce(replyStub);
          sinon.assert.calledWith(replyStub, fetchedAssessment);
        });
      });
    });

    describe('When assessment is linked a null userId', () => {

      it('should reply with assessment', () => {
        // given
        const fetchedAssessment = {};
        const extractedUserId = null;
        tokenService.extractUserId.returns(extractedUserId);
        assessmentRepository.getByUserIdAndAssessmentId.resolves(fetchedAssessment);

        // when
        const promise = AssessmentAuhorization.verify(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(assessmentRepository.getByUserIdAndAssessmentId);
          sinon.assert.calledWith(assessmentRepository.getByUserIdAndAssessmentId, request.params.id, extractedUserId);
          sinon.assert.calledOnce(replyStub);
          sinon.assert.calledWith(replyStub, fetchedAssessment);
        });
      });
    });

    describe('When userId (from token) is not linked to assessment', () => {
      it('should take over the request and response with 401 status code', () => {
        // given
        const extractedUserId = null;
        const takeOverSpy = sinon.spy();
        codeStub.returns({
          takeover: takeOverSpy
        });
        tokenService.extractUserId.returns(extractedUserId);
        assessmentRepository.getByUserIdAndAssessmentId.rejects();
        // when
        const promise = AssessmentAuhorization.verify(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(replyStub);
          sinon.assert.calledWith(codeStub, 401);
          sinon.assert.calledOnce(takeOverSpy);
        });
      });
    });

  });
});
