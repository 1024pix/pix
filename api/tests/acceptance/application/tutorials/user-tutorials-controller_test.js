const { expect, generateValidRequestAuthorizationHeader, airtableBuilder, databaseBuilder, knex } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | user-tutorial-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
    await databaseBuilder.factory.buildUser({
      id: 4444,
      firstName: 'Classic',
      lastName: 'Papa',
      email: 'classic.papa@example.net',
      password: 'abcd1234',
    });
    await databaseBuilder.commit();

    const tutorial = airtableBuilder.factory.buildTutorial({ id: 'tutorialId' });
    airtableBuilder.mockList({ tableName: 'Tutoriels' }).returns([tutorial]).activate();
  });

  afterEach(async () => {
    return airtableBuilder.cleanAll();
  });

  describe('PUT /api/users/me/tutorials/{tutorialId}', () => {

    let options;

    beforeEach(async () => {
      options = {
        method: 'PUT',
        url: '/api/users/me/tutorials/tutorialId',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(4444)
        },
      };
    });

    afterEach(async () => {
      return knex('user_tutorials').delete();
    });

    describe('nominal case', () => {
      it('should respond with a 201 and return user-tutorial created', async () => {
        // given
        const expectedUserTutorial = { data: { type: 'user-tutorials', id: '4444_tutorialId' } };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result).to.deep.equal(expectedUserTutorial);
      });
    });

    describe('error cases', () => {
      it('should respond with a 404 - not found when tutorialId does not exist', async () => {
        // given
        options.url = '/api/users/me/tutorials/badId';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

  });

  describe('GET /api/users/me/tutorials', () => {

    let options;

    beforeEach(async () => {
      options = {
        method: 'GET',
        url: '/api/users/me/tutorials',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(4444)
        },
      };
    });

    describe('nominal case', () => {
      it('should respond with a 200 and return tutorials saved by user', async () => {
        // given
        databaseBuilder.factory.buildUserTutorial({ userId: 4444, tutorialId: 'tutorialId' });
        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const expectedUserTutorials = {
          data: [{
            type: 'tutorials',
            id: 'tutorialId',
            attributes: {
              duration: '00:03:31',
              format: 'vidéo',
              link: 'http://www.example.com/this-is-an-example.html',
              source: 'Source Example, Example',
              title: 'Communiquer',
            },
          }]
        };
        expect(response.result).to.deep.equal(expectedUserTutorials);
      });
    });

  });

});
