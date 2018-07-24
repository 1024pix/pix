const { sinon, expect } = require('../../../test-helper');
const JSONAPIError = require('jsonapi-serializer').Error;
const usecases = require('../../../../lib/domain/usecases');
const Correction = require('../../../../lib/domain/models/Correction');
const Hint = require('../../../../lib/domain/models/Hint');
const Tutorial = require('../../../../lib/domain/models/Tutorial');
const { NotFoundError, NotCompletedAssessmentError } = require('../../../../lib/domain/errors');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const correctionRepository = require('../../../../lib/infrastructure/repositories/correction-repository');

const correctionsController = require('../../../../lib/application/corrections/corrections-controller');

describe('Unit | Controller | corrections-controller', () => {

  let replyStub;
  let codeStub;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    codeStub = sinon.stub();
    replyStub = sinon.stub().returns({
      code: codeStub
    });
    sandbox.stub(usecases, 'getCorrectionForAnswerWhenAssessmentEnded');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#findByAnswerId', () => {

    function _buildRequest(answerId) {
      return {
        query: {
          answerId: answerId
        }
      };
    }

    it('should return an 400 error when query param answerId is missing', () => {
      // given
      const request = _buildRequest(undefined);
      const expectedError = JSONAPIError({
        code: '400',
        title: 'Missing Query Parameter',
        detail: 'Missing answerId query parameter.'
      });

      // when
      const promise = correctionsController.findByAnswerId(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(replyStub, expectedError);
        sinon.assert.calledWith(codeStub, 400);
      });
    });

    it('should return a serialized correction when usecase returns an array of one correction', () => {
      // given
      const responseCorrection = new Correction({
        id: '234',
        solution: 'This is a correction.',
        hints: [
          new Hint({ skillName: '@test1', value: 'Indice Facile' })
        ],
        tutorials: [
          new Tutorial({ id: 'recTuto1', format: 'video' })
        ],
        learningMoreTutorials: [
          new Tutorial({ id: 'recTuto2', format: 'audio' })
        ],
      });
      usecases.getCorrectionForAnswerWhenAssessmentEnded.resolves(responseCorrection);
      const request = _buildRequest('234');
      const expectedResponse = {
        data: [{
          type: 'corrections',
          id: '234',
          attributes: {
            solution: 'This is a correction.',
            hint: 'Indice Facile',
          },
          relationships: {
            tutorials: { data: [{ id: 'recTuto1', type: 'tutorials' }] },
            'learning-more-tutorials': { data: [{ id: 'recTuto2', type: 'tutorials' }] },
          },
        }],
        included: [
          {
            attributes: {
              duration: undefined,
              format: 'video',
              id: 'recTuto1',
              link: undefined,
              source: undefined,
              title: undefined
            },
            id: 'recTuto1',
            type: 'tutorials'
          },
          {
            attributes: {
              duration: undefined,
              format: 'audio',
              id: 'recTuto2',
              link: undefined,
              source: undefined,
              title: undefined
            },
            id: 'recTuto2',
            type: 'tutorials'
          },
        ]
      };

      // when
      const promise = correctionsController.findByAnswerId(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(replyStub, expectedResponse);
        sinon.assert.calledWith(codeStub, 200);
        expect(usecases.getCorrectionForAnswerWhenAssessmentEnded).to.have.been.calledWith({
          assessmentRepository,
          answerRepository,
          correctionRepository,
          answerId: '234'
        });
      });
    });

    it('should return a 404 error if no answer found', () => {
      // given
      const request = _buildRequest('234');
      const responseError = new NotFoundError('Not found answer for ID 234');
      const expectedError = JSONAPIError({
        code: '404',
        title: 'Not Found',
        detail: 'Not found answer for ID 234'
      });

      usecases.getCorrectionForAnswerWhenAssessmentEnded.rejects(responseError);

      // when
      const promise = correctionsController.findByAnswerId(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(replyStub, expectedError);
        sinon.assert.calledWith(codeStub, 404);
      });
    });

    it('should return a 409 conflict error if assessment not finished', () => {
      // given
      const request = _buildRequest('234');
      const responseError = new NotCompletedAssessmentError();
      const expectedError = JSONAPIError({
        code: '409',
        title: 'Assessment Not Completed',
        detail: 'Cette évaluation n\'est pas terminée.'
      });

      usecases.getCorrectionForAnswerWhenAssessmentEnded.rejects(responseError);

      // when
      const promise = correctionsController.findByAnswerId(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(replyStub, expectedError);
        sinon.assert.calledWith(codeStub, 409);
      });
    });
  });
});
