const { expect, sinon, hFake } = require('../../../test-helper');

const assessmentController = require('../../../../lib/application/assessments/assessment-controller');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const assessmentService = require('../../../../lib/domain/services/assessment-service');
const assessmentSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer');

const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Controller | assessment-controller', () => {

  describe('#get', () => {

    let sandbox;

    const ASSESSMENT_ID = 12;

    let request;

    beforeEach(() => {
      request = { params: { id: ASSESSMENT_ID } };

      sandbox = sinon.sandbox.create();

      sandbox.stub(assessmentService, 'fetchAssessment').resolves();
      sandbox.stub(assessmentSerializer, 'serialize');
      sandbox.stub(assessmentRepository, 'get');
    });

    afterEach(() => {

      sandbox.restore();

    });

    it('checks sanity', () => {
      expect(assessmentController.get).to.exist;
    });

    it('should return a NotFound error when the assessment does not exist', () => {
      // given
      assessmentService.fetchAssessment.rejects(new NotFoundError);

      // when
      const promise = assessmentController.get(request, hFake);

      // then
      return promise.catch((error) => {
        expect(error.output.statusCode).to.equal(404);
      });
    });

    it('should return a Bad Implementation error when we cannot retrieve the score', () => {
      // given
      assessmentService.fetchAssessment.rejects(new Error('Expected Error'));

      // when
      const promise = assessmentController.get(request, hFake);

      // then
      return promise.catch((error) => {
        expect(error.output.statusCode).to.equal(500);
      });
    });

    it('should reply with the scored assessment', async () => {
      // given
      const serializedAssessment = { data: { type: 'Assessment' } };
      const scoredAssessment = { id: 'assessment_id' };
      const expectedSerializerArgs = {
        assessmentPix: scoredAssessment,
        skills: {}
      };

      assessmentSerializer.serialize.returns(serializedAssessment);
      assessmentService.fetchAssessment.withArgs(ASSESSMENT_ID).resolves(expectedSerializerArgs);

      // when
      const response = await assessmentController.get(request, hFake);

      // then
      sinon.assert.calledWithExactly(assessmentSerializer.serialize, scoredAssessment);
      expect(response).to.deep.equal(serializedAssessment);
    });

  });

});
