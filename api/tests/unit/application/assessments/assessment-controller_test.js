const { sinon, expect, generateValidRequestAuthorizationHeader, hFake, domainBuilder } = require('../../../test-helper');
const assessmentController = require('../../../../lib/application/assessments/assessment-controller');
const usecases = require('../../../../lib/domain/usecases');
const events = require('../../../../lib/domain/events');
const assessmentSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/assessment-serializer');
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');

describe('Unit | Controller | assessment-controller', function() {

  describe('#get', () => {
    const authenticatedUserId = '12';
    const locale = 'fr';
    const assessmentId = 104974;

    const assessment = { id: assessmentId, title: 'Ordinary Wizarding Level assessment' };

    beforeEach(() => {
      sinon.stub(usecases, 'getAssessment').withArgs({ assessmentId, locale }).resolves(assessment);
      sinon.stub(assessmentSerializer, 'serialize').resolvesArg(0);
    });

    it('should call the expected usecase', async () => {
      // given
      const request = {
        auth: {
          credentials: {
            userId: authenticatedUserId,
          },
        },
        params: {
          id: assessmentId,
        },
        headers: { 'accept-language': locale },
      };

      // when
      const result = await assessmentController.get(request, hFake);

      // then
      expect(result).to.be.equal(assessment);
    });
  });

  describe('#findByFilters', () => {
    const assessments = [{ id: 1 }, { id: 2 }];
    const assessmentsInJSONAPI = [{
      id: 1,
      type: 'assessments',
      attributes: { pixScore: 12 },
    }, {
      id: 1,
      type: 'assessments',
      attributes: { pixScore: 12 },
    }];

    const userId = 24504875;

    beforeEach(() => {
      sinon.stub(usecases, 'findCampaignAssessments');
      sinon.stub(assessmentSerializer, 'serialize');
    });

    it('should serialize assessment to JSON API', async function() {
      // given
      const request = {
        query: { 'filter[codeCampaign]': 'Code' },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
      usecases.findCampaignAssessments.resolves(assessments);
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
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      it('should call assessment service with query filters', async function() {
        // given
        usecases.findCampaignAssessments.resolves();

        // when
        await assessmentController.findByFilters(request, hFake);

        // then
        expect(usecases.findCampaignAssessments).to.have.been.calledWithExactly({
          userId,
          filters: { codeCampaign: 'Code' },
        });
      });
    });

    //BUG
    context('GET assessments with no valid filter', () => {

      const request = {
        query: { 'filter[type]': 'DEMO' },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
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
        headers: { authorization: 'Bearer invalidtoken' },
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
    const assessmentCompletedEvent = new AssessmentCompleted();

    beforeEach(() => {
      sinon.stub(usecases, 'completeAssessment');
      usecases.completeAssessment.resolves(assessmentCompletedEvent);
      sinon.stub(events.eventDispatcher, 'dispatch');
    });

    it('should call the completeAssessment use case', async () => {
      // when
      await assessmentController.completeAssessment({ params: { id: assessmentId } });

      // then
      expect(usecases.completeAssessment).to.have.been.calledWithExactly({ assessmentId });
    });

    it('should dispatch the assessment completed event', async () => {
      // when
      await assessmentController.completeAssessment({ params: { id: assessmentId } });

      // then
      expect(events.eventDispatcher.dispatch).to.have.been.calledWith(assessmentCompletedEvent);
    });
  });

  describe('#findCompetenceEvaluations', () => {

    it('should return the competence evaluations', async () => {
      // given
      const userId = 123;
      const assessmentId = 456;
      const competenceEvaluation1 = domainBuilder.buildCompetenceEvaluation({ assessmentId, userId });
      const competenceEvaluation2 = domainBuilder.buildCompetenceEvaluation({ assessmentId, userId });
      sinon.stub(usecases, 'findCompetenceEvaluationsByAssessment')
        .withArgs({ assessmentId, userId })
        .resolves([competenceEvaluation1, competenceEvaluation2]);
      const request = {
        auth: { credentials: { userId } },
        params: {
          id: assessmentId,
        },
      };

      // when
      const result = await assessmentController.findCompetenceEvaluations(request, hFake);

      // then
      expect(result.data).to.be.deep.equal([
        {
          type: 'competence-evaluations',
          id: competenceEvaluation1.id.toString(),
          attributes: {
            'competence-id': competenceEvaluation1.competenceId,
            'user-id': competenceEvaluation1.userId,
            'created-at': competenceEvaluation1.createdAt,
            'updated-at': competenceEvaluation1.updatedAt,
            status: competenceEvaluation1.status,
          },
          relationships: {
            assessment: {
              data: {
                id: assessmentId.toString(),
                type: 'assessments',
              },
            },
            scorecard: {
              links: {
                related: `/api/scorecards/${userId}_${competenceEvaluation1.competenceId}`,
              },
            },
          },
        },
        {
          type: 'competence-evaluations',
          id: competenceEvaluation2.id.toString(),
          attributes: {
            'competence-id': competenceEvaluation2.competenceId,
            'user-id': competenceEvaluation2.userId,
            'created-at': competenceEvaluation2.createdAt,
            'updated-at': competenceEvaluation2.updatedAt,
            status: competenceEvaluation2.status,
          },
          relationships: {
            assessment: {
              data: {
                id: assessmentId.toString(),
                type: 'assessments',
              },
            },
            scorecard: {
              links: {
                related: `/api/scorecards/${userId}_${competenceEvaluation2.competenceId}`,
              },
            },
          },
        },
      ]);
    });
  });
});

