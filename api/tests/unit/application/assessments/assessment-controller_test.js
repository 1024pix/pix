const { sinon, expect, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const assessmentController = require('../../../../lib/application/assessments/assessment-controller');
const useCases = require('../../../../lib/domain/usecases');

const assessmentSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer');

describe('Unit | Controller | assessment-controller', function() {

  describe('#findByFilters', () => {

    let sandbox;

    let codeStub;
    let replyStub;

    const assessments = [{ id: 1 }, { id: 2 }];
    const assessmentsInJSONAPI = [{
      id: 1,
      type: 'assessments',
      attributes: { pixScore: 12 }
    }, {
      id: 1,
      type: 'assessments',
      attributes: { pixScore: 12 }
    }];

    const userId = 24504875;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();

      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({ code: codeStub });
      sandbox.stub(useCases, 'findCertificationAssessments');
      sandbox.stub(useCases, 'findPlacementAssessments');
      sandbox.stub(useCases, 'findSmartPlacementAssessments');
      sandbox.stub(assessmentSerializer, 'serializeArray').resolves();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should serialize assessment to JSON API', function() {
      // given
      const request = {
        query: { 'filter[type]': 'PLACEMENT' },
        headers: { authorization: generateValidRequestAuhorizationHeader(userId) }
      };
      useCases.findPlacementAssessments.resolves(assessments);

      // when
      const promise = assessmentController.findByFilters(request, replyStub);

      // then
      return promise.then(() => {
        expect(assessmentSerializer.serializeArray).to.have.been.calledWithExactly(assessments);
      });
    });

    it('should reply the serialized assessments', function() {
      // given
      const request = {
        query: { 'filter[type]': 'PLACEMENT' },
        headers: { authorization: generateValidRequestAuhorizationHeader(userId) }
      };
      useCases.findPlacementAssessments.resolves(assessments);
      assessmentSerializer.serializeArray.returns(assessmentsInJSONAPI);

      // when
      const promise = assessmentController.findByFilters(request, replyStub);

      // then
      return promise.then(() => {
        expect(replyStub).to.have.been.calledWithExactly(assessmentsInJSONAPI);
      });
    });

    context('GET assessments with campaignCode filter', () => {

      const request = {
        query: { 'filter[codeCampaign]': 'Code' },
        headers: { authorization: generateValidRequestAuhorizationHeader(userId) }
      };

      it('should call assessment service with query filters', function() {
        // given
        useCases.findSmartPlacementAssessments.resolves();

        // when
        const promise = assessmentController.findByFilters(request, replyStub);

        // then
        return promise.then(() => {
          expect(useCases.findSmartPlacementAssessments).to.have.been.calledWithExactly({
            userId,
            filters: { codeCampaign: 'Code' },
          });
        });
      });
    });

    context('GET assessments with type PLACEMENT filter', () => {

      const request = {
        query: { 'filter[type]': 'PLACEMENT', 'filter[courseId]': 'courseId1' },
        headers: { authorization: generateValidRequestAuhorizationHeader(userId) }
      };

      it('should call assessment service with query filters', function() {
        // given
        useCases.findPlacementAssessments.resolves();

        // when
        const promise = assessmentController.findByFilters(request, replyStub);

        // then
        return promise.then(() => {
          expect(useCases.findPlacementAssessments).to.have.been.calledWithExactly({
            userId,
            filters: { type: 'PLACEMENT', courseId: 'courseId1' },
          });
        });
      });
    });

    context('GET assessments with type CERTIFICATION filter', () => {

      const request = {
        query: { 'filter[type]': 'CERTIFICATION' },
        headers: { authorization: generateValidRequestAuhorizationHeader(userId) }
      };

      it('should call assessment service with query filters', function() {
        // given
        useCases.findCertificationAssessments.resolves();

        // when
        const promise = assessmentController.findByFilters(request, replyStub);

        // then
        return promise.then(() => {
          expect(useCases.findCertificationAssessments).to.have.been.calledWithExactly({
            userId,
            filters: { type: 'CERTIFICATION' },
          });
        });
      });
    });

    context('GET assessments with no valid filter', () => {

      const request = {
        query: { 'filter[type]': 'DEMO' },
        headers: { authorization: generateValidRequestAuhorizationHeader(userId) }
      };

      it('should resolve []', function() {
        // when
        const promise = assessmentController.findByFilters(request, replyStub);

        // then
        return promise.then(() => {
          expect(assessmentSerializer.serializeArray).to.have.been.calledWithExactly([]);
        });
      });
    });

    context('GET assessment with invalid token', () => {

      const request = {
        query: { 'filter[type]': 'DEMO' },
        headers: { authorization: 'Bearer invalidtoken' }
      };

      it('should resolve []', function() {
        // when
        const promise = assessmentController.findByFilters(request, replyStub);

        // then
        return promise.then(() => {
          expect(assessmentSerializer.serializeArray).to.have.been.calledWithExactly([]);
        });
      });
    });
  });
});
