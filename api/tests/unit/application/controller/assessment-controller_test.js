const { describe, it, beforeEach, afterEach, expect, sinon } = require('../../../test-helper');

const Boom = require('boom');

const assessmentController = require('../../../../lib/application/assessments/assessment-controller');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const assessmentService = require('../../../../lib/domain/services/assessment-service');
const assessmentSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer');

const { NotFoundError, NotElligibleToScoringError } = require('../../../../lib/domain/errors');
const Assessment = require('../../../../lib/domain/models/data/assessment');

describe('Unit | Controller | assessment-controller', () => {

  describe('#get', () => {

    const ASSESSMENT_ID = 12;
    const reply = sinon.spy();
    let getScoredAssessmentStub;
    let assessmentSerializerStub;
    let getAssessmentStub;
    let request;

    beforeEach(() => {
      request = { params: { id: ASSESSMENT_ID } };
      getScoredAssessmentStub = sinon.stub(assessmentService, 'getScoredAssessment').resolves();
      assessmentSerializerStub = sinon.stub(assessmentSerializer, 'serialize');
      getAssessmentStub = sinon.stub(assessmentRepository, 'get');
    });

    afterEach(() => {
      getScoredAssessmentStub.restore();
      assessmentSerializerStub.restore();
      getAssessmentStub.restore();
    });

    it('checks sanity', () => {
      expect(assessmentController.get).to.exist;
    });

    it('should call AssessementService#getScoredAssessment with request param', () => {
      // given
      request = { params: { id: 1234567 } };

      // when
      assessmentController.get(request, reply);

      // then
      sinon.assert.calledWithExactly(getScoredAssessmentStub, 1234567);
    });

    it('should return a NotFound error when the assessment does not exist', () => {
      // given
      const expectedError = { error: 'Expected API Return 404' };

      const boomNotFound = sinon.stub(Boom, 'notFound').returns(expectedError);
      const getScoredError = new NotFoundError('Expected API Return 404');
      getScoredAssessmentStub.rejects(getScoredError);

      // when
      const promise = assessmentController.get(request, reply);

      // then
      return promise.then(() => {
        boomNotFound.restore();
        sinon.assert.calledWithExactly(boomNotFound, getScoredError);

      });
    });

    it('should return the Assessment without scoring with getScoredAssessment rejecting NotElligibleToScoringError', () => {
      // Given
      const assessment = new Assessment({});
      getAssessmentStub.returns(Promise.resolve(assessment));
      getScoredAssessmentStub.rejects(new NotElligibleToScoringError('Expected Error Message'));

      const expectedSerializedAssessment = { message: 'mySerializedAssessment' };
      assessmentSerializerStub.returns(expectedSerializedAssessment);

      // When
      const promise = assessmentController.get(request, reply);

      // Then
      return promise.then(() => {
        sinon.assert.calledWith(getAssessmentStub, ASSESSMENT_ID);
        sinon.assert.calledWith(assessmentSerializerStub, assessment);
        sinon.assert.calledWith(reply, expectedSerializedAssessment);
      });

    });

    it('should return a Bad Implementation error when we cannot retrieve the score', () => {
      // given
      const expectedError = { error: 'Expected API Return ' };

      const boomBadImplementationStub = sinon.stub(Boom, 'badImplementation').returns(expectedError);
      getScoredAssessmentStub.rejects(new Error('Expected Error Message'));

      // when
      const promise = assessmentController.get(request, reply);

      // then
      return promise.then(() => {
        boomBadImplementationStub.restore();
        sinon.assert.calledWithExactly(reply, expectedError);
      });
    });

    it('should reply with the scored assessment', () => {
      // given
      const serializedAssessment = { data: { type: 'assessement' } };
      const scoredAssessement = { id: 'assessment_id' };

      assessmentSerializerStub.returns(serializedAssessment);
      getScoredAssessmentStub.resolves(scoredAssessement);

      // when
      const promise = assessmentController.get(request, reply);

      // then
      return promise.then(() => {
        sinon.assert.calledWithExactly(assessmentSerializerStub, scoredAssessement);
        sinon.assert.calledWithExactly(reply, serializedAssessment);
      });
    });

  });

});
