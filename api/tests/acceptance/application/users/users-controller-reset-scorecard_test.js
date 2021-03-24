const { knex, databaseBuilder, expect, generateValidRequestAuthorizationHeader, sinon, mockLearningContent } = require('../../../test-helper');
const _ = require('lodash');

const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-reset-scorecard', function() {

  let options;
  let server;

  let userId;
  const competenceId = 'recAbe382T0e1337';

  function inspectCompetenceEvaluationInDb({ userId, competenceId }) {
    return knex.select('*')
      .from('competence-evaluations')
      .where({ userId, competenceId });
  }

  function inspectCampaignAssessmentsInDb({ userId, state }) {
    return knex.select('*')
      .from('assessments')
      .where({ userId, state });
  }

  function inspectKnowledgeElementsInDb({ userId, competenceId }) {
    return knex.select('*')
      .from('knowledge-elements')
      .where({ userId, competenceId })
      .orderBy('createdAt', 'DESC');
  }

  beforeEach(async function() {
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();

    options = {
      method: 'POST',
      url: `/api/users/${userId}/competences/${competenceId}/reset`,
      payload: {},
      headers: {},
    };
    server = await createServer();
  });

  afterEach(async function() {
    await knex('competence-evaluations').delete();
    await knex('knowledge-elements').delete();
    await knex('answers').delete();
    return knex('assessments').delete();
  });

  describe('POST /users/{id}/competences/{id}/reset', function() {

    describe('Resource access management', function() {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function() {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if requested user is not the same as authenticated user', async function() {
        // given
        const otherUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Precondition verification', function() {

      const competenceEvaluationId = 111;

      beforeEach(async function() {
        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);

        databaseBuilder.factory.buildCompetenceEvaluation({
          id: competenceEvaluationId,
          userId,
          competenceId,
        });

        databaseBuilder.factory.buildKnowledgeElement({
          id: 1,
          userId,
          competenceId,
        });

        await databaseBuilder.commit();
      });

      it('should respond with a 412 - precondition failed - if last knowledge element date is not old enough', async function() {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(412);
      });
    });

    describe('Success case', function() {

      let response;
      const competence = {
        id: competenceId,
        nameFrFr: 'Mener une recherche et une veille d’information',
        descriptionFrFr: 'descriptionCompetence1',
        index: '1.1',
        origin: 'Pix',
        areaId: 'recvoGdo7z2z7pXWa',
      };
      const area = {
        id: 'recvoGdo7z2z7pXWa',
        titleFrFr: 'Information et données',
        color: 'jaffa',
        code: '1',
        competenceIds: [competenceId],
      };
      const otherStartedCompetenceId = 'recBejNZgJke422G';
      const createdAt = new Date('2019-01-01');
      const learningContent = {
        areas: [area],
        competences: [competence],
      };

      beforeEach(async function() {
        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);

        sinon.useFakeTimers({
          now: new Date('2019-01-10'),
          toFake: ['Date'],
        });

        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id, skillId: 'url1' });
        const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });

        mockLearningContent(learningContent);

        _.each([
          {
            assessment: { userId },
            competenceEvaluation: { competenceId, userId, status: 'started' },
            knowledgeElements: [
              { skillId: 'web1', status: 'validated', source: 'direct', competenceId, earnedPix: 1, createdAt },
              { skillId: 'web2', status: 'invalidated', source: 'direct', competenceId, earnedPix: 2, createdAt },
              { skillId: 'web4', status: 'invalidated', source: 'inferred', competenceId, earnedPix: 4, createdAt },
              { skillId: 'url2', status: 'validated', source: 'direct', competenceId, earnedPix: 4, createdAt },
            ],
          },
          {
            assessment: { userId },
            competenceEvaluation: { competenceId: otherStartedCompetenceId, userId, status: 'started' },
            knowledgeElements: [
              { skillId: 'rechInfo3', status: 'validated', source: 'direct', competenceId: otherStartedCompetenceId, earnedPix: 3, createdAt },
            ],
          },
          {
            assessment: { userId, type: 'CAMPAIGN' },
            campaignParticipation: { campaignId: campaign.id, isShared: false },
            knowledgeElements: [
              { skillId: 'url1', status: 'validated', source: 'direct', competenceId, earnedPix: 2, createdAt },
            ],
          },
        ], ({ assessment, competenceEvaluation, knowledgeElements, campaignParticipation }) => {
          const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ ...campaignParticipation }).id;
          const assessmentId = databaseBuilder.factory.buildAssessment({ ...assessment, campaignParticipationId }).id;
          databaseBuilder.factory.buildCompetenceEvaluation({ ...competenceEvaluation, assessmentId });
          _.each(knowledgeElements, (ke) => databaseBuilder.factory.buildKnowledgeElement({ ...ke, userId, assessmentId }));
        });

        await databaseBuilder.commit();
      });

      afterEach(async function() {
        await knex('knowledge-elements').delete();
        await knex('answers').delete();
        await knex('competence-evaluations').delete();
        await knex('assessments').delete();
        await knex('campaign-participations').delete();
      });

      it('should return 200 and the updated scorecard', async function() {
        // given
        const expectedScorecardJSONApi = {
          data: {
            type: 'scorecards',
            id: `${userId}_${competenceId}`,
            attributes: {
              name: competence.nameFrFr,
              description: competence.descriptionFrFr,
              'competence-id': competenceId,
              index: competence.index,
              'earned-pix': 0,
              level: 0,
              'pix-score-ahead-of-next-level': 0,
              status: 'NOT_STARTED',
              'remaining-days-before-reset': null,
              'remaining-days-before-improving': null,
            },
            relationships: {
              area: {
                data: {
                  id: area.id,
                  type: 'areas',
                },
              },
              tutorials: {
                links: {
                  related: `/api/scorecards/${userId}_${competenceId}/tutorials`,
                },
              },
            },
          },
          included: [
            {
              attributes: {
                code: area.code,
                title: area.titleFrFr,
                color: area.color,
              },
              id: area.id,
              type: 'areas',
            },
          ],
        };

        // when
        response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedScorecardJSONApi);
      });

      it('should have reset the competence evaluation', async function() {
        // when
        response = await server.inject(options);

        // then
        const competenceEvaluation = await inspectCompetenceEvaluationInDb({ userId, competenceId });
        const otherCompetenceEvaluation = await inspectCompetenceEvaluationInDb({ userId, competenceId: otherStartedCompetenceId });
        expect(competenceEvaluation[0].status).to.equal('reset');
        expect(otherCompetenceEvaluation[0].status).to.equal('started');
      });

      it('should have reset the assessment of campaign participation', async function() {
        // given
        const state = 'aborted';

        // when
        response = await server.inject(options);

        // then
        const campaignAssessments = await inspectCampaignAssessmentsInDb({ userId, state });
        expect(campaignAssessments).to.have.lengthOf(1);
      });

      it('should have reset the knowledge elements created from both competence evaluations and campaign', async function() {
        // when
        response = await server.inject(options);

        // then
        const knowledgeElement = await inspectKnowledgeElementsInDb({ userId, competenceId });
        const knowledgeElementsOtherCompetence = await inspectKnowledgeElementsInDb({ userId, competenceId: otherStartedCompetenceId });

        expect(knowledgeElement).to.have.length(10);
        expect(knowledgeElement[0].earnedPix).to.equal(0);
        expect(knowledgeElement[0].status).to.equal('reset');
        expect(knowledgeElementsOtherCompetence[0].earnedPix).to.equal(3);
        expect(knowledgeElementsOtherCompetence[0].status).to.equal('validated');
      });
    });
  });
});
