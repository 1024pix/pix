const {
  expect,
  databaseBuilder,
  knex,
  mockLearningContent,
  learningContentBuilder,
  insertUserWithRoleSuperAdmin,
  generateValidRequestAuthorizationHeader,
} = require('../../../test-helper');
const settings = require('../../../../lib/config');
const createServer = require('../../../../server');
const Assessment = require('../../../../lib/domain/models/Assessment');

const lastChallengeAnswer = 'last challenge answer';
const lastChallengeId = 'lastChallengeId';
const learningContent = [
  {
    areas: [
      {
        id: 'recArea1',
        color: 'someColor',
        competences: [
          {
            id: 'competenceId',
            name_i18n: { fr: 'Mener une recherche et une veille d’information' },
            index: '1.1',
            tubes: [
              {
                id: 'recTube0_0',
                skills: [
                  {
                    id: 'skillWeb2Id',
                    nom: '@web2',
                    challenges: [
                      { id: lastChallengeId, solution: lastChallengeAnswer, type: 'QROC', autoReply: false },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

describe('Acceptance | API | assessment-controller-auto-validate-next-challenge', function () {
  let originalEnvValue;
  let server;
  let assessmentId;

  beforeEach(async function () {
    originalEnvValue = settings.featureToggles.isAlwaysOkValidateNextChallengeEndpointEnabled;
    settings.featureToggles.isAlwaysOkValidateNextChallengeEndpointEnabled = true;

    server = await createServer();
    const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);
  });

  afterEach(function () {
    settings.featureToggles.isAlwaysOkValidateNextChallengeEndpointEnabled = originalEnvValue;
  });

  describe('POST /api/admin/assessments/:id/always-ok-validate-next-challenge', function () {
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
      await knex('answers').delete();
    });

    it('records an "ok" answer and returns 200 HTTP status code', async function () {
      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/assessments/${assessmentId}/always-ok-validate-next-challenge`,
        headers: {
          authorization: `Bearer ${generateValidRequestAuthorizationHeader(userId)}`,
        },
      });

      // then
      expect(response.statusCode).to.equal(204);
      const lastAnswer = await knex.select('*').from('answers').where({ assessmentId }).first();
      expect(lastAnswer).to.exist;
      expect(lastAnswer.result).to.eql('ok');
      expect(lastAnswer.value).to.eql('FAKE_ANSWER_WITH_AUTO_VALIDATE_NEXT_CHALLENGE');
    });
  });
});
