const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | users-controller-find-users', () => {

  let server;
  let options;

  beforeEach(async () => {
    // create server
    server = await createServer();

    // Insert 1 user with role PixMaster
    const userPixMaster = databaseBuilder.factory.buildUser.withPixRolePixMaster();

    // Insert 2 more users
    databaseBuilder.factory.buildUser({ firstName: 'Jean-Paul', lastName: 'Grand', email: 'jean-paul.grand@example.net' });
    databaseBuilder.factory.buildUser({ firstName: 'Jean', lastName: 'Coula', email: 'jean.coula@example.org' });

    options = {
      method: 'GET',
      url: '/api/users',
      payload: { },
      headers: { authorization: generateValidRequestAuthorizationHeader(userPixMaster.id) },
    };

    return databaseBuilder.commit();
  });

  describe('GET /users', () => {

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

      it('should respond with a 403 - forbidden access - if user has not role PIX_MASTER', () => {
        // given
        const nonPixMAsterUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonPixMAsterUserId);

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });

    describe('Success case', () => {

      it('should return a 200 status code response with JSON API serialized', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.have.lengthOf(3);
        expect(response.result.data[0].type).to.equal('users');
      });

      it('should return pagination meta data', async () => {
        // given
        const expectedMetaData = { page: 1, pageSize: 10, rowCount: 3, pageCount: 1 };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.meta).to.deep.equal(expectedMetaData);
      });

      it('should return a 200 status code with paginated and filtered data', async () => {
        // given
        options.url = '/api/users?filter[firstName]=jean&page[number]=2&page[size]=1';
        const expectedMetaData = { page: 2, pageSize: 1, rowCount: 2, pageCount: 2 };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.meta).to.deep.equal(expectedMetaData);
        expect(response.result.data).to.have.lengthOf(1);
        expect(response.result.data[0].type).to.equal('users');
      });

      it('should return a 200 status code with empty result', async () => {
        // given
        options.url = '/api/users?filter[firstName]=jean&filter[lastName]=jean&page[number]=1&page[size]=1';
        const expectedMetaData = { page: 1, pageSize: 1, rowCount: 0, pageCount: 0 };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.meta).to.deep.equal(expectedMetaData);
        expect(response.result.data).to.have.lengthOf(0);
      });
    });
  });
});
