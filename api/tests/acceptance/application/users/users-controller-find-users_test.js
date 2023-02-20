import { expect, generateValidRequestAuthorizationHeader, databaseBuilder } from '../../../test-helper';
import createServer from '../../../../server';

describe('Acceptance | users-controller-find-users', function () {
  let server;
  let options;

  beforeEach(async function () {
    server = await createServer();

    const userSuperAdminId = databaseBuilder.factory.buildUser.withRole({
      firstName: 'SuperAdmin_firstName',
      lastName: 'SuperAdmin_lastName',
    }).id;

    databaseBuilder.factory.buildUser({
      firstName: 'Jean-Paul',
      lastName: 'Grand',
      email: 'jean-paul.grand@example.net',
    });
    databaseBuilder.factory.buildUser({ firstName: 'Jean', lastName: 'Coula', email: 'jean.coula@example.org' });

    options = {
      method: 'GET',
      url: '/api/admin/users',
      headers: { authorization: generateValidRequestAuthorizationHeader(userSuperAdminId) },
    };

    await databaseBuilder.commit();
  });

  describe('GET /users', function () {
    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });

      it('should respond with a 403 - forbidden access - if user has not role Super Admin', function () {
        // given
        const nonSuperAdminUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonSuperAdminUserId);

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });

    describe('Success case', function () {
      it('should return a 200 status code response with JSON API serialized', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.have.lengthOf(3);
        expect(response.result.data[0].type).to.equal('users');
      });

      it('should return pagination meta data', async function () {
        // given
        const expectedMetaData = { page: 1, pageSize: 10, rowCount: 3, pageCount: 1 };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.meta).to.deep.equal(expectedMetaData);
      });

      it('should return a 200 status code with paginated and filtered data', async function () {
        // given
        options.url = '/api/admin/users?filter[firstName]=jean&page[number]=2&page[size]=1';
        const expectedMetaData = { page: 2, pageSize: 1, rowCount: 2, pageCount: 2 };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.meta).to.deep.equal(expectedMetaData);
        expect(response.result.data).to.have.lengthOf(1);
        expect(response.result.data[0].type).to.equal('users');
      });

      it('should return a 200 status code with empty result', async function () {
        // given
        options.url = '/api/admin/users?filter[firstName]=jean&filter[lastName]=jean&page[number]=1&page[size]=1';
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
