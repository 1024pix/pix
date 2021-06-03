const {
  expect,
  databaseBuilder,
  knex,
  insertUserWithRolePixMaster,
  generateValidRequestAuthorizationHeader,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Acceptance | API | assessment-controller-get-last-challenge-id', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/assessments/:id/last-challenge-id', () => {

    let options;
    let assessmentId;
    let userId;
    const lastChallengeId = 'lastChallengeId';

    beforeEach(async () => {
      const { id: userId } = await insertUserWithRolePixMaster();
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
            authorization: `Bearer ${generateValidRequestAuthorizationHeader(userId)}`,
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
