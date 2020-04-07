const { airtableBuilder, databaseBuilder, expect, knex, generateValidRequestAuthorizationHeader } = require('../../test-helper');
const cache = require('../../../lib/infrastructure/caches/learning-content-cache');
const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');

const createServer = require('../../../server');

describe('Acceptance | Controller | scorecard-controller', () => {

  let options;
  let server;
  const userId = 42;

  const competenceId = 'recCompetence';
  const skillWeb1Id = 'recAcquisWeb1';
  const skillWeb1Name = '@web1';
  const competenceReference = '1.1 Mener une recherche et une veille d’information';

  beforeEach(async () => {
    await cache.flushAll();
    server = await createServer();
    databaseBuilder.factory.buildUser({ id: userId });
    await databaseBuilder.commit();
  });

  afterEach(async () => {
    airtableBuilder.cleanAll();
    await knex('knowledge-elements').delete();
    await knex('answers').delete();
    await knex('competence-evaluations').delete();
    await knex('assessments').delete();
    return knex('campaign-participations').delete();
  });

  after(() => {
    return cache.flushAll();
  });

  let area;
  let knowledgeElement;
  let competence;

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

        competence = airtableBuilder.factory.buildCompetence({
          id: competenceId,
          epreuves: [],
          titre: 'Mener une recherche et une veille d’information',
          tests: [],
          acquisIdentifiants: [skillWeb1Id],
          tubes: [],
          acquisViaTubes: [skillWeb1Id],
          reference: competenceReference,
          testsRecordID: [],
          acquis: [skillWeb1Name],
        });

        area = airtableBuilder.factory.buildArea();

        airtableBuilder.mockList({ tableName: 'Domaines' })
          .returns([area])
          .activate();

        airtableBuilder.mockList({ tableName: 'Competences' })
          .returns([competence])
          .activate();

        knowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
          userId,
          competenceId: competence.id,
        });

        const assessmentId = databaseBuilder.factory.buildAssessment({ state: 'started' }).id;
        databaseBuilder.factory.buildCompetenceEvaluation({
          userId,
          assessmentId,
          competenceId: competence.id
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
              name: competence.fields.Titre,
              description: competence.fields.Description,
              'competence-id': competenceId,
              index: competence.fields['Sous-domaine'],
              'earned-pix': knowledgeElement.earnedPix,
              level: Math.round(knowledgeElement.earnedPix / 8),
              'pix-score-ahead-of-next-level': knowledgeElement.earnedPix,
              status: 'STARTED',
              'remaining-days-before-reset': 7,
            },
            relationships: {
              area: {
                data: {
                  id: area.id,
                  type: 'areas'
                }
              },
              tutorials: {
                links: {
                  related: `/api/scorecards/${userId}_${competenceId}/tutorials`
                }
              }
            },
          },
          included: [
            {
              attributes: {
                code: area.fields.Code,
                title: area.fields.Titre,
                color: area.fields.Couleur,
              },
              id: area.id,
              type: 'areas'
            }
          ]
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
      const tubeWeb = '@web';
      const tubeWebId = 'recTubeWeb1';
      const tutorialWebId = 'recTutorial1';
      const tutorialWebId2 = 'recTutorial2';

      beforeEach(async () => {
        databaseBuilder.factory.buildUserTutorial({ id: 10500, userId, tutorialId: tutorialWebId });
        await databaseBuilder.commit();

        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);

        const tutorials = [
          airtableBuilder.factory.buildTutorial({ id: tutorialWebId }),
          airtableBuilder.factory.buildTutorial({ id: tutorialWebId2 }),
        ];

        const skills = [
          airtableBuilder.factory.buildSkill({
            id: skillWeb1Id,
            nom: skillWeb1Name,
            'comprendre': [tutorials[0].id, tutorials[1].id],
            'compétenceViaTube': [competenceId],
          }),
        ];

        const tubes = [
          airtableBuilder.factory.buildTube({
            id: tubeWebId,
            nom: tubeWeb,
            titrePratique: 'Ceci est un titre pratique',
            descriptionPratique: 'Ceci est une description pratique'
          }),
        ];

        competence = airtableBuilder.factory.buildCompetence({
          id: competenceId,
          titre: 'Mener une recherche et une veille d’information',
          acquisIdentifiants: [skills[0].id],
          tubes: [tubes[0].id],
          acquisViaTubes: [skills[0].id],
          reference: competenceReference,
          acquis: [skillWeb1Name],
        });

        area = airtableBuilder.factory.buildArea();

        airtableBuilder.mockList({ tableName: 'Competences' }).returns([competence]).activate();
        airtableBuilder.mockList({ tableName: 'Acquis' }).returns(skills).activate();
        airtableBuilder.mockList({ tableName: 'Domaines' }).returns([area]).activate();
        airtableBuilder.mockList({ tableName: 'Tubes' }).returns(tubes).activate();
        airtableBuilder.mockList({ tableName: 'Tutoriels' }).returns(tutorials).activate();

        knowledgeElement = databaseBuilder.factory.buildKnowledgeElement({
          userId,
          competenceId: competence.id,
          status: KnowledgeElement.StatusType.INVALIDATED,
          skillId: skills[0].id,
          createdAt: new Date('2018-01-01'),
        });

        const assessmentId = databaseBuilder.factory.buildAssessment({ state: 'started' }).id;
        databaseBuilder.factory.buildCompetenceEvaluation({
          userId,
          assessmentId,
          competenceId: competence.id
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
                    'type': 'user-tutorial'
                  }
                }
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
            }
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
