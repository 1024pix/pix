const {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRolePixMaster,
  knex,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Route | Users', function () {
  afterEach(function () {
    return knex('authentication-methods').delete();
  });

  describe('POST /api/users/{id}/add-pix-authentication-method', function () {
    it('should return 201 HTTP status code and updated user', async function () {
      // given
      const server = await createServer();
      const pixMaster = await insertUserWithRolePixMaster();
      const user = databaseBuilder.factory.buildUser({ email: null });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/users/${user.id}/add-pix-authentication-method`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(pixMaster.id),
        },
        payload: {
          data: {
            id: user.id,
            attributes: {
              email: 'user@example.net',
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.attributes.email).to.equal('user@example.net');
      expect(response.result.included[0].attributes['identity-provider']).to.equal('PIX');
    });
  });
});
