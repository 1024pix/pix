const { airtableBuilder, expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');
const cache = require('../../../../lib/infrastructure/caches/cache');

describe('Acceptance | users-controller-get-certification-profile', () => {

  let server;
  let options;
  let user;

  beforeEach(async () => {
    // create server
    server = await createServer();

    user = databaseBuilder.factory.buildUser();

    const competence = airtableBuilder.factory.buildCompetence({
      id: 'recCompetence',
    });

    const area = airtableBuilder.factory.buildArea();

    airtableBuilder.mockList({ tableName: 'Domaines' })
      .returns([area])
      .activate();

    airtableBuilder.mockList({ tableName: 'Competences' })
      .returns([competence])
      .activate();

    databaseBuilder.factory.buildKnowledgeElement({ userId: user.id, earnedPix: 10, competenceId: competence.id, });

    options = {
      method: 'GET',
      url: `/api/users/${user.id}/certification-profile`,
      payload: {},
      headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
    };

    return databaseBuilder.commit();
  });

  afterEach(() => {
    return airtableBuilder.cleanAll();
  });

  after(() => {
    cache.flushAll();
  });

  describe('GET /users/:id/certification-profile', () => {

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

      it('should return a 200 status code response with JSON API serialized CertificationProfile', () => {
        // given
        const certificationProfileExpected = {
          data: {
            attributes: {
              'is-certifiable': false,
            },
            id: `${user.id}`,
            type: 'certificationProfiles'
          }
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.deep.equal(certificationProfileExpected);
        });
      });
    });
  });
});
