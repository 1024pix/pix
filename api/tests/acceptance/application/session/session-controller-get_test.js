import {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper';

import createServer from '../../../../server';

describe('Acceptance | Controller | session-controller-get', function () {
  let server, options;

  beforeEach(async function () {
    server = await createServer();
    await insertUserWithRoleSuperAdmin();
  });

  describe('GET /api/admin/sessions', function () {
    beforeEach(function () {
      options = {
        method: 'GET',
        url: '/api/admin/sessions',
        payload: {},
      };

      databaseBuilder.factory.buildSession({ id: 121 });
      databaseBuilder.factory.buildSession({ id: 333 });
      return databaseBuilder.commit();
    });

    context('when user is Super Admin', function () {
      beforeEach(function () {
        options.headers = { authorization: generateValidRequestAuthorizationHeader() };
      });

      it('should return a 200 status code response with JSON API serialized', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.have.lengthOf(2);
        expect(response.result.data[0].type).to.equal('sessions');
      });

      it('should return pagination meta data', async function () {
        // given
        const expectedMetaData = { page: 1, pageSize: 10, rowCount: 2, pageCount: 1 };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.meta).to.deep.equal(expectedMetaData);
      });

      it('should return a 200 status code with paginated and filtered data', async function () {
        // given
        options.url = '/api/admin/sessions?filter[id]=121&page[number]=1&page[size]=2';
        const expectedMetaData = { page: 1, pageSize: 2, rowCount: 1, pageCount: 1 };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.meta).to.deep.equal(expectedMetaData);
        expect(response.result.data).to.have.lengthOf(1);
        expect(response.result.data[0].type).to.equal('sessions');
      });

      it('should return a 200 status code with empty result', async function () {
        // given
        options.url = '/api/admin/sessions?filter[id]=4&page[number]=1&page[size]=1';
        const expectedMetaData = { page: 1, pageSize: 1, rowCount: 0, pageCount: 0 };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.meta).to.deep.equal(expectedMetaData);
        expect(response.result.data).to.have.lengthOf(0);
      });

      it('should signal an entity validation error for an ID that is too large', async function () {
        // given
        options.url = '/api/admin/sessions?filter[id]=2147483648';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
      });

      it('should signal an entity validation error for an ID that is too small', async function () {
        // given
        options.url = '/api/admin/sessions?filter[id]=-2147483649';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });

    context('when user is not SuperAdmin', function () {
      beforeEach(function () {
        options.headers = { authorization: generateValidRequestAuthorizationHeader(1111) };
      });

      it('should return 403 HTTP status code ', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not connected', function () {
      it('should return 401 HTTP status code if user is not authenticated', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
