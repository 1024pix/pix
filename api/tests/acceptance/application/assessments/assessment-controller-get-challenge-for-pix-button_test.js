const {
  expect,
  databaseBuilder,
  knex,
  LearningContentMock,
  insertUserWithRoleSuperAdmin,
  generateValidRequestAuthorizationHeader,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const Assessment = require('../../../../lib/domain/models/Assessment');

const lastChallengeId = 'challengePixA1C1Th1Tu1S1Ch1';

describe('Acceptance | API | assessment-controller-get-challenge-answer-for-pix-auto-answer', function () {
  let server;
  let options;
  let assessmentId;

  beforeEach(async function () {
    server = await createServer();
    LearningContentMock.mockCommon();
  });

  describe('GET /api/assessments/:id/challenge-for-pix-auto-answer', function () {
    let userId;

    beforeEach(async function () {
      const user = await insertUserWithRoleSuperAdmin();
      userId = user.id;
      assessmentId = databaseBuilder.factory.buildAssessment({
        state: Assessment.states.STARTED,
        type: Assessment.types.PREVIEW,
        lastChallengeId,
        userId,
      }).id;
      await databaseBuilder.commit();
    });

    afterEach(async function () {
      return knex('assessments').delete();
    });

    context('Nominal case', function () {
      beforeEach(function () {
        options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}/challenge-for-pix-auto-answer`,
          headers: {
            authorization: `Bearer ${generateValidRequestAuthorizationHeader(userId)}`,
          },
        };
      });

      it('should return 200 HTTP status code', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return application/json; charset=utf-8', async function () {
        // when
        const response = await server.inject(options);

        // then
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json; charset=utf-8');
      });

      it('should return challengeForPixAutoAnswer', async function () {
        // when
        const response = await server.inject(options);

        // then
        const lastChallenge = LearningContentMock.getChallengeDTO(lastChallengeId);
        expect(response.result).to.deep.equal({
          id: lastChallengeId,
          type: lastChallenge.type,
          autoReply: false,
          solution: lastChallenge.solution,
        });
      });
    });

    context('When the user does not have role Super Admin', function () {
      it('should return 403 HTTP status code', async function () {
        const userId = 456;
        options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}/challenge-for-pix-auto-answer`,
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
