const { sinon, expect, generateValidRequestAuthorizationHeader, hFake } = require('../../../test-helper');
const assessmentController = require('../../../../lib/application/assessments/assessment-controller');
const usecases = require('../../../../lib/domain/usecases');
const events = require('../../../../lib/domain/events');
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
    const assessmentCompletedEvent = Symbol('un événement de fin de test');
    const certificationScoringEvent = Symbol('un événement de fin de scoring');
    const domainTransaction = Symbol('domain transaction');
    let transactionToBeExecuted;

    beforeEach(() => {
      sinon.stub(usecases, 'completeAssessment');
      usecases.completeAssessment.resolves(assessmentCompletedEvent);

      sinon.stub(events, 'handleBadgeAcquisition');
      sinon.stub(events, 'handleCertificationScoring');
      sinon.stub(events, 'handleCertificationAcquisitionForPartner');
      sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => {
        transactionToBeExecuted = lambda;
      });
    });

    it('should call the completeAssessment use case', async () => {
      // given
      events.handleBadgeAcquisition.resolves({});

      // when
      await assessmentController.completeAssessment({ params: { id: assessmentId } });
      await transactionToBeExecuted(domainTransaction);

      // then
      expect(usecases.completeAssessment).to.have.been.calledWithExactly({ domainTransaction, assessmentId });
    });

    it('should pass the assessment completed event to the BadgeAcquisitionHandler', async () => {
      /// given
      events.handleBadgeAcquisition.resolves({});

      // when
      await assessmentController.completeAssessment({ params: { id: assessmentId } });
      await transactionToBeExecuted(domainTransaction);

      // then
      expect(events.handleBadgeAcquisition).to.have.been.calledWithExactly({ domainTransaction, assessmentCompletedEvent });
    });

    it('should pass the assessment completed event to the CertificationScoringHandler', async () => {
      /// given
      events.handleBadgeAcquisition.resolves({});
      events.handleCertificationScoring.resolves({});

      // when
      await assessmentController.completeAssessment({ params: { id: assessmentId } });
      await transactionToBeExecuted(domainTransaction);

      // then
      expect(events.handleCertificationScoring).to.have.been.calledWithExactly({ domainTransaction, assessmentCompletedEvent,  });
    });

    it('should pass the assessment completed event to the CertificationPartnerHandler', async () => {
      /// given
      events.handleBadgeAcquisition.resolves({});
      events.handleCertificationScoring.resolves(certificationScoringEvent);

      // when
      await assessmentController.completeAssessment({ params: { id: assessmentId } });
      await transactionToBeExecuted(domainTransaction);

      // then
      expect(events.handleCertificationAcquisitionForPartner).to.have.been.calledWithExactly({ domainTransaction, certificationScoringEvent });
    });

    it('should call usecase and handler within the transaction', async () => {
      // when
      await assessmentController.completeAssessment({ params: { id: assessmentId } });
      // and transactionToBeExecuted is not executed

      // then
      expect(usecases.completeAssessment).to.not.have.been.called;
      expect(events.handleBadgeAcquisition).to.not.have.been.called;
      expect(events.handleCertificationScoring).to.not.have.been.called;
      expect(events.handleCertificationAcquisitionForPartner).to.not.have.been.called;
    });
  });
});

