const { expect, sinon, hFake } = require('../../../test-helper');
const AssessmentAuhorization = require('../../../../lib/application/preHandlers/assessment-authorization');
const tokenService = require('../../../../lib/domain/services/token-service');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');

describe('Unit | Pre-handler | Assessment Authorization', () => {

  describe('#verify', () => {
    const request = {
      headers: { authorization: 'VALID_TOKEN' },
      params: {
        id: 8
      }
    };

    beforeEach(() => {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
      sinon.stub(tokenService, 'extractUserId');
      sinon.stub(assessmentRepository, 'getByUserIdAndAssessmentId');
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
      const promise = AssessmentAuhorization.verify(request, hFake);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(tokenService.extractUserId);
        sinon.assert.calledWith(tokenService.extractUserId, request.headers.authorization);
      });
    });

    describe('When assessment is linked to userId (userId exist)', () => {

      it('should reply with assessment', async () => {
        // given
        const fetchedAssessment = {};
        const extractedUserId = 'userId';
        tokenService.extractUserId.returns(extractedUserId);
        assessmentRepository.getByUserIdAndAssessmentId.resolves(fetchedAssessment);

        // when
        const response = await AssessmentAuhorization.verify(request, hFake);

        // then
        sinon.assert.calledOnce(assessmentRepository.getByUserIdAndAssessmentId);
        sinon.assert.calledWith(assessmentRepository.getByUserIdAndAssessmentId, request.params.id, extractedUserId);
        expect(response).to.deep.equal(fetchedAssessment);
      });
    });

    describe('When assessment is linked a null userId', () => {

      it('should reply with assessment', async () => {
        // given
        const fetchedAssessment = {};
        const extractedUserId = null;
        tokenService.extractUserId.returns(extractedUserId);
        assessmentRepository.getByUserIdAndAssessmentId.resolves(fetchedAssessment);

        // when
        const response = await AssessmentAuhorization.verify(request, hFake);

        // then
        sinon.assert.calledOnce(assessmentRepository.getByUserIdAndAssessmentId);
        sinon.assert.calledWith(assessmentRepository.getByUserIdAndAssessmentId, request.params.id, extractedUserId);
        expect(response).to.deep.equal(fetchedAssessment);
      });
    });

    describe('When userId (from token) is not linked to assessment', () => {
      it('should take over the request and response with 401 status code', async () => {
        // given
        const extractedUserId = null;
        tokenService.extractUserId.returns(extractedUserId);
        assessmentRepository.getByUserIdAndAssessmentId.rejects();
        // when
        const response = await AssessmentAuhorization.verify(request, hFake);

        // then
        expect(response.statusCode).to.equal(401);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });
});
