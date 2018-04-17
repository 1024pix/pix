const { sinon, expect } = require('../../../test-helper');
const JSONAPIError = require('jsonapi-serializer').Error;
const usecases = require('../../../../lib/domain/usecases');
const Solution = require('../../../../lib/domain/models/Solution');
const { NotFoundError, NotCompletedAssessmentError } = require('../../../../lib/domain/errors');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const solutionRepository = require('../../../../lib/infrastructure/repositories/solution-repository');

const solutionsController = require('../../../../lib/application/solutions/solutions-controller');

describe('Unit | Controller | solutions-controller', () => {

  let replyStub;
  let codeStub;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    codeStub = sinon.stub();
    replyStub = sinon.stub().returns({
      code: codeStub
    });
    sandbox.stub(usecases, 'getSolutionForAnswerWhenAssessmentEnded');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#find', () => {

    function _buildRequest(assessmentId, answerId) {
      return {
        query: {
          assessmentId: assessmentId,
          answerId: answerId
        }
      };
    }

    it('should return an 400 error when query param assessmentId is missing', () => {
      // given
      const request = _buildRequest(undefined, '213');
      const expectedError = JSONAPIError({
        code: '400',
        title: 'Missing Query Parameter',
        detail: 'Missing assessmentId query parameter.'
      });

      // when
      const promise = solutionsController.find(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(replyStub, expectedError);
        sinon.assert.calledWith(codeStub, 400);
      });
    });

    it('should return an 400 error when query param answerId is missing', () => {
      // given
      const request = _buildRequest('213', undefined);
      const expectedError = JSONAPIError({
        code: '400',
        title: 'Missing Query Parameter',
        detail: 'Missing answerId query parameter.'
      });

      // when
      const promise = solutionsController.find(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(replyStub, expectedError);
        sinon.assert.calledWith(codeStub, 400);
      });
    });

    it('should return a serialized solution when usecase returns an array of one solution', () => {
      // given
      const responseSolution = new Solution({
        id: '234',
        value: 'This is a solution.'
      });
      usecases.getSolutionForAnswerWhenAssessmentEnded.resolves(responseSolution);
      const request = _buildRequest('213', '234');
      const expectedResponse = {
        data: [{
          type: 'solutions',
          id: '234',
          attributes: {
            value: 'This is a solution.'
          }
        }]
      };

      // when
      const promise = solutionsController.find(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(replyStub, expectedResponse);
        sinon.assert.calledWith(codeStub, 200);
        expect(usecases.getSolutionForAnswerWhenAssessmentEnded).to.have.been.calledWith({
          assessmentRepository,
          answerRepository,
          solutionRepository,
          assessmentId: '213',
          answerId: '234'
        });
      });
    });

    it('should return a 404 error if no answer found', () => {
      // given
      const request = _buildRequest('213', '234');
      const responseError = new NotFoundError('Not found answer for ID 234');
      const expectedError = JSONAPIError({
        code: '404',
        title: 'Not Found Error',
        detail: 'Not found answer for ID 234'
      });

      usecases.getSolutionForAnswerWhenAssessmentEnded.rejects(responseError);

      // when
      const promise = solutionsController.find(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(replyStub, expectedError);
        sinon.assert.calledWith(codeStub, 404);
      });
    });

    it('should return a 409 conflict error if assessment not finished', () => {
      // given
      const request = _buildRequest('213', '234');
      const responseError = new NotCompletedAssessmentError();
      const expectedError = JSONAPIError({
        code: '409',
        title: 'Assessment Not Completed Error',
        detail: 'Cette évaluation n\'est pas terminée.'
      });

      usecases.getSolutionForAnswerWhenAssessmentEnded.rejects(responseError);

      // when
      const promise = solutionsController.find(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(replyStub, expectedError);
        sinon.assert.calledWith(codeStub, 409);
      });
    });
  });
});
