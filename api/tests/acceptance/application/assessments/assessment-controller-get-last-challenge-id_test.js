const { expect, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Acceptance | API | assessment-controller-get-last-challenge-id', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
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
        };
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

    context('When trying to read an assessment that doesn\'t belong to the current user', () => {
      it('should return 401 HTTP status code', async () => {
        const wrongUserId = 'I do not own this assessment';

        options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}/last-challenge-id`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(wrongUserId),
          },
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
