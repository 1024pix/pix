const { airtableBuilder, databaseBuilder, expect, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/cache');

const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-get-user-scorecards', () => {

  let options;
  let server;

  beforeEach(async () => {

    // TODO: find the other test that leaks and force us to flush the cache
    cache.flushAll();

    options = {
      method: 'GET',
      url: '/api/users/1234/scorecards',
      payload: {},
      headers: {},
    };
    server = await createServer();
  });

  afterEach(() => {
    airtableBuilder.cleanAll();
    return databaseBuilder.clean();
  });

  after(() => {
    cache.flushAll();
  });

  let area;
  let knowledgeElement;
  let competence;

  describe('GET /users/:id/scorecards', () => {

    describe('Resource access management', () => {

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

    describe('Success case', () => {

      const skillWeb1Id = 'recAcquisWeb1';
      const skillWeb1Name = '@web1';

      const competenceId = 'recCompetence';
      const competenceReference = '1.1 Mener une recherche et une veille d’information';

      beforeEach(async () => {
        options.headers.authorization = generateValidRequestAuhorizationHeader();

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

        knowledgeElement = databaseBuilder.factory.buildSmartPlacementKnowledgeElement({
          userId: 1234,
          competenceId: competence.id,
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
          data: [{
            type: 'scorecards',
            id: `1234_${competence.fields['Sous-domaine']}`,
            attributes: {
              name: competence.fields.Titre,
              index: competence.fields['Sous-domaine'],
              'course-id': competence.fields.courseId,
              'earned-pix': knowledgeElement.earnedPix,
              level: Math.round(knowledgeElement.earnedPix / 8),
              'pix-score-ahead-of-next-level': knowledgeElement.earnedPix,
            },
            relationships: {
              area: {
                data: {
                  id: area.id,
                  type: 'areas'
                }
              },
            },
          }],
          included: [
            {
              attributes: {
                code: area.fields.Code,
                title: area.fields.Titre,
              },
              id: area.id,
              type: 'areas'
            }
          ]
        };

        // then
        return promise.then((response) => {
          expect(response.result.data[0]).to.deep.equal(expectedScorecardJSONApi.data[0]);
          expect(response.result.included).to.deep.equal(expectedScorecardJSONApi.included);
        });
      });
    });
  });
});
