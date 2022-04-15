const {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-anonymize-user', function () {
  describe('POST /admin/users/:id/anonymize', function () {
    it('should anomymize user and remove authentication methods', async function () {
      // given
      const server = await createServer();
      const user = databaseBuilder.factory.buildUser.withRawPassword();
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const options = {
        method: 'POST',
        url: `/api/admin/users/${user.id}/anonymize`,
        payload: {},
        headers: { authorization: generateValidRequestAuthorizationHeader(superAdmin.id) },
      };
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);

      const updatedUserAttributes = response.result.data.attributes;
      const updatedUserRelationships = response.result.data.relationships;
      expect(updatedUserAttributes['first-name']).to.equal(`prenom_${user.id}`);
      expect(updatedUserAttributes['last-name']).to.equal(`nom_${user.id}`);
      expect(updatedUserAttributes.email).to.equal(`email_${user.id}@example.net`);
      expect(updatedUserAttributes.username).to.be.null;

      expect(updatedUserRelationships['authentication-methods'].data).to.be.empty;
    });
  });
});
