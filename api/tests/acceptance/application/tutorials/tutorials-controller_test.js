const { expect, generateValidRequestAuthorizationHeader, airtableBuilder, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | tutorial-controller', () => {

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
  });

  describe('PUT /api/users/me/tutorials/{tutorialId}', () => {

    let options;

    beforeEach(async () => {
      options = {
        method: 'PUT',
        url: '/api/users/me/tutorials/tutorialId',
        headers: {},
      };
    });

    describe('nominal case', () => {
      it('should respond with a 201 and return user-tutorial created', async () => {
        // given
        const expectedUserTutorial = JSON.stringify({ data: { type: 'user-tutorials', id: '4444_tutorialId' } });
        const tutorial = airtableBuilder.factory.buildTutorial({ id: 'tutorialId' });
        options.headers.authorization = generateValidRequestAuthorizationHeader(4444);
        airtableBuilder.mockList({ tableName: 'Tutoriels' }).returns([tutorial]).activate();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.payload).to.deep.equal(expectedUserTutorial);
      });
    });

    describe('error cases', () => {
      it('should respond with a 404 - not found when tutorialId does not exist', async () => {
        // given
        const tutorial = airtableBuilder.factory.buildTutorial({ id: 'tutorialId' });
        options.headers.authorization = generateValidRequestAuthorizationHeader(4444);
        airtableBuilder.mockList({ tableName: 'Tutoriels' }).returns([tutorial]).activate();
        options.url = '/api/users/me/tutorials/badId';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

  });

});
