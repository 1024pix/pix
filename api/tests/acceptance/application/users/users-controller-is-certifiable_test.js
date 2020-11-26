const { expect, generateValidRequestAuthorizationHeader, databaseBuilder, mockLearningContent } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | users-controller-is-certifiable', () => {

  let server;
  let options;
  let user;

  const competenceId = 'recCompetence1';
  const learningContent = {
    areas: [{
      id: 'recvoGdo7z2z7pXWa',
      titleFrFr: 'Information et données',
      color: 'jaffa',
      code: '1',
      competenceIds: [competenceId],
    }],
    competences: [{
      id: competenceId,
      nameFrFr: 'Mener une recherche et une veille d’information',
      index: '1.1',
      origin: 'Pix',
      areaId: 'recvoGdo7z2z7pXWa',
    }],
    skills: [{
      id: 'skillId',
      name: '@web3',
      status: 'actif',
      competenceId: competenceId,
    }],
  };

  beforeEach(async () => {
    // create server
    server = await createServer();

    user = databaseBuilder.factory.buildUser();

    mockLearningContent(learningContent);

    databaseBuilder.factory.buildKnowledgeElement({ userId: user.id, earnedPix: 10, competenceId: competenceId });

    options = {
      method: 'GET',
      url: `/api/users/${user.id}/is-certifiable`,
      payload: {},
      headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
    };

    return databaseBuilder.commit();
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
