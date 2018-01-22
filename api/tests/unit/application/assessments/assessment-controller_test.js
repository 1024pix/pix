const { describe, it, sinon, expect, beforeEach, afterEach } = require('../../../test-helper');

const assessmentController = require('../../../../lib/application/assessments/assessment-controller');

const assessmentService = require('../../../../lib/domain/services/assessment-service');
const assessmentSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer');

describe('Unit | Controller | findByFilters', function() {

  let sandbox;

  let codeStub;
  let replyStub;

  const assessments = [{ id: 1 }, { id: 2 }];
  const assessmentsInJSONAPI = [
    {
      id: 1,
      type: 'assessments',
      attributes: { pixScore: 12 }
    }, {
      id: 1,
      type: 'assessments',
      attributes: { pixScore: 12 }
    }];

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    codeStub = sinon.stub();
    replyStub = sinon.stub().returns({ code: codeStub });
    sandbox.stub(assessmentService, 'findByFilters').resolves();
    sandbox.stub(assessmentSerializer, 'serializeArray').resolves();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('GET assessments with filters', function() {

    const request = { query: { 'filter[courseId]': 'courseId' } };

    it('should call assessment service with query filters', function() {
      // when
      const promise = assessmentController.findByFilters(request, replyStub);

      // then
      return promise.then(() => {
        expect(assessmentService.findByFilters).to.have.been.called;
        expect(assessmentService.findByFilters).to.have.been.calledWith({ courseId: 'courseId' });
      });
    });

    it('should serialize assessment to JSON API', function() {
      // given
      assessmentService.findByFilters.resolves(assessments);

      // when
      const promise = assessmentController.findByFilters(request, replyStub);

      // then
      return promise.then(() => {
        expect(assessmentSerializer.serializeArray).to.have.been.called;
        expect(assessmentSerializer.serializeArray).to.have.been.calledWith(assessments);
      });
    });

    it('should reply the serialized assessments', function() {
      // given
      assessmentSerializer.serializeArray.returns(assessmentsInJSONAPI);

      // when
      const promise = assessmentController.findByFilters(request, replyStub);

      // then
      return promise.then(() => {
        expect(replyStub).to.have.been.called;
        expect(replyStub).to.have.been.calledWith(assessmentsInJSONAPI);
      });
    });

  });

});
