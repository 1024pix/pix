import {
  databaseBuilder,
  expect,
  knex,
  generateValidRequestAuthorizationHeader,
  mockLearningContent,
} from '../../../test-helper.js';

import { KnowledgeElement } from '../../../../lib/domain/models/KnowledgeElement.js';
import { LOCALE } from '../../../../src/shared/domain/constants.js';

const { FRENCH_SPOKEN } = LOCALE;

import { createServer } from '../../../../server.js';

describe('Acceptance | Controller | scorecard-controller', function () {
  let options;
  let server;
  const userId = 42;

  const competenceId = 'recCompetence';
  const skillWeb1Id = 'recAcquisWeb1';
  const skillWeb1Name = '@web1';
  const tutorialWebId = 'recTutorial1';

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

  const area = {
    id: 'recvoGdo7z2z7pXWa',
    title_i18n: {
      fr: 'Information et données',
    },
    color: 'jaffa',
    code: '1',
    competenceIds: [competenceId],
  };

  const learningContent = {
    areas: [area],
    competences: [competence],
    tubes: [
      {
        id: 'recArea1_Competence1_Tube1',
        name: '@web',
        practicalDescription_i18n: {
          fr: 'Ceci est une description pratique',
        },
        practicalTitle_i18n: {
          fr: 'Ceci est un titre pratique',
        },
        competenceId: competenceId,
      },
    ],
    skills: [
      {
        id: skillWeb1Id,
        name: skillWeb1Name,
        status: 'actif',
        competenceId: competenceId,
        tutorialIds: ['recTutorial0', tutorialWebId, 'recTutorial2'],
      },
    ],
    tutorials: [
      {
        id: 'recTutorial0',
        locale: 'en-us',
        duration: '00:00:54',
        format: 'video',
        link: 'https://tuto.com',
        source: 'tuto.com',
        title: 'tuto1',
      },
      {
        id: tutorialWebId,
        locale: 'fr-fr',
        duration: '00:03:31',
        format: 'vidéo',
        link: 'http://www.example.com/this-is-an-example.html',
        source: 'Source Example, Example',
        title: 'Communiquer',
      },
      {
        id: 'recTutorial2',
        locale: 'fr-fr',
        duration: '00:03:31',
        format: 'vidéo',
        link: 'http://www.example.com/this-is-an-example.html',
        source: 'Source Example, Example',
        title: 'Communiquer',
      },
    ],
  };

  beforeEach(async function () {
    server = await createServer();
    databaseBuilder.factory.buildUser({ id: userId });
    await databaseBuilder.commit();
    mockLearningContent(learningContent);
  });

  afterEach(async function () {
    await knex('knowledge-elements').delete();
    await knex('answers').delete();
    await knex('competence-evaluations').delete();
    await knex('assessments').delete();
    return knex('campaign-participations').delete();
  });

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
      it('should respond with a 401 - unauthorized access - if user is not authenticated', function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });

    context('Success case', function () {
      beforeEach(async function () {
        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);

        databaseBuilder.factory.buildKnowledgeElement({
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

      it('should return 200', function () {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });

      it("should return user's serialized scorecards", function () {
        // when
        const promise = server.inject(options);

        const expectedScorecardJSONApi = {
          data: {
            type: 'scorecards',
            id: `${userId}_${competenceId}`,
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
            relationships: {
              area: {
                data: {
                  id: area.id,
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
                code: area.code,
                title: area.title_i18n.fr,
                color: area.color,
              },
              id: area.id,
              type: 'areas',
            },
          ],
        };

        // then
        return promise.then((response) => {
          expect(response.result.data).to.deep.equal(expectedScorecardJSONApi.data);
          expect(response.result.included).to.deep.equal(expectedScorecardJSONApi.included);
        });
      });
    });
  });

  describe('GET /scorecards/{id}/tutorials', function () {
    beforeEach(async function () {
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
        databaseBuilder.factory.buildUserSavedTutorial({ id: 10500, userId, tutorialId: tutorialWebId });
        await databaseBuilder.commit();

        options.headers = {
          authorization: generateValidRequestAuthorizationHeader(userId),
          'accept-language': FRENCH_SPOKEN,
        };

        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          competenceId: competence.id,
          status: KnowledgeElement.StatusType.INVALIDATED,
          skillId: skillWeb1Id,
          createdAt: new Date('2018-01-01'),
        });

        const assessmentId = databaseBuilder.factory.buildAssessment({ state: 'started' }).id;
        databaseBuilder.factory.buildCompetenceEvaluation({
          userId,
          assessmentId,
          competenceId: competence.id,
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
        const expectedTutorialsJSONApi = {
          data: [
            {
              type: 'tutorials',
              id: 'recTutorial1',
              attributes: {
                duration: '00:03:31',
                format: 'vidéo',
                link: 'http://www.example.com/this-is-an-example.html',
                source: 'Source Example, Example',
                title: 'Communiquer',
                'tube-name': '@web',
                'tube-practical-description': 'Ceci est une description pratique',
                'tube-practical-title': 'Ceci est un titre pratique',
                'skill-id': 'recAcquisWeb1',
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
              },
            },
            {
              type: 'tutorials',
              id: 'recTutorial2',
              attributes: {
                duration: '00:03:31',
                format: 'vidéo',
                link: 'http://www.example.com/this-is-an-example.html',
                source: 'Source Example, Example',
                title: 'Communiquer',
                'tube-name': '@web',
                'tube-practical-description': 'Ceci est une description pratique',
                'tube-practical-title': 'Ceci est un titre pratique',
                'skill-id': 'recAcquisWeb1',
              },
              relationships: {
                'tutorial-evaluation': {
                  data: null,
                },
                'user-saved-tutorial': {
                  data: null,
                },
              },
            },
          ],
          included: [
            {
              attributes: {
                id: 10500,
                'tutorial-id': 'recTutorial1',
                'user-id': 42,
              },
              id: '10500',
              type: 'user-saved-tutorial',
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
