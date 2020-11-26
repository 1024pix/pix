const { databaseBuilder, expect, knex, generateValidRequestAuthorizationHeader, mockLearningContent } = require('../../test-helper');
const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');
const { FRENCH_SPOKEN } = require('../../../lib/domain/constants').LOCALE;

const createServer = require('../../../server');

describe('Acceptance | Controller | scorecard-controller', () => {

  let options;
  let server;
  const userId = 42;

  const competenceId = 'recCompetence';
  const skillWeb1Id = 'recAcquisWeb1';
  const skillWeb1Name = '@web1';
  const tutorialWebId = 'recTutorial1';

  const competence = {
    id: competenceId,
    nameFrFr: 'Mener une recherche et une veille d’information',
    index: '1.1',
    origin: 'Pix',
    areaId: 'recvoGdo7z2z7pXWa',
  };

  const area = {
    id: 'recvoGdo7z2z7pXWa',
    titleFrFr: 'Information et données',
    color: 'jaffa',
    code: '1',
    competenceIds: [competenceId],
  };

  const learningContent = {
    areas: [area],
    competences: [competence],
    tubes: [{
      id: 'recArea1_Competence1_Tube1',
      name: '@web',
      practicalDescriptionFrFr: 'Ceci est une description pratique',
      practicalTitleFrFr: 'Ceci est un titre pratique',
      competenceId: competenceId,
    }],
    skills: [{
      id: skillWeb1Id,
      name: skillWeb1Name,
      status: 'actif',
      competenceId: competenceId,
      tutorialIds: ['recTutorial0', tutorialWebId, 'recTutorial2'],
    }],
    tutorials: [{
      id: 'recTutorial0',
      locale: 'en-us',
      duration: '00:00:54',
      format: 'video',
      link: 'https://tuto.com',
      source: 'tuto.com',
      title: 'tuto1',
    },{
      id: tutorialWebId,
      locale: 'fr-fr',
      duration: '00:03:31',
      format: 'vidéo',
      link: 'http://www.example.com/this-is-an-example.html',
      source: 'Source Example, Example',
      title: 'Communiquer',
    },{
      id: 'recTutorial2',
      locale: 'fr-fr',
      duration: '00:03:31',
      format: 'vidéo',
      link: 'http://www.example.com/this-is-an-example.html',
      source: 'Source Example, Example',
      title: 'Communiquer',
    }],
  };

  beforeEach(async () => {
    server = await createServer();
    databaseBuilder.factory.buildUser({ id: userId });
    await databaseBuilder.commit();
    mockLearningContent(learningContent);

  });

  afterEach(async () => {
    await knex('knowledge-elements').delete();
    await knex('answers').delete();
    await knex('competence-evaluations').delete();
    await knex('assessments').delete();
    return knex('campaign-participations').delete();
  });

  let knowledgeElement;

  describe('GET /scorecards/{id}', () => {

    beforeEach(async () => {
      options = {
        method: 'GET',
        url: `/api/scorecards/${userId}_${competenceId}`,
        payload: {},
        headers: {},
      };
    });

    context('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', () => {
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

    context('Success case', () => {

      beforeEach(async () => {
        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);

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

      it('should return 200', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
        });

      });

      it('should return user\'s serialized scorecards', () => {
        // when
        const promise = server.inject(options);

        const expectedScorecardJSONApi = {
          data: {
            type: 'scorecards',
            id: `${userId}_${competenceId}`,
            attributes: {
              name: competence.nameFrFr,
              description: competence.descriptionFrFr,
              'competence-id': competenceId,
              index: competence.index,
              'earned-pix': knowledgeElement.earnedPix,
              level: Math.round(knowledgeElement.earnedPix / 8),
              'pix-score-ahead-of-next-level': knowledgeElement.earnedPix,
              status: 'STARTED',
              'remaining-days-before-reset': 7,
              'remaining-days-before-improving': 4,
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
                title: area.titleFrFr,
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

  describe('GET /scorecards/{id}/tutorials', () => {

    beforeEach(async () => {
      options = {
        method: 'GET',
        url: `/api/scorecards/${userId}_${competenceId}/tutorials`,
        payload: {},
        headers: {},
      };
    });

    context('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', async () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('Success case', () => {

      beforeEach(async () => {
        databaseBuilder.factory.buildUserTutorial({ id: 10500, userId, tutorialId: tutorialWebId });
        await databaseBuilder.commit();

        options.headers = {
          authorization: generateValidRequestAuthorizationHeader(userId),
          'accept-language': FRENCH_SPOKEN,
        };

        knowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
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

      it('should return 200', async () => {
        // given

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return user\'s serialized tutorials', async () => {
        // given
        const expectedTutorialsJSONApi = {
          'data': [
            {
              'type': 'tutorials',
              'id': 'recTutorial1',
              'attributes': {
                'duration': '00:03:31',
                'format': 'vidéo',
                'link': 'http://www.example.com/this-is-an-example.html',
                'source': 'Source Example, Example',
                'title': 'Communiquer',
                'tube-name': '@web',
                'tube-practical-description': 'Ceci est une description pratique',
                'tube-practical-title': 'Ceci est un titre pratique',
              },
              relationships: {
                'user-tutorial': {
                  'data': {
                    'id': '10500',
                    'type': 'user-tutorial',
                  },
                },
              },
            },
            {
              'type': 'tutorials',
              'id': 'recTutorial2',
              'attributes': {
                'duration': '00:03:31',
                'format': 'vidéo',
                'link': 'http://www.example.com/this-is-an-example.html',
                'source': 'Source Example, Example',
                'title': 'Communiquer',
                'tube-name': '@web',
                'tube-practical-description': 'Ceci est une description pratique',
                'tube-practical-title': 'Ceci est un titre pratique',
              },
            },
          ],
          included: [
            {
              'attributes': {
                'id': 10500,
                'tutorial-id': 'recTutorial1',
                'user-id': 42,
              },
              'id': '10500',
              'type': 'user-tutorial',
            },
          ],
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.data).to.deep.equal(expectedTutorialsJSONApi.data);
        expect(response.result.included).to.deep.equal(expectedTutorialsJSONApi.included);
      });

      context('when user resets competence', () => {
        beforeEach(async () => {
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

        it('should return an empty tutorial list', async () => {
          // given
          const expectedTutorialsJSONApi = {
            'data': [],
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
