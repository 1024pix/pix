const {
  expect,
  databaseBuilder,
  knex,
  insertUserWithRolePixMaster,
  generateValidRequestAuthorizationHeader,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Acceptance | API | assessment-controller-get-last-challenge-id', function() {

  let server;

  beforeEach(async function() {
    server = await createServer();
  });

  describe('GET /api/assessments/:id/last-challenge-id', function() {

    let options;
    let assessmentId;
    let userId;
    const lastChallengeId = 'lastChallengeId';

    beforeEach(async function() {
      const { id: userId } = await insertUserWithRolePixMaster();
      assessmentId = databaseBuilder.factory.buildAssessment(
        { state: Assessment.states.STARTED, type: Assessment.types.PREVIEW, lastChallengeId, userId }).id;
      await databaseBuilder.commit();
    });

    afterEach(function() {
      return knex('assessments').delete();
    });

    context('Nominal cases', function() {

      beforeEach(function() {
        options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}/last-challenge-id`,
          headers: {
            authorization: `Bearer ${generateValidRequestAuthorizationHeader(userId)}`,
          },
        };
      });

      afterEach(function() {
        return knex('assessments').delete();
      });

      it('should return 200 HTTP status code', async function() {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return text/html; charset=utf-8', async function() {
        // when
        const response = await server.inject(options);

        // then
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('text/html; charset=utf-8');
      });

      it('should return the id of the last challenge', async function() {
        // when
        const response = await server.inject(options);

        // then
        const challengeId = response.result;
        expect(challengeId).to.deep.equal(lastChallengeId);
      });
    });

    context('When the user does not have role pixmaster', function() {
      it('should return 403 HTTP status code', async function() {
        const userId = 456;
        options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}/last-challenge-id`,
          headers: {
            authorization: `Bearer ${generateValidRequestAuthorizationHeader(userId)}`,
          },
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
