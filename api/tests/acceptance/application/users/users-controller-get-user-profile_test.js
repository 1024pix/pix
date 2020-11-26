const { databaseBuilder, expect, generateValidRequestAuthorizationHeader, mockLearningContent } = require('../../../test-helper');

const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-get-user-profile', () => {

  let options;
  let server;
  let userId;

  const skillWeb1Id = 'recAcquisWeb1';
  const skillWeb1Name = '@web1';

  const competenceId = 'recCompetence';

  const area = {
    id: 'recvoGdo7z2z7pXWa',
    titleFrFr: 'Information et données',
    color: 'jaffa',
    code: '1',
    competenceIds: [competenceId],
  };

  const competence = {
    id: competenceId,
    nameFrFr: 'Mener une recherche et une veille d’information',
    descriptionFrFr: 'Une description',
    index: '1.1',
    origin: 'Pix',
    areaId: 'recvoGdo7z2z7pXWa',
  };

  const learningContent = {
    areas: [area],
    competences: [competence],
    skills: [{
      id: skillWeb1Id,
      name: skillWeb1Name,
      status: 'actif',
      competenceId: competenceId,
    }],
  };

  beforeEach(async () => {
    userId = databaseBuilder.factory.buildUser({}).id;
    await databaseBuilder.commit();
    options = {
      method: 'GET',
      url: '/api/users/' + userId + '/profile',
      payload: {},
      headers: {},
    };
    server = await createServer();
  });

  let knowledgeElement;

  describe('GET /users/:id/profile', () => {

    describe('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', async () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if requested user is not the same as authenticated user', async () => {
        // given
        const otherUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', () => {

      beforeEach(async () => {
        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);

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

      it('should return 200', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return user\'s serialized scorecards', async () => {
        // when
        const response = await server.inject(options);

        const expectedScorecardJSONApi = {
          data: {
            id: userId.toString(),
            type: 'Profiles',
            attributes: {
              'pix-score': knowledgeElement.earnedPix,
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
                title: area.titleFrFr,
                color: area.color,
              },
              id: area.id,
              type: 'areas',
            },
            {
              attributes: {
                name: competence.nameFrFr,
                description: competence.descriptionFrFr,
                index: competence.index,
                'competence-id': competenceId,
                'earned-pix': knowledgeElement.earnedPix,
                level: Math.round(knowledgeElement.earnedPix / 8),
                'pix-score-ahead-of-next-level': knowledgeElement.earnedPix,
                status: 'STARTED',
                'remaining-days-before-reset': 7,
                'remaining-days-before-improving': 4,
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
