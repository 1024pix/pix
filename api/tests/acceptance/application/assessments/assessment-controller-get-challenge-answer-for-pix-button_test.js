const { expect, databaseBuilder, knex, mockLearningContent, learningContentBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');
const Assessment = require('../../../../lib/domain/models/Assessment');
const config = require('../../../../lib/config');

const lastChallengeAnswer = 'last challenge answer';
const lastChallengeId = 'lastChallengeId';
const learningContent = [{
  id: 'recArea1',
  titleFrFr: 'area1_Title',
  color: 'someColor',
  competences: [{
    id: 'competenceId',
    nameFrFr: 'Mener une recherche et une veille d’information',
    index: '1.1',
    tubes: [{
      id: 'recTube0_0',
      skills: [{
        id: 'skillWeb2Id',
        nom: '@web2',
        challenges: [{ id: lastChallengeId, solution: lastChallengeAnswer }],
      }],
    }],
  }],
}];

describe('Acceptance | API | assessment-controller-get-challenge-answer-for-pix-button', () => {
  let server, pixAutoAnswerApiKey;
  let options;
  let userId;
  let assessmentId;

  beforeEach(async () => {
    server = await createServer();
    const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);
    pixAutoAnswerApiKey = config.pixAutoAnswer.apiKey;
  });

  describe('GET /api/assessments/:id/challenge-answer-for-pix-auto-answer', () => {
    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;
      assessmentId = databaseBuilder.factory.buildAssessment(
        { state: Assessment.states.STARTED, type: Assessment.types.PREVIEW, lastChallengeId, userId }).id;
      await databaseBuilder.commit();

      options = {
        method: 'GET',
        url: `/api/assessments/${assessmentId}/challenge-answer-for-pix-auto-answer`,
        headers: {
          authorization: `Bearer ${pixAutoAnswerApiKey}`,
        },
      };
    });

    afterEach(async () => {
      return knex('assessments').delete();
    });

    it('should return 200 HTTP status code', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return text/html; charset=utf-8', async () => {
      // when
      const response = await server.inject(options);

      // then
      const contentType = response.headers['content-type'];
      expect(contentType).to.contain('text/html; charset=utf-8');
    });

    it('should return challenge\'s answer', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.result).to.equal(lastChallengeAnswer);
    });
  });
});
