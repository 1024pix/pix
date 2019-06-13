const { knex, airtableBuilder, databaseBuilder, expect, generateValidRequestAuhorizationHeader, sinon } = require('../../../test-helper');
const _ = require('lodash');

const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-reset-scorecard', () => {

  let options;
  let server;

  const userId = 1234;
  const competenceId = 'recAbe382T0e1337';

  function inspectCompetenceEvaluationInDb({ userId, competenceId }) {
    return knex.select('*')
      .from('competence-evaluations')
      .where({ userId, competenceId });
  }

  function inspectKnowledgeElementsInDb({ userId, competenceId }) {
    return knex.select('*')
      .from('knowledge-elements')
      .where({ userId, competenceId });
  }

  beforeEach(async () => {

    options = {
      method: 'PATCH',
      url: `/api/users/${userId}/competences/${competenceId}/reset`,
      payload: {},
      headers: {},
    };
    server = await createServer();
  });

  describe('PATCH /users/{id}/competences/{id}/reset', () => {

    describe('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });

    describe('Precondition verification', () => {

      const competenceEvaluationId = 111;

      beforeEach(async () => {
        options.headers.authorization = generateValidRequestAuhorizationHeader(userId);

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

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should respond with a 421 - precondition failed - if last knowledge element date is not old enough', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(421);
        });
      });
    });

    describe('Success case', () => {

      let response;
      const otherStartedCompetenceId = 'recBejNZgJke422G';
      const createdAt = new Date('2019-01-01');

      beforeEach(async () => {
        options.headers.authorization = generateValidRequestAuhorizationHeader(userId);
        databaseBuilder.factory.buildUser({ id: userId });

        sinon.useFakeTimers({
          now: new Date('2019-01-10'),
          toFake: ['Date'],
        });

        _.each([
          {
            assessment: { id: 1, userId, },
            competenceEvaluation: { id: 111, competenceId, userId, status: 'started' },
            knowledgeElements: [
              { id: 1, skillId: 'web1', status: 'validated', source: 'direct', competenceId, earnedPix: 1, createdAt, },
              { id: 2, skillId: 'web2', status: 'invalidated', source: 'direct', competenceId, earnedPix: 2, createdAt, },
              { id: 3, skillId: 'web4', status: 'invalidated', source: 'inferred', competenceId, earnedPix: 4, createdAt, },
              { id: 4, skillId: 'url2', status: 'validated', source: 'direct', competenceId, earnedPix: 4, createdAt, },
            ]
          },
          {
            assessment: { id: 2, userId, },
            competenceEvaluation: { id: 222, competenceId: otherStartedCompetenceId, userId, status: 'started' },
            knowledgeElements: [
              { id: 5, skillId: 'rechInfo3', status: 'validated', source: 'direct', competenceId: otherStartedCompetenceId, earnedPix: 3, createdAt, },
            ]
          },
          {
            assessment: { id: 3, userId, },
            campaignParticipation: { id: 111 },
            knowledgeElements: [
              { id: 6, skillId: 'url1', status: 'validated', source: 'direct', competenceId, earnedPix: 2, createdAt, },
            ]
          }
        ], ({ assessment, competenceEvaluation, knowledgeElements, campaignParticipation }) => {
          const assessmentId = databaseBuilder.factory.buildAssessment(assessment).id;
          databaseBuilder.factory.buildCompetenceEvaluation({ ...competenceEvaluation, assessmentId, });
          databaseBuilder.factory.buildCampaignParticipation({ ...campaignParticipation, assessmentId, });
          _.each(knowledgeElements, (ke) => databaseBuilder.factory.buildKnowledgeElement({ ...ke, userId, assessmentId, }));
        });

        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return 204', async () => {
        // when
        response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
        expect(response.result).to.be.null;
      });

      it('should have reset the competence evaluation', async () => {
        // when
        response = await server.inject(options);

        // then
        const competenceEvaluation = await inspectCompetenceEvaluationInDb({ userId, competenceId });
        const otherCompetenceEvaluation = await inspectCompetenceEvaluationInDb({ userId, competenceId: otherStartedCompetenceId });
        expect(competenceEvaluation[0].status).to.equal('reset');
        expect(otherCompetenceEvaluation[0].status).to.equal('started');
      });

      it('should have reset the knowledge elements created from both competence evaluations and campaign', async () => {
        // when
        response = await server.inject(options);

        // then
        const knowledgeElement = await inspectKnowledgeElementsInDb({ userId, competenceId });
        const knowledgeElementsOtherCompetence = await inspectKnowledgeElementsInDb({ userId, competenceId: otherStartedCompetenceId });

        expect(knowledgeElement).to.have.length(5);
        expect(knowledgeElement[0].earnedPix).to.equal(0);
        expect(knowledgeElement[0].status).to.equal('reset');
        expect(knowledgeElementsOtherCompetence[0].earnedPix).to.equal(3);
        expect(knowledgeElementsOtherCompetence[0].status).to.equal('validated');
      });
    });
  });
});
