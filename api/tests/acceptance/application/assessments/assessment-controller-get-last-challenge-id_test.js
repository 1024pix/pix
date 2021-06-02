const { expect, databaseBuilder, knex } = require('../../../test-helper');
const createServer = require('../../../../server');
const Assessment = require('../../../../lib/domain/models/Assessment');
const config = require('../../../../lib/config');

describe('Acceptance | API | assessment-controller-get-last-challenge-id', () => {

  let server, pixAutoAnswerApiKey;

  beforeEach(async () => {
    server = await createServer();
    pixAutoAnswerApiKey = config.pixAutoAnswer.apiKey;
  });

  describe('GET /api/assessments/:id/last-challenge-id', () => {

    let options;
    let userId;
    let assessmentId;
    const lastChallengeId = 'lastChallengeId';

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;
      assessmentId = databaseBuilder.factory.buildAssessment(
        { state: Assessment.states.STARTED, type: Assessment.types.PREVIEW, lastChallengeId, userId }).id;
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      return knex('assessments').delete();
    });

    context('Nominal cases', () => {

      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}/last-challenge-id`,
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

      it('should return the id of the last challenge', async () => {
        // when
        const response = await server.inject(options);

        // then
        const challengeId = response.result;
        expect(challengeId).to.deep.equal(lastChallengeId);
      });
    });

    context('When the given pixAutoAnswerApiKey is not correct', () => {
      it('should return 401 HTTP status code', async () => {

        options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}/last-challenge-id`,
          headers: {
            authorization: 'Bearer wrong-api-key',
          },
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
