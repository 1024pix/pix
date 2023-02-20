import {
  expect,
  databaseBuilder,
  knex,
  mockLearningContent,
  learningContentBuilder,
  insertUserWithRoleSuperAdmin,
  generateValidRequestAuthorizationHeader,
} from '../../../test-helper';

import createServer from '../../../../server';
import Assessment from '../../../../lib/domain/models/Assessment';

const lastChallengeAnswer = 'last challenge answer';
const lastChallengeId = 'lastChallengeId';
const learningContent = [
  {
    id: 'recArea1',
    title_i18n: {
      fr: 'area1_Title',
    },
    color: 'someColor',
    competences: [
      {
        id: 'competenceId',
        name_i18n: {
          fr: 'Mener une recherche et une veille d’information',
        },
        index: '1.1',
        tubes: [
          {
            id: 'recTube0_0',
            skills: [
              {
                id: 'skillWeb2Id',
                nom: '@web2',
                challenges: [{ id: lastChallengeId, solution: lastChallengeAnswer, type: 'QROC', autoReply: false }],
              },
            ],
          },
        ],
      },
    ],
  },
];

describe('Acceptance | API | assessment-controller-get-challenge-answer-for-pix-auto-answer', function () {
  let server;
  let options;
  let assessmentId;

  beforeEach(async function () {
    server = await createServer();
    const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(learningContent);
    mockLearningContent(learningContentObjects);
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
        expect(response.result).to.deep.equal({
          id: lastChallengeId,
          type: 'QROC',
          autoReply: false,
          solution: lastChallengeAnswer,
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
