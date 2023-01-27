const {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  mockLearningContent,
  insertUserWithRoleSuperAdmin,
} = require('../../../test-helper');

const createServer = require('../../../../server');
const constants = require('../../../../lib/domain/constants');

describe('Acceptance | Controller | users-controller-get-user-profile-for-admin', function () {
  let options;
  let server;
  let userId;

  const skillWeb1Id = 'recAcquisWeb1';
  const skillWeb1Name = '@web1';

  const competenceId = 'recCompetence';

  const area = {
    id: 'recvoGdo7z2z7pXWa',
    title_i18n: {
      fr: 'Information et données',
    },
    color: 'jaffa',
    code: '1',
    competenceIds: [competenceId],
  };

  const competence = {
    id: competenceId,
    name_i18n: {
      fr: 'Mener une recherche et une veille d’information',
    },
    description_i18n: {
      fr: 'Une description',
    },
    index: '1.1',
    origin: 'Pix',
    areaId: 'recvoGdo7z2z7pXWa',
  };

  const learningContent = {
    areas: [area],
    competences: [competence],
    skills: [
      {
        id: skillWeb1Id,
        name: skillWeb1Name,
        status: 'actif',
        competenceId: competenceId,
      },
    ],
  };

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser({}).id;
    await databaseBuilder.commit();
    options = {
      method: 'GET',
      url: `/api/admin/users/${userId}/profile`,
      payload: {},
      headers: {},
    };
    server = await createServer();
  });

  let knowledgeElement;

  describe('GET /admin/users/:id/profile', function () {
    describe('Ressource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if requested user is not admin', async function () {
        // given
        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', function () {
      beforeEach(async function () {
        const superAdmin = await insertUserWithRoleSuperAdmin();
        options.headers.authorization = generateValidRequestAuthorizationHeader(superAdmin.id);

        mockLearningContent(learningContent);

        knowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
          userId,
          competenceId: competenceId,
        });

        const assessmentId = databaseBuilder.factory.buildAssessment({ state: 'started' }).id;
        databaseBuilder.factory.buildCompetenceEvaluation({
          userId,
          assessmentId,
          competenceId: competenceId,
        });

        await databaseBuilder.commit();
      });

      it('should return 200', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it("should return user's serialized scorecards", async function () {
        // when
        const response = await server.inject(options);

        const expectedScorecardJSONApi = {
          data: {
            id: userId.toString(),
            type: 'Profiles',
            attributes: {
              'pix-score': knowledgeElement.earnedPix,
              'max-reachable-level': constants.MAX_REACHABLE_LEVEL,
              'max-reachable-pix-score': constants.MAX_REACHABLE_PIX_SCORE,
            },
            relationships: {
              scorecards: {
                data: [
                  {
                    id: `${userId}_${competenceId}`,
                    type: 'scorecards',
                  },
                ],
              },
            },
          },
          included: [
            {
              attributes: {
                code: area.code,
                title: area.title_i18n.fr,
                color: area.color,
              },
              id: area.id,
              type: 'areas',
            },
            {
              attributes: {
                'competence-id': 'recCompetence',
                description: 'Une description',
                'earned-pix': 2,
                'has-not-earned-anything': false,
                'has-not-reached-level-one': true,
                'has-reached-at-least-level-one': false,
                index: '1.1',
                'is-finished': false,
                'is-finished-with-max-level': false,
                'is-improvable': false,
                'is-max-level': false,
                'is-not-started': false,
                'is-progressable': true,
                'is-resettable': true,
                'is-started': true,
                level: 0,
                name: 'Mener une recherche et une veille d’information',
                'percentage-ahead-of-next-level': 25,
                'pix-score-ahead-of-next-level': 2,
                'remaining-days-before-improving': 0,
                'remaining-days-before-reset': 0,
                'remaining-pix-to-next-level': 6,
                'should-wait-before-improving': false,
                status: 'STARTED',
              },
              id: `${userId}_${competenceId}`,
              type: 'scorecards',
              relationships: {
                area: {
                  data: {
                    id: area.id,
                    type: 'areas',
                  },
                },
              },
            },
          ],
        };

        // then
        expect(response.result.data).to.deep.equal(expectedScorecardJSONApi.data);
        expect(response.result.included).to.deep.equal(expectedScorecardJSONApi.included);
      });
    });
  });
});
