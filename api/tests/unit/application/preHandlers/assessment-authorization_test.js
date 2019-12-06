const { expect, sinon, hFake } = require('../../../test-helper');
const AssessmentAuthorization = require('../../../../lib/application/preHandlers/assessment-authorization');
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
      sinon.stub(assessmentRepository, 'getByAssessmentIdAndUserId');
    });

    it('should be a function', () => {
      // then
      expect(AssessmentAuthorization.verify).to.be.a('function');
    });

    it('should get userId from token', () => {
      // given
      tokenService.extractTokenFromAuthChain.returns('VALID_TOKEN');
      tokenService.extractUserId.returns('userId');
      assessmentRepository.getByAssessmentIdAndUserId.resolves();

      // when
      const promise = AssessmentAuthorization.verify(request, hFake);

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
        assessmentRepository.getByAssessmentIdAndUserId.resolves(fetchedAssessment);

        // when
        const response = await AssessmentAuthorization.verify(request, hFake);

        // then
        sinon.assert.calledOnce(assessmentRepository.getByAssessmentIdAndUserId);
        sinon.assert.calledWith(assessmentRepository.getByAssessmentIdAndUserId, request.params.id, extractedUserId);
        expect(response).to.deep.equal(fetchedAssessment);
      });
    });

    describe('When assessment is linked a null userId', () => {

      it('should reply with assessment', async () => {
        // given
        const fetchedAssessment = {};
        const extractedUserId = null;
        tokenService.extractUserId.returns(extractedUserId);
        assessmentRepository.getByAssessmentIdAndUserId.resolves(fetchedAssessment);

        // when
        const response = await AssessmentAuthorization.verify(request, hFake);

        // then
        sinon.assert.calledOnce(assessmentRepository.getByAssessmentIdAndUserId);
        sinon.assert.calledWith(assessmentRepository.getByAssessmentIdAndUserId, request.params.id, extractedUserId);
        expect(response).to.deep.equal(fetchedAssessment);
      });
    });

    describe('When userId (from token) is not linked to assessment', () => {
      it('should take over the request and response with 401 status code', async () => {
        // given
        const extractedUserId = null;
        tokenService.extractUserId.returns(extractedUserId);
        assessmentRepository.getByAssessmentIdAndUserId.rejects();
        // when
        const response = await AssessmentAuthorization.verify(request, hFake);

        // then
        expect(response.statusCode).to.equal(401);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });
});
