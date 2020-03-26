const { sinon, expect, generateValidRequestAuthorizationHeader, hFake, catchErr } = require('../../../test-helper');
const assessmentController = require('../../../../lib/application/assessments/assessment-controller');
const usecases = require('../../../../lib/domain/usecases');
const { cleaBadgeCreationHandler } = require('../../../../lib/domain/events/clea-badge-creation-handler');
const assessmentSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

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

      sinon.stub(usecases, 'findSmartPlacementAssessments');
      sinon.stub(assessmentSerializer, 'serialize');
    });

    it('should serialize assessment to JSON API', async function() {
      // given
      const request = {
        query: { 'filter[codeCampaign]': 'Code' },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) }
      };
      usecases.findSmartPlacementAssessments.resolves(assessments);
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
        usecases.findSmartPlacementAssessments.resolves();

        // when
        await assessmentController.findByFilters(request, hFake);

        // then
        expect(usecases.findSmartPlacementAssessments).to.have.been.calledWithExactly({
          userId,
          filters: { codeCampaign: 'Code' },
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

  describe('#completeAssessment', () => {
    const assessmentId = 2;
    const event = Symbol('un événement de fin de test');
    let domainTransaction;

    beforeEach(() => {
      sinon.stub(usecases, 'completeAssessment');
      usecases.completeAssessment.resolves(event);

      sinon.stub(cleaBadgeCreationHandler, 'handle');
      domainTransaction = domainTransactionStub();
      sinon.stub(DomainTransaction, 'begin').returns(domainTransaction);
    });

    it('should call the completeAssessment use case', async () => {
      // given
      cleaBadgeCreationHandler.handle.resolves({});

      // when
      await assessmentController.completeAssessment({ params: { id: assessmentId } });

      // then
      expect(usecases.completeAssessment).to.have.been.calledWithExactly({ domainTransaction, assessmentId });
    });

    it('should pass the assessment completed event to the CleaBadgeCreationHandler', async () => {
      /// given
      cleaBadgeCreationHandler.handle.resolves({});

      // when
      await assessmentController.completeAssessment({ params: { id: assessmentId } });

      // then
      expect(cleaBadgeCreationHandler.handle).to.have.been.calledWithExactly(domainTransaction, event);
    });

    it('should begin a domain transaction on assessment completion', async () => {
      // given
      cleaBadgeCreationHandler.handle.resolves({});

      // when
      await assessmentController.completeAssessment({ params: { id: assessmentId } });

      // then
      expect(DomainTransaction.begin).to.have.been.called;
    });

    it('should end the domain transaction after assessment completion', async () => {
      // given
      cleaBadgeCreationHandler.handle.resolves({});

      // when
      await assessmentController.completeAssessment({ params: { id: assessmentId } });

      // then
      expect(domainTransaction.commit).to.have.been.called;
    });

    it('should rollback the domain transaction when an error occurs', async () => {
      // given
      const anError = new Error('An error during badge acquisition occurs');
      cleaBadgeCreationHandler.handle.throws(anError);

      // when
      await catchErr(assessmentController.completeAssessment)({ params: { id: assessmentId } });

      // then
      expect(domainTransaction.rollback).to.have.been.called;
    });
  });
});

function domainTransactionStub() {
  const domainTransaction = {
    commit: sinon.stub(),
    rollback: sinon.stub(),
  };

  return domainTransaction;
}

