const { sinon, expect } = require('../../../test-helper');

const assessmentController = require('../../../../lib/application/assessments/assessment-controller');

const assessmentService = require('../../../../lib/domain/services/assessment-service');
const assessmentSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer');

const logger = require('../../../../lib/infrastructure/logger');

describe('Unit | Controller | assessment-controller', function() {

  describe('#findByFilters', () => {

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

  describe('#computeCompetenceMarksForAssessmentResult', () => {

    beforeEach(() => {
      sinon.stub(assessmentService, 'computeMarks').resolves();
      sinon.stub(logger, 'error');
    });

    afterEach(() => {
      assessmentService.computeMarks.restore();
      logger.error.restore();
    });

    it('should call the assessment service computing the competence marks for the given assessmentId and assessmentResultId', () => {
      // given
      const assessmentId = 256;
      const assessmentResultId = 367834;
      const request = {
        params: {
          assessmentId,
          assessmentResultId
        }
      };
      const replyStub = sinon.stub();

      // when
      const promise = assessmentController.computeCompetenceMarksForAssessmentResult(request, replyStub);

      // then
      return promise.then(() => {
        expect(assessmentService.computeMarks).to.have.been.calledWith(assessmentId, assessmentResultId);
      });
    });

    it('should reply 200 if OK', () => {
      // given
      const replyStub = sinon.stub();
      const request = {
        params: {
          assessmentId: 10,
          assessmentResultId: 20
        }
      };

      // when
      const promise = assessmentController.computeCompetenceMarksForAssessmentResult(request, replyStub);

      // then
      return promise.then(() => {
        expect(replyStub).to.have.been.called;
      });
    });

    context('when the computeMarks rejects with an error', () => {

      const replyStub = sinon.stub();
      const request = {
        params: {
          assessmentId: 10,
          assessmentResultId: 20
        }
      };

      it('should log the error and answer', () => {
        // given
        const error = new Error('Error from computing marks');
        assessmentService.computeMarks.rejects(error);

        // when
        const promise = assessmentController.computeCompetenceMarksForAssessmentResult(request, replyStub);

        // then
        return promise.then(() => {
          expect(logger.error).to.have.been.calledWith(error);
          expect(replyStub).to.have.been.called;
        });
      });

    });
  });

});
