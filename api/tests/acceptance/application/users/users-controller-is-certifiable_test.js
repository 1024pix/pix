const { airtableBuilder, expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');

describe('Acceptance | users-controller-is-certifiable', () => {

  let server;
  let options;
  let user;

  beforeEach(async () => {
    // create server
    server = await createServer();

    user = databaseBuilder.factory.buildUser();

    const area = airtableBuilder.factory.buildArea();
    airtableBuilder.mockList({ tableName: 'Domaines' })
      .returns([area])
      .activate();

    const competence = airtableBuilder.factory.buildCompetence({
      id: 'recCompetence',
    });
    airtableBuilder.mockList({ tableName: 'Competences' })
      .returns([competence])
      .activate();

    const skill = airtableBuilder.factory.buildSkill({
      compétenceViaTube: [competence.id],
    });
    airtableBuilder.mockList({ tableName: 'Acquis' })
      .returns([skill])
      .activate();

    databaseBuilder.factory.buildKnowledgeElement({ userId: user.id, earnedPix: 10, competenceId: competence.id });

    options = {
      method: 'GET',
      url: `/api/users/${user.id}/is-certifiable`,
      payload: {},
      headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
    };

    return databaseBuilder.commit();
  });

  afterEach(() => {
    return airtableBuilder.cleanAll();
  });

  after(() => {
    return cache.flushAll();
  });

  describe('GET /users/:id/is-certifiable', () => {

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

      it('should return a 200 status code response with JSON API serialized isCertifiable', () => {
        // given
        const expectedResponse = {
          data: {
            attributes: {
              'is-certifiable': false,
            },
            id: `${user.id}`,
            type: 'isCertifiables',
          },
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.deep.equal(expectedResponse);
        });
      });
    });
  });
});
