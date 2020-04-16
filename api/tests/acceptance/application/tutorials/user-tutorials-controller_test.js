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

  describe('PUT /api/users/tutorials/{tutorialId}', () => {

    let options;

    beforeEach(async () => {
      options = {
        method: 'PUT',
        url: '/api/users/tutorials/tutorialId',
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
        const expectedUserTutorial = {
          data: {
            type: 'user-tutorials',
            id: '1',
            attributes: {
              'tutorial-id': 'tutorialId',
              'user-id': 4444,
            }
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.type).to.deep.equal(expectedUserTutorial.data.type);
        expect(response.result.data.id).to.exist;
        expect(response.result.data.attributes['user-id']).to.deep.equal(expectedUserTutorial.data.attributes['user-id']);
        expect(response.result.data.attributes['tutorial-id']).to.deep.equal(expectedUserTutorial.data.attributes['tutorial-id']);
      });
    });

    describe('error cases', () => {
      it('should respond with a 404 - not found when tutorialId does not exist', async () => {
        // given
        options.url = '/api/users/tutorials/badId';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

  });

  describe('GET /api/users/tutorials', () => {

    let options;

    beforeEach(async () => {
      options = {
        method: 'GET',
        url: '/api/users/tutorials',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(4444)
        },
      };
    });

    describe('nominal case', () => {
      it('should respond with a 200 and return tutorials saved by user', async () => {
        // given
        databaseBuilder.factory.buildUserTutorial({ id: 4242, userId: 4444, tutorialId: 'tutorialId' });
        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const expectedUserTutorials = {
          data: [{
            type: 'user-tutorials',
            id: '4242',
            attributes: {
              'user-id': 4444,
              'tutorial-id': 'tutorialId',
            },
            relationships: {
              tutorial: {
                data: {
                  id: 'tutorialId',
                  type: 'tutorials'
                }
              }
            }
          }],
          included: [{
            id: 'tutorialId',
            type: 'tutorials',
            attributes: {
              id: 'tutorialId',
              duration: '00:03:31',
              format: 'vidéo',
              link: 'http://www.example.com/this-is-an-example.html',
              source: 'Source Example, Example',
              title: 'Communiquer',
            },
          }]
        };
        expect(response.result.included).to.deep.equal(expectedUserTutorials.included);
        expect(response.result.data[0].type).to.deep.equal(expectedUserTutorials.data[0].type);
        expect(response.result.data[0].id).to.deep.equal(expectedUserTutorials.data[0].id);
        expect(response.result.data[0].attributes['user-id']).to.deep.equal(expectedUserTutorials.data[0].attributes['user-id']);
        expect(response.result.data[0].attributes['tutorial-id']).to.deep.equal(expectedUserTutorials.data[0].attributes['tutorial-id']);
        expect(response.result.data[0].relationships).to.deep.equal(expectedUserTutorials.data[0].relationships);
      });
    });

  });

  describe('DELETE /api/users/tutorials/{tutorialId}', () => {

    let options;

    beforeEach(async () => {
      options = {
        method: 'DELETE',
        url: '/api/users/tutorials/tutorialId',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(4444)
        },
      };
    });

    describe('nominal case', () => {
      it('should respond with a 204', async () => {
        // given
        databaseBuilder.factory.buildUserTutorial({ userId: 4444, tutorialId: 'tutorialId' });
        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

  });
});
