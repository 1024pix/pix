const { databaseBuilder, expect, generateValidRequestAuthorizationHeader, insertUserWithRolePixMaster, knex } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-anonymize-user', () => {

  let server;
  let user;
  let options;

  beforeEach(async () => {
    server = await createServer();
    user = databaseBuilder.factory.buildUser();
    const pixMaster = await insertUserWithRolePixMaster();
    options = {
      method: 'POST',
      url: `/api/admin/users/${user.id}/anonymize`,
      payload: {},
      headers: { authorization: generateValidRequestAuthorizationHeader(pixMaster.id) },
    };
    return databaseBuilder.commit();
  });

  describe('POST /admin/users/:id/anonymize', () => {

    it('should return 204', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should update user in Database', async () => {
      // when
      await server.inject(options);

      // then
      const users = await knex.select('*').from('users').where({ id: user.id });
      const updatedUser = users[0];
      expect(updatedUser.firstName).to.equal(`prenom_${user.id}`);
      expect(updatedUser.lastName).to.equal(`nom_${user.id}`);
      expect(updatedUser.email).to.equal(`email_${user.id}@example.net`);
      expect(updatedUser.updatedAt).to.be.above(user.updatedAt);
    });
  });
});
