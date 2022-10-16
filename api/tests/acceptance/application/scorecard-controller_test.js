const {
  databaseBuilder,
  expect,
  knex,
  generateValidRequestAuthorizationHeader,
  LearningContentMock,
} = require('../../test-helper');
const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');
const { FRENCH_SPOKEN } = require('../../../lib/domain/constants').LOCALE;

const createServer = require('../../../server');

describe('Acceptance | Controller | scorecard-controller', function () {
  let options;
  let server;
  const userId = 42;
  const areaId = 'areaPixA1';
  const competenceId = 'competencePixA1C1';

  beforeEach(async function () {
    server = await createServer();
    databaseBuilder.factory.buildUser({ id: userId });
    await databaseBuilder.commit();
    LearningContentMock.mockCommon();
  });

  afterEach(async function () {
    await knex('knowledge-elements').delete();
    await knex('answers').delete();
    await knex('competence-evaluations').delete();
    await knex('assessments').delete();
    return knex('campaign-participations').delete();
  });

  let knowledgeElement;

  describe('GET /scorecards/{id}', function () {
    beforeEach(async function () {
      options = {
        method: 'GET',
        url: `/api/scorecards/${userId}_${competenceId}`,
        payload: {},
        headers: {},
      };
    });

    context('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('Success case', function () {
      beforeEach(function () {
        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);

        knowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
          userId,
          competenceId,
        });

        const assessmentId = databaseBuilder.factory.buildAssessment({ state: 'started' }).id;
        databaseBuilder.factory.buildCompetenceEvaluation({
          userId,
          assessmentId,
          competenceId,
        });

        return databaseBuilder.commit();
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

        const competenceData = LearningContentMock.getCompetenceDTO(competenceId);
        const areaData = LearningContentMock.getAreaDTO(areaId);
        const expectedScorecardJSONApi = {
          data: {
            type: 'scorecards',
            id: `${userId}_${competenceId}`,
            attributes: {
              name: competenceData.nameFr,
              description: competenceData.descriptionFr,
              'competence-id': competenceId,
              index: competenceData.index,
              'earned-pix': knowledgeElement.earnedPix,
              level: Math.round(knowledgeElement.earnedPix / 8),
              'pix-score-ahead-of-next-level': knowledgeElement.earnedPix,
              status: 'STARTED',
              'remaining-days-before-reset': 0,
              'remaining-days-before-improving': 0,
            },
            relationships: {
              area: {
                data: {
                  id: areaId,
                  type: 'areas',
                },
              },
              tutorials: {
                links: {
                  related: `/api/scorecards/${userId}_${competenceId}/tutorials`,
                },
              },
            },
          },
          included: [
            {
              attributes: {
                code: areaData.code,
                title: areaData.titleFr,
                color: areaData.color,
              },
              id: areaId,
              type: 'areas',
            },
          ],
        };

        // then
        expect(response.result.data).to.deep.equal(expectedScorecardJSONApi.data);
        expect(response.result.included).to.deep.equal(expectedScorecardJSONApi.included);
      });
    });
  });

  describe('GET /scorecards/{id}/tutorials', function () {
    const tutorial1Id = 'tutorialPixA1C1Th1Tu1S1Tuto1FR';
    const tutorial2Id = 'tutorialPixA1C1Th1Tu1S1Tuto2FR';
    const skillId = 'skillPixA1C1Th1Tu1S1';

    beforeEach(function () {
      options = {
        method: 'GET',
        url: `/api/scorecards/${userId}_${competenceId}/tutorials`,
        payload: {},
        headers: {},
      };
    });

    context('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('Success case', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildUserSavedTutorial({
          id: 10500,
          userId,
          tutorialId: tutorial1Id,
        });
        await databaseBuilder.commit();

        options.headers = {
          authorization: generateValidRequestAuthorizationHeader(userId),
          'accept-language': FRENCH_SPOKEN,
        };

        knowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
          userId,
          competenceId,
          status: KnowledgeElement.StatusType.INVALIDATED,
          skillId,
          createdAt: new Date('2018-01-01'),
        });

        const assessmentId = databaseBuilder.factory.buildAssessment({ state: 'started' }).id;
        databaseBuilder.factory.buildCompetenceEvaluation({
          userId,
          assessmentId,
          competenceId,
        });

        await databaseBuilder.commit();
      });

      it('should return 200', async function () {
        // given

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it("should return user's serialized tutorials", async function () {
        // given
        const tutorial1Data = LearningContentMock.getTutorialDTO(tutorial1Id);
        const tutorial2Data = LearningContentMock.getTutorialDTO(tutorial2Id);
        const tubeData = LearningContentMock.getTubeDTO('tubePixA1C1Th1Tu1');
        const expectedTutorialsJSONApi = {
          data: [
            {
              type: 'tutorials',
              id: tutorial1Id,
              attributes: {
                title: tutorial1Data.title,
                format: tutorial1Data.format,
                source: tutorial1Data.source,
                link: tutorial1Data.link,
                duration: tutorial1Data.duration,
                'tube-name': tubeData.name,
                'tube-practical-description': tubeData.practicalDescriptionFr,
                'tube-practical-title': tubeData.practicalTitleFr,
                'skill-id': skillId,
              },
              relationships: {
                'tutorial-evaluation': {
                  data: null,
                },
                'user-saved-tutorial': {
                  data: {
                    id: '10500',
                    type: 'user-saved-tutorial',
                  },
                },
                'user-tutorial': {
                  data: {
                    id: '10500',
                    type: 'user-tutorial',
                  },
                },
              },
            },
            {
              type: 'tutorials',
              id: tutorial2Id,
              attributes: {
                title: tutorial2Data.title,
                format: tutorial2Data.format,
                source: tutorial2Data.source,
                link: tutorial2Data.link,
                duration: tutorial2Data.duration,
                'tube-name': tubeData.name,
                'tube-practical-description': tubeData.practicalDescriptionFr,
                'tube-practical-title': tubeData.practicalTitleFr,
                'skill-id': skillId,
              },
              relationships: {
                'tutorial-evaluation': {
                  data: null,
                },
                'user-saved-tutorial': {
                  data: null,
                },
                'user-tutorial': {
                  data: null,
                },
              },
            },
          ],
          included: [
            {
              attributes: {
                id: 10500,
                'tutorial-id': tutorial1Id,
                'user-id': 42,
              },
              id: '10500',
              type: 'user-saved-tutorial',
            },
            {
              attributes: {
                id: 10500,
                'tutorial-id': tutorial1Id,
                'user-id': 42,
              },
              id: '10500',
              type: 'user-tutorial',
            },
          ],
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.data).to.deep.equal(expectedTutorialsJSONApi.data);
        expect(response.result.included).to.deep.equal(expectedTutorialsJSONApi.included);
      });

      context('when user resets competence', function () {
        beforeEach(async function () {
          const options = {
            method: 'POST',
            url: `/api/users/${userId}/competences/${competenceId}/reset`,
            payload: {},
            headers: {
              authorization: generateValidRequestAuthorizationHeader(userId),
            },
          };

          await server.inject(options);
        });

        it('should return an empty tutorial list', async function () {
          // given
          const expectedTutorialsJSONApi = {
            data: [],
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.result.data).to.deep.equal(expectedTutorialsJSONApi.data);
          expect(response.result.included).to.deep.equal(expectedTutorialsJSONApi.included);
        });
      });
    });
  });
});
