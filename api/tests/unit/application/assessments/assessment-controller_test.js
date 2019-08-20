const { sinon, expect, generateValidRequestAuthorizationHeader, hFake } = require('../../../test-helper');
const assessmentController = require('../../../../lib/application/assessments/assessment-controller');
const useCases = require('../../../../lib/domain/usecases');

const assessmentSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer');

describe('Unit | Controller | assessment-controller', function() {

  describe('#findByFilters', () => {

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

      sinon.stub(useCases, 'findCertificationAssessments');
      sinon.stub(useCases, 'findSmartPlacementAssessments');
      sinon.stub(assessmentSerializer, 'serialize');
    });

    it('should serialize assessment to JSON API', async function() {
      // given
      const request = {
        query: { 'filter[type]': 'CERTIFICATION' },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) }
      };
      useCases.findCertificationAssessments.resolves(assessments);
      assessmentSerializer.serialize.returns(assessmentsInJSONAPI);

      // when
      const response = await assessmentController.findByFilters(request, hFake);

      // then
      expect(assessmentSerializer.serialize).to.have.been.calledWithExactly(assessments);
      expect(response).to.deep.equal(assessmentsInJSONAPI);
    });

    context('GET assessments with campaignCode filter', () => {

      const request = {
        query: { 'filter[codeCampaign]': 'Code' },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) }
      };

      it('should call assessment service with query filters', async function() {
        // given
        useCases.findSmartPlacementAssessments.resolves();

        // when
        await assessmentController.findByFilters(request, hFake);

        // then
        expect(useCases.findSmartPlacementAssessments).to.have.been.calledWithExactly({
          userId,
          filters: { codeCampaign: 'Code' },
        });
      });
    });

    context('GET assessments with type CERTIFICATION filter', () => {

      const request = {
        query: { 'filter[type]': 'CERTIFICATION' },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) }
      };

      it('should call assessment service with query filters', async () => {
        // given
        useCases.findCertificationAssessments.resolves();

        // when
        await assessmentController.findByFilters(request, hFake);

        // then
        expect(useCases.findCertificationAssessments).to.have.been.calledWithExactly({
          userId,
          filters: { type: 'CERTIFICATION' },
        });
      });
    });

    //BUG
    context('GET assessments with no valid filter', () => {

      const request = {
        query: { 'filter[type]': 'DEMO' },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) }
      };

      it('should resolve []', async () => {
        // given
        assessmentSerializer.serialize.withArgs([]).returns({ data: [] });

        // when
        const response = await assessmentController.findByFilters(request, hFake);

        // then
        expect(response).to.deep.equal({ data: [] });
      });
    });

    context('GET assessment with invalid token', () => {

      const request = {
        query: { 'filter[type]': 'DEMO' },
        headers: { authorization: 'Bearer invalidtoken' }
      };

      it('should resolve []', async function() {
        // when
        await assessmentController.findByFilters(request, hFake);

        // then
        expect(assessmentSerializer.serialize).to.have.been.calledWithExactly([]);
      });
    });
  });
});
