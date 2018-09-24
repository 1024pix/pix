const { sinon, expect } = require('../../../test-helper');

const assessmentController = require('../../../../lib/application/assessments/assessment-controller');
const useCases = require('../../../../lib/domain/usecases');

const assessmentSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer');

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
      sandbox.stub(useCases, 'findUserAssessmentsByFilters').resolves();
      sandbox.stub(assessmentSerializer, 'serializeArray').resolves();
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('GET assessments with filters', function() {

      const userId = 24504875;
      const request = {
        query: { 'filter[courseId]': 'courseId' },
        auth: {
          credentials: {
            userId
          }
        }
      };

      it('should call assessment service with query filters', function() {
        // when
        const promise = assessmentController.findByFilters(request, replyStub);

        // then
        return promise.then(() => {
          expect(useCases.findUserAssessmentsByFilters).to.have.been.called;
          expect(useCases.findUserAssessmentsByFilters).to.have.been.calledWith({
            userId,
            filters: { courseId: 'courseId' },
          });
        });
      });

      it('should serialize assessment to JSON API', function() {
        // given
        useCases.findUserAssessmentsByFilters.resolves(assessments);

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

});
