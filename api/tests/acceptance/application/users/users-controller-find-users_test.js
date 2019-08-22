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
    databaseBuilder.factory.buildUser({ firstName: 'fn_ok_1', lastName: 'ln_ok_1', email: 'email_ok_1@mail.com' });
    databaseBuilder.factory.buildUser({ firstName: 'fn_ok_2', lastName: 'ln_ok_2', email: 'email_ok_2@mail.com' });

    options = {
      method: 'GET',
      url: '/api/users',
      payload: { },
      headers: { authorization: generateValidRequestAuthorizationHeader(userPixMaster.id) },
    };

    return databaseBuilder.commit();
  });

  afterEach(() => {
    return databaseBuilder.clean();
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

      it('should return a 200 status code response with JSON API serialized SearchResponse', () => {
        // given
        const expectedMetaData = { page: 1, pageSize: 10, itemsCount: 3, pagesCount: 1 };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.result.meta).to.deep.equal(expectedMetaData);
          expect(response.result.data).to.have.lengthOf(3);
          expect(response.result.data[0].type).to.equal('users');
        });
      });
    });
  });
});
